import { Injectable, BadRequestException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { UploadFileResponseDto } from './dto/upload-file.dto';
import * as path from 'path';
import * as fs from 'fs';

@Injectable()
export class UploadService {
  private readonly uploadPath: string;
  private readonly maxFileSize: number;
  private readonly allowedMimeTypes: string[];

  constructor(private configService: ConfigService) {
    this.uploadPath = path.join(process.cwd(), 'uploads');
    this.maxFileSize = 10 * 1024 * 1024; // 10MB
    this.allowedMimeTypes = [
      'image/jpeg',
      'image/jpg', 
      'image/png',
      'image/gif',
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'text/plain'
    ];

    // Ensure upload directory exists
    this.ensureUploadDirectory();
  }

  private ensureUploadDirectory() {
    if (!fs.existsSync(this.uploadPath)) {
      fs.mkdirSync(this.uploadPath, { recursive: true });
    }
  }

  private generateUniqueFilename(originalName: string): string {
    const ext = path.extname(originalName);
    const name = path.basename(originalName, ext);
    const timestamp = Date.now();
    const random = Math.random().toString(36).substring(2, 8);
    return `${name}_${timestamp}_${random}${ext}`;
  }

  private validateFile(file: Express.Multer.File): void {
    if (!file) {
      throw new BadRequestException('No file provided');
    }

    if (file.size > this.maxFileSize) {
      throw new BadRequestException(`File size exceeds maximum allowed size of ${this.maxFileSize / (1024 * 1024)}MB`);
    }

    if (!this.allowedMimeTypes.includes(file.mimetype)) {
      throw new BadRequestException(`File type ${file.mimetype} is not allowed`);
    }
  }

  async uploadFile(file: Express.Multer.File): Promise<UploadFileResponseDto> {
    this.validateFile(file);

    const uniqueFilename = this.generateUniqueFilename(file.originalname);
    const filePath = path.join(this.uploadPath, uniqueFilename);

    // Save file to disk
    fs.writeFileSync(filePath, file.buffer);

    const baseUrl = this.configService.get('BASE_URL', 'http://localhost:8000');
    const fileUrl = `${baseUrl}/uploads/${uniqueFilename}`;

    return {
      filename: uniqueFilename,
      url: fileUrl,
      size: file.size,
      mimetype: file.mimetype,
    };
  }

  async uploadMultipleFiles(files: Express.Multer.File[]): Promise<UploadFileResponseDto[]> {
    if (!files || files.length === 0) {
      throw new BadRequestException('No files provided');
    }

    if (files.length > 5) {
      throw new BadRequestException('Maximum 5 files allowed per upload');
    }

    const uploadPromises = files.map(file => this.uploadFile(file));
    return Promise.all(uploadPromises);
  }

  async deleteFile(filename: string): Promise<void> {
    const filePath = path.join(this.uploadPath, filename);
    
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }
  }
}
