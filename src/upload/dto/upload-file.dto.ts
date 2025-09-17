import { ApiProperty } from '@nestjs/swagger';

export class UploadFileResponseDto {
  @ApiProperty({ description: 'File name that can be used in form submissions' })
  filename: string;

  @ApiProperty({ description: 'File URL for accessing the uploaded file' })
  url: string;

  @ApiProperty({ description: 'File size in bytes' })
  size: number;

  @ApiProperty({ description: 'File MIME type' })
  mimetype: string;
}
