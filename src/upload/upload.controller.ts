import { Controller, Post, Get, UseInterceptors, UploadedFile, UploadedFiles, UseGuards, Delete, Param, SetMetadata } from '@nestjs/common';
import { FileInterceptor, FilesInterceptor } from '@nestjs/platform-express';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiConsumes, ApiParam } from '@nestjs/swagger';
import { UploadService } from './upload.service';
import { UploadFileResponseDto } from './dto/upload-file.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

// Create a custom decorator to mark endpoints as public
export const Public = () => SetMetadata('isPublic', true);

@ApiTags('Upload')
@Controller('upload')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth('JWT-auth')
export class UploadController {
  constructor(private readonly uploadService: UploadService) {}

  @Get('test')
  @ApiOperation({ summary: 'Test upload endpoint' })
  @ApiResponse({ status: 200, description: 'Upload endpoint is working' })
  testUpload() {
    return { message: 'Upload endpoint is working', timestamp: new Date().toISOString() };
  }

  @Post('single')
  @Public()
  @UseInterceptors(FileInterceptor('file'))
  @ApiOperation({ summary: 'Upload a single file (public for signup)' })
  @ApiConsumes('multipart/form-data')
  @ApiResponse({ status: 201, description: 'File uploaded successfully', type: UploadFileResponseDto })
  @ApiResponse({ status: 400, description: 'Bad request - invalid file' })
  async uploadFile(@UploadedFile() file: Express.Multer.File): Promise<UploadFileResponseDto> {
    return this.uploadService.uploadFile(file);
  }

  @Post('multiple')
  @UseInterceptors(FilesInterceptor('files', 5)) // Maximum 5 files
  @ApiOperation({ summary: 'Upload multiple files' })
  @ApiConsumes('multipart/form-data')
  @ApiResponse({ status: 201, description: 'Files uploaded successfully', type: [UploadFileResponseDto] })
  @ApiResponse({ status: 400, description: 'Bad request - invalid files' })
  async uploadMultipleFiles(@UploadedFiles() files: Express.Multer.File[]): Promise<UploadFileResponseDto[]> {
    return this.uploadService.uploadMultipleFiles(files);
  }

  @Delete(':filename')
  @ApiOperation({ summary: 'Delete an uploaded file' })
  @ApiParam({ name: 'filename', description: 'Name of the file to delete' })
  @ApiResponse({ status: 200, description: 'File deleted successfully' })
  @ApiResponse({ status: 404, description: 'File not found' })
  async deleteFile(@Param('filename') filename: string): Promise<{ message: string }> {
    await this.uploadService.deleteFile(filename);
    return { message: 'File deleted successfully' };
  }
}
