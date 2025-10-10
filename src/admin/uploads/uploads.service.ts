import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { CreateUploadDto, UpdateUploadDto, UploadResponseDto, UploadListResponseDto } from './dto/upload.dto';
import { S3Client, PutObjectCommand, DeleteObjectCommand, GetObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { v4 as uuidv4 } from 'uuid';
import * as path from 'path';

@Injectable()
export class UploadsService {
  private readonly s3Client: S3Client;
  private readonly bucketName: string;

  constructor(private prisma: PrismaService) {
    this.s3Client = new S3Client({
      region: process.env.AWS_REGION,
      credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
      },
    });
    this.bucketName = process.env.AWS_S3_BUCKET;
  }

  async uploadFile(
    file: Express.Multer.File,
    userId: string,
    createUploadDto?: CreateUploadDto
  ): Promise<UploadResponseDto> {
    if (!file) {
      throw new BadRequestException('No file uploaded');
    }

    // Generate unique filename
    const fileExtension = path.extname(file.originalname);
    const uniqueFilename = `${uuidv4()}${fileExtension}`;
    const s3Key = `uploads/${uniqueFilename}`;

    try {
      // Upload file to S3
      const uploadCommand = new PutObjectCommand({
        Bucket: this.bucketName,
        Key: s3Key,
        Body: file.buffer,
        ContentType: file.mimetype,
        Metadata: {
          originalName: file.originalname,
          uploadedBy: userId,
        },
      });

      await this.s3Client.send(uploadCommand);

      // Create database record
      const upload = await this.prisma.upload.create({
        data: {
          filename: uniqueFilename,
          originalName: file.originalname,
          mimeType: file.mimetype,
          size: file.size,
          path: s3Key, // Store S3 key instead of local path
          url: `https://${this.bucketName}.s3.${process.env.AWS_REGION}.amazonaws.com/${s3Key}`,
          uploadedBy: userId,
          description: createUploadDto?.description,
          tags: createUploadDto?.tags || [],
        },
      });

      return this.mapToResponseDto(upload);
    } catch (error) {
      console.error('S3 upload error:', error);
      throw new BadRequestException('Failed to upload file to S3');
    }
  }

  async uploadMultipleFiles(
    files: Express.Multer.File[],
    userId: string,
    createUploadDto?: CreateUploadDto
  ): Promise<UploadResponseDto[]> {
    if (!files || files.length === 0) {
      throw new BadRequestException('No files uploaded');
    }

    const uploads: UploadResponseDto[] = [];

    for (const file of files) {
      try {
        const upload = await this.uploadFile(file, userId, createUploadDto);
        uploads.push(upload);
      } catch (error) {
        // Continue with other files if one fails
        console.error(`Failed to upload file ${file.originalname}:`, error);
      }
    }

    if (uploads.length === 0) {
      throw new BadRequestException('Failed to upload any files');
    }

    return uploads;
  }

  async findAll(
    page: number = 1,
    limit: number = 10,
    search?: string,
    tags?: string[],
    isActive?: boolean
  ): Promise<UploadListResponseDto> {
    const skip = (page - 1) * limit;

    const where: any = {};

    if (search) {
      where.OR = [
        { originalName: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
      ];
    }

    if (tags && tags.length > 0) {
      where.tags = { hasSome: tags };
    }

    if (isActive !== undefined) {
      where.isActive = isActive;
    }

    const [uploads, total] = await Promise.all([
      this.prisma.upload.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.upload.count({ where }),
    ]);

    return {
      uploads: uploads.map(upload => this.mapToResponseDto(upload)),
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  async findOne(id: string): Promise<UploadResponseDto> {
    const upload = await this.prisma.upload.findUnique({
      where: { id },
    });

    if (!upload) {
      throw new NotFoundException('Upload not found');
    }

    return this.mapToResponseDto(upload);
  }

  async update(id: string, updateUploadDto: UpdateUploadDto): Promise<UploadResponseDto> {
    const upload = await this.prisma.upload.findUnique({
      where: { id },
    });

    if (!upload) {
      throw new NotFoundException('Upload not found');
    }

    const updatedUpload = await this.prisma.upload.update({
      where: { id },
      data: updateUploadDto,
    });

    return this.mapToResponseDto(updatedUpload);
  }

  async remove(id: string): Promise<void> {
    const upload = await this.prisma.upload.findUnique({
      where: { id },
    });

    if (!upload) {
      throw new NotFoundException('Upload not found');
    }

    try {
      // Delete file from S3
      const deleteCommand = new DeleteObjectCommand({
        Bucket: this.bucketName,
        Key: upload.path, // S3 key stored in path field
      });

      await this.s3Client.send(deleteCommand);

      // Delete from database
      await this.prisma.upload.delete({
        where: { id },
      });
    } catch (error) {
      console.error('S3 delete error:', error);
      throw new BadRequestException('Failed to delete file from S3');
    }
  }

  async getFileStream(id: string): Promise<{ stream: any; filename: string; mimeType: string }> {
    const upload = await this.prisma.upload.findUnique({
      where: { id },
    });

    if (!upload) {
      throw new NotFoundException('Upload not found');
    }

    try {
      // Get file from S3
      const getCommand = new GetObjectCommand({
        Bucket: this.bucketName,
        Key: upload.path, // S3 key stored in path field
      });

      const response = await this.s3Client.send(getCommand);

      return {
        stream: response.Body,
        filename: upload.originalName,
        mimeType: upload.mimeType,
      };
    } catch (error) {
      console.error('S3 get error:', error);
      throw new NotFoundException('File not found in S3');
    }
  }

  async getSignedDownloadUrl(id: string, expiresIn: number = 3600): Promise<string> {
    const upload = await this.prisma.upload.findUnique({
      where: { id },
    });

    if (!upload) {
      throw new NotFoundException('Upload not found');
    }

    try {
      const getCommand = new GetObjectCommand({
        Bucket: this.bucketName,
        Key: upload.path,
      });

      return await getSignedUrl(this.s3Client, getCommand, { expiresIn });
    } catch (error) {
      console.error('S3 signed URL error:', error);
      throw new BadRequestException('Failed to generate download URL');
    }
  }

  private mapToResponseDto(upload: any): UploadResponseDto {
    return {
      id: upload.id,
      filename: upload.filename,
      originalName: upload.originalName,
      mimeType: upload.mimeType,
      size: upload.size,
      path: upload.path,
      url: upload.url,
      uploadedBy: upload.uploadedBy,
      uploadedAt: upload.uploadedAt,
      description: upload.description,
      tags: upload.tags,
      isActive: upload.isActive,
      createdAt: upload.createdAt,
      updatedAt: upload.updatedAt,
    };
  }
}
