# AWS S3 Integration Documentation

## Overview

The NexGPetrolube Backend API uses AWS S3 for all file storage operations, providing scalable, secure, and reliable file management across the platform.

## Configuration

### Environment Variables

```env
# AWS S3 Configuration
AWS_ACCESS_KEY_ID=your_access_key_id
AWS_SECRET_ACCESS_KEY=your_secret_access_key
AWS_REGION=ap-south-1
AWS_S3_BUCKET=nexg-project-uploads
```

### S3 Bucket Structure

```
nexg-project-uploads/
├── uploads/           # General file uploads
├── products/          # Product images from CSV processing
├── kyc/              # KYC documents
├── profiles/         # User profile images
└── logistics/        # Logistics documents
```

## Upload Endpoints

### 1. General File Upload (`/api/v1/upload/single`)

**Purpose**: Upload single files for general use
**Storage**: `uploads/{uuid}.{ext}`
**Response**: Direct S3 URL

```http
POST /api/v1/upload/single
Content-Type: multipart/form-data

file: [binary file data]
```

**Response**:
```json
{
  "filename": "uuid-generated-filename.jpg",
  "url": "https://bucket.s3.region.amazonaws.com/uploads/uuid-generated-filename.jpg",
  "size": 1024000,
  "mimetype": "image/jpeg"
}
```

### 2. Admin File Uploads (`/api/v1/admin/uploads/upload`)

**Purpose**: Admin file management with metadata
**Storage**: `uploads/{uuid}.{ext}`
**Features**: Metadata storage, signed URLs, file management

```http
POST /api/v1/admin/uploads/upload
Content-Type: multipart/form-data

file: [binary file data]
description: "File description"
tags: ["tag1", "tag2"]
```

**Response**:
```json
{
  "id": "upload-id",
  "filename": "uuid-generated-filename.jpg",
  "originalName": "original-filename.jpg",
  "url": "https://bucket.s3.region.amazonaws.com/uploads/uuid-generated-filename.jpg",
  "size": 1024000,
  "mimeType": "image/jpeg",
  "uploadedBy": "admin-id",
  "description": "File description",
  "tags": ["tag1", "tag2"],
  "isActive": true,
  "createdAt": "2024-01-01T00:00:00.000Z"
}
```

### 3. CSV Upload with Image Processing (`/api/v1/admin/products/upload-csv`)

**Purpose**: Bulk product upload with automatic image processing
**Storage**: `products/{uuid}.{ext}`
**Features**: Automatic image download and S3 upload

**CSV Format**:
```csv
name,description,categoryName,subcategoryName,brandName,isActive,images,specifications_viscosity100C
"Product Name","Product Description",CATEGORY,SUBCATEGORY,BRAND,TRUE,"https://example.com/image1.jpg;https://example.com/image2.jpg",22
```

**Process**:
1. Parse CSV and extract image URLs from `images` column
2. Download images from provided URLs
3. Upload to S3 with unique filenames
4. Store S3 URLs in product's `images` field
5. Create products with processed images

## Security Features

### Signed URLs

For secure file access, use signed URLs with expiration:

```http
GET /api/v1/admin/uploads/{id}/signed-url?expiresIn=3600
```

**Response**:
```json
{
  "url": "https://bucket.s3.region.amazonaws.com/uploads/filename.jpg?X-Amz-Algorithm=AWS4-HMAC-SHA256&X-Amz-Credential=..."
}
```

### File Access Control

- **Public Access**: Direct S3 URLs for general files
- **Signed URLs**: Time-limited access for sensitive files
- **Admin Only**: Admin uploads require authentication
- **Metadata Tracking**: All uploads tracked with user and metadata

## File Management

### Supported File Types

- **Images**: JPEG, PNG, GIF, WebP
- **Documents**: PDF, DOC, DOCX, TXT
- **Data**: CSV files for bulk operations

### File Size Limits

- **General Uploads**: 10MB maximum
- **CSV Files**: 10MB maximum
- **Image Processing**: No limit (handled per image)

### File Naming Convention

- **Format**: `{uuid}.{original_extension}`
- **Uniqueness**: UUID ensures no filename conflicts
- **Organization**: Folders organize files by purpose

## Error Handling

### Common Errors

1. **S3 Connection Error**: Check AWS credentials and region
2. **File Size Exceeded**: Reduce file size or increase limits
3. **Invalid File Type**: Use supported file formats
4. **Image Download Failed**: Check image URL accessibility

### Error Response Format

```json
{
  "statusCode": 400,
  "message": "File size too large. Maximum allowed size is 10MB",
  "error": "Bad Request"
}
```

## Performance Considerations

### Optimization Strategies

1. **Parallel Processing**: Multiple images processed simultaneously
2. **Timeout Handling**: 10-second timeout for image downloads
3. **Error Recovery**: Continue processing if individual images fail
4. **Caching**: S3 URLs cached for performance

### Monitoring

- **Upload Success Rate**: Track successful uploads
- **Processing Time**: Monitor image processing duration
- **Error Rates**: Track and analyze upload failures
- **Storage Usage**: Monitor S3 bucket usage and costs

## Migration from Local Storage

### Changes Made

1. **Updated Services**: All upload services now use S3
2. **URL Format**: Changed from local paths to S3 URLs
3. **Database Storage**: Store S3 URLs instead of local paths
4. **File Access**: Direct S3 access instead of local file serving

### Backward Compatibility

- **Existing URLs**: Old local URLs may still work if files exist
- **API Responses**: Same response format, different URL structure
- **Frontend**: No changes required for existing implementations

## Best Practices

### File Organization

1. **Use Folders**: Organize files by purpose (uploads/, products/, etc.)
2. **Consistent Naming**: Use UUID for unique filenames
3. **Metadata**: Store file metadata in database for management
4. **Cleanup**: Implement file cleanup for unused uploads

### Security

1. **Access Control**: Use signed URLs for sensitive files
2. **File Validation**: Validate file types and sizes
3. **User Tracking**: Track who uploaded what files
4. **Audit Logs**: Log all file operations for security

### Performance

1. **CDN Integration**: Consider CloudFront for global distribution
2. **Image Optimization**: Implement image compression
3. **Lazy Loading**: Load images on demand
4. **Caching**: Cache frequently accessed files
