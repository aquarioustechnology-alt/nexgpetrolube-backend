import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
  UseInterceptors,
  UploadedFile,
  UploadedFiles,
  Res,
  UseGuards,
  Request,
} from '@nestjs/common';
import { FileInterceptor, FilesInterceptor } from '@nestjs/platform-express';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiConsumes, ApiQuery } from '@nestjs/swagger';
import { Response } from 'express';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { AdminAuthGuard } from '../common/guards/admin-auth.guard';
import { UploadsService } from './uploads.service';
import { CreateUploadDto, UpdateUploadDto, UploadResponseDto, UploadListResponseDto } from './dto/upload.dto';

@ApiTags('Admin - Uploads')
@Controller('admin/uploads')
@UseGuards(JwtAuthGuard, AdminAuthGuard)
@ApiBearerAuth()
export class UploadsController {
  constructor(private readonly uploadsService: UploadsService) {}

  @Post('upload')
  @UseInterceptors(FileInterceptor('file'))
  @ApiConsumes('multipart/form-data')
  @ApiOperation({ summary: 'Upload a single file' })
  @ApiResponse({ status: 201, description: 'File uploaded successfully', type: UploadResponseDto })
  async uploadFile(
    @UploadedFile() file: Express.Multer.File,
    @Body() createUploadDto: CreateUploadDto,
    @Request() req,
  ): Promise<UploadResponseDto> {
    return this.uploadsService.uploadFile(file, req.user.sub, createUploadDto);
  }

  @Post('upload-multiple')
  @UseInterceptors(FilesInterceptor('files', 10))
  @ApiConsumes('multipart/form-data')
  @ApiOperation({ summary: 'Upload multiple files' })
  @ApiResponse({ status: 201, description: 'Files uploaded successfully', type: [UploadResponseDto] })
  async uploadMultipleFiles(
    @UploadedFiles() files: Express.Multer.File[],
    @Body() createUploadDto: CreateUploadDto,
    @Request() req,
  ): Promise<UploadResponseDto[]> {
    return this.uploadsService.uploadMultipleFiles(files, req.user.sub, createUploadDto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all uploads with pagination and filters' })
  @ApiResponse({ status: 200, description: 'Uploads retrieved successfully', type: UploadListResponseDto })
  @ApiQuery({ name: 'page', required: false, type: Number, description: 'Page number (default: 1)' })
  @ApiQuery({ name: 'limit', required: false, type: Number, description: 'Items per page (default: 10)' })
  @ApiQuery({ name: 'search', required: false, type: String, description: 'Search in filename and description' })
  @ApiQuery({ name: 'tags', required: false, type: [String], description: 'Filter by tags' })
  @ApiQuery({ name: 'isActive', required: false, type: Boolean, description: 'Filter by active status' })
  async findAll(
    @Query('page') page?: string,
    @Query('limit') limit?: string,
    @Query('search') search?: string,
    @Query('tags') tags?: string | string[],
    @Query('isActive') isActive?: string,
  ): Promise<UploadListResponseDto> {
    const pageNum = page ? parseInt(page, 10) : 1;
    const limitNum = limit ? parseInt(limit, 10) : 10;
    const tagsArray = Array.isArray(tags) ? tags : tags ? [tags] : undefined;
    const isActiveBool = isActive ? isActive === 'true' : undefined;

    return this.uploadsService.findAll(pageNum, limitNum, search, tagsArray, isActiveBool);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get upload by ID' })
  @ApiResponse({ status: 200, description: 'Upload retrieved successfully', type: UploadResponseDto })
  async findOne(@Param('id') id: string): Promise<UploadResponseDto> {
    return this.uploadsService.findOne(id);
  }

  @Get(':id/download')
  @ApiOperation({ summary: 'Download file by ID' })
  @ApiResponse({ status: 200, description: 'File downloaded successfully' })
  async downloadFile(@Param('id') id: string, @Res() res: Response): Promise<void> {
    const { stream, filename, mimeType } = await this.uploadsService.getFileStream(id);
    
    res.setHeader('Content-Type', mimeType);
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    
    // Convert S3 stream to readable stream
    if (stream && typeof stream.transformToByteArray === 'function') {
      const chunks = [];
      for await (const chunk of stream) {
        chunks.push(chunk);
      }
      const buffer = Buffer.concat(chunks);
      res.send(buffer);
    } else {
      stream.pipe(res);
    }
  }

  @Get(':id/signed-url')
  @ApiOperation({ summary: 'Get signed download URL for file' })
  @ApiResponse({ status: 200, description: 'Signed URL generated successfully' })
  @ApiQuery({ name: 'expiresIn', required: false, type: Number, description: 'URL expiration time in seconds (default: 3600)' })
  async getSignedDownloadUrl(
    @Param('id') id: string,
    @Query('expiresIn') expiresIn?: string,
  ): Promise<{ url: string }> {
    const expiresInSeconds = expiresIn ? parseInt(expiresIn, 10) : 3600;
    const url = await this.uploadsService.getSignedDownloadUrl(id, expiresInSeconds);
    return { url };
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update upload metadata' })
  @ApiResponse({ status: 200, description: 'Upload updated successfully', type: UploadResponseDto })
  async update(
    @Param('id') id: string,
    @Body() updateUploadDto: UpdateUploadDto,
  ): Promise<UploadResponseDto> {
    return this.uploadsService.update(id, updateUploadDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete upload' })
  @ApiResponse({ status: 200, description: 'Upload deleted successfully' })
  async remove(@Param('id') id: string): Promise<{ message: string }> {
    await this.uploadsService.remove(id);
    return { message: 'Upload deleted successfully' };
  }
}
