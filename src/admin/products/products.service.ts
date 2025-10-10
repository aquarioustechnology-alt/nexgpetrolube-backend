import { Injectable, NotFoundException, ConflictException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { ProductListingDto } from './dto/product-listing.dto';
import { ProductResponseDto } from './dto/product-response.dto';
import { ProductSortBy } from './dto/product-listing.dto';
import { CsvUploadResponseDto, CsvProductDto } from './dto/csv-upload.dto';
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import { v4 as uuidv4 } from 'uuid';
import * as path from 'path';
import axios from 'axios';
import { Express } from 'express';
import multer from 'multer';

@Injectable()
export class AdminProductsService {
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

  async create(createProductDto: CreateProductDto): Promise<ProductResponseDto> {
    // Check if product name already exists
    const existingProduct = await this.prisma.product.findFirst({
      where: {
        name: createProductDto.name,
      },
    });

    if (existingProduct) {
      throw new ConflictException('Product with this name already exists');
    }

    // Verify category exists
    const category = await this.prisma.category.findUnique({
      where: { id: createProductDto.categoryId },
    });

    if (!category) {
      throw new NotFoundException('Category not found');
    }

    // Verify subcategory exists if provided
    if (createProductDto.subcategoryId) {
      const subcategory = await this.prisma.category.findUnique({
        where: { 
          id: createProductDto.subcategoryId,
          parentId: { not: null } // Ensure it's actually a subcategory
        },
      });

      if (!subcategory) {
        throw new NotFoundException('Subcategory not found');
      }

      // Verify the subcategory belongs to the selected category
      if (subcategory.parentId !== createProductDto.categoryId) {
        throw new NotFoundException('Subcategory does not belong to the selected category');
      }
    }

    // Verify brand exists if provided
    if (createProductDto.brandId) {
      const brand = await this.prisma.brand.findUnique({
        where: { id: createProductDto.brandId },
      });

      if (!brand) {
        throw new NotFoundException('Brand not found');
      }
    }

    const product = await this.prisma.product.create({
      data: {
        name: createProductDto.name,
        description: createProductDto.description,
        keyFeatures: createProductDto.keyFeatures,
        specifications: createProductDto.specifications,
        images: createProductDto.images || [],
        categoryId: createProductDto.categoryId,
        subcategoryId: createProductDto.subcategoryId,
        brandId: createProductDto.brandId,
        isActive: createProductDto.isActive ?? true,
      },
      include: {
        category: true,
        subcategory: true,
        brand: true,
      },
    });

    return this.mapToResponseDto(product);
  }

  async findAll(query: ProductListingDto) {
    const {
      search,
      isActive,
      categoryId,
      subcategoryId,
      brandId,
      page = 1,
      limit = 10,
      sortBy = ProductSortBy.NAME,
      sortOrder = 'asc',
    } = query;

    const skip = (page - 1) * limit;

    // Build where clause
    const where: any = {};

    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
      ];
    }

    if (isActive !== undefined) {
      where.isActive = isActive;
    }

    if (categoryId) {
      where.categoryId = categoryId;
    }

    if (subcategoryId) {
      where.subcategoryId = subcategoryId;
    }

    if (brandId) {
      where.brandId = brandId;
    }

    // Build orderBy clause
    const orderBy: any = {};
    orderBy[sortBy] = sortOrder;

    const [products, total] = await Promise.all([
      this.prisma.product.findMany({
        where,
        skip,
        take: limit,
        orderBy,
        include: {
          category: true,
          subcategory: true,
          brand: true,
        },
      }),
      this.prisma.product.count({ where }),
    ]);

    return {
      data: products.map(product => this.mapToResponseDto(product)),
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async findOne(id: string): Promise<ProductResponseDto> {
    const product = await this.prisma.product.findUnique({
      where: { id },
      include: {
        category: true,
        subcategory: true,
        brand: true,
      },
    });

    if (!product) {
      throw new NotFoundException('Product not found');
    }

    return this.mapToResponseDto(product);
  }

  async update(id: string, updateProductDto: UpdateProductDto): Promise<ProductResponseDto> {
    // Check if product exists
    const existingProduct = await this.prisma.product.findUnique({
      where: { id },
    });

    if (!existingProduct) {
      throw new NotFoundException('Product not found');
    }

    // If name is being updated, check for conflicts
    if (updateProductDto.name && updateProductDto.name !== existingProduct.name) {
      const conflictingProduct = await this.prisma.product.findFirst({
        where: {
          name: updateProductDto.name,
          id: { not: id },
        },
      });

      if (conflictingProduct) {
        throw new ConflictException('Product with this name already exists');
      }
    }

    // Verify category exists if being updated
    if (updateProductDto.categoryId) {
      const category = await this.prisma.category.findUnique({
        where: { id: updateProductDto.categoryId },
      });

      if (!category) {
        throw new NotFoundException('Category not found');
      }
    }

    // Verify subcategory exists if being updated
    if (updateProductDto.subcategoryId) {
      const subcategory = await this.prisma.category.findUnique({
        where: { 
          id: updateProductDto.subcategoryId,
          parentId: { not: null } // Ensure it's actually a subcategory
        },
      });

      if (!subcategory) {
        throw new NotFoundException('Subcategory not found');
      }

      // Verify the subcategory belongs to the selected category
      const categoryId = updateProductDto.categoryId || existingProduct.categoryId;
      if (subcategory.parentId !== categoryId) {
        throw new NotFoundException('Subcategory does not belong to the selected category');
      }
    }

    // Verify brand exists if being updated
    if (updateProductDto.brandId) {
      const brand = await this.prisma.brand.findUnique({
        where: { id: updateProductDto.brandId },
      });

      if (!brand) {
        throw new NotFoundException('Brand not found');
      }
    }

    const product = await this.prisma.product.update({
      where: { id },
      data: updateProductDto,
      include: {
        category: true,
        subcategory: true,
        brand: true,
      },
    });

    return this.mapToResponseDto(product);
  }

  async remove(id: string): Promise<void> {
    const product = await this.prisma.product.findUnique({
      where: { id },
    });

    if (!product) {
      throw new NotFoundException('Product not found');
    }

    await this.prisma.product.delete({
      where: { id },
    });
  }

  async uploadCsv(file: any): Promise<CsvUploadResponseDto> {
    if (!file) {
      throw new BadRequestException('No file uploaded');
    }

    if (!file.originalname.toLowerCase().endsWith('.csv')) {
      throw new BadRequestException('File must be a CSV');
    }

    // Validate file size (max 10MB)
    if (file.size > 10 * 1024 * 1024) {
      throw new BadRequestException('File size too large. Maximum allowed size is 10MB');
    }

    try {
      const csvContent = file.buffer.toString('utf-8');
      
      // Validate CSV content is not empty
      if (!csvContent.trim()) {
        throw new BadRequestException('CSV file is empty');
      }
      
      const products = this.parseCsv(csvContent);
      
      const result: CsvUploadResponseDto = {
        successCount: 0,
        errorCount: 0,
        errors: [],
        createdProducts: [],
      };

      for (const productData of products) {
        try {
          const createdProduct = await this.createProductFromCsv(productData);
          result.successCount++;
          result.createdProducts.push(createdProduct.name);
        } catch (error) {
          result.errorCount++;
          result.errors.push(`Product "${productData.name}": ${error.message}`);
        }
      }

      return result;
    } catch (error) {
      throw new BadRequestException(`Failed to process CSV: ${error.message}`);
    }
  }

  private parseCsv(csvContent: string): CsvProductDto[] {
    const lines = csvContent.split('\n').filter(line => line.trim());
    if (lines.length < 2) {
      throw new BadRequestException('CSV must have at least a header and one data row');
    }

    const headers = lines[0].split(',').map(h => h.trim().replace(/"/g, ''));
    const products: CsvProductDto[] = [];

    for (let i = 1; i < lines.length; i++) {
      const values = this.parseCsvLine(lines[i]);
      if (values.length !== headers.length) {
        throw new BadRequestException(`Row ${i + 1} has ${values.length} columns but expected ${headers.length}`);
      }

      const productData: any = {};
      headers.forEach((header, index) => {
        productData[header] = values[index];
      });

      // Convert specifications columns to specifications array
      const specifications: Array<{ type: string; value: string }> = [];
      Object.keys(productData).forEach(key => {
        if (key.startsWith('specifications_') && productData[key] && productData[key].trim() !== '') {
          const specType = key.replace('specifications_', '');
          specifications.push({
            type: specType,
            value: productData[key]
          });
        }
      });

      // Convert isActive to boolean
      const isActive = productData.isActive?.toLowerCase() === 'true' || productData.isActive === 'TRUE';

      // Parse images from semicolon-separated string
      const images = productData.images ? 
        productData.images.split(';').map(url => url.trim()).filter(url => url.length > 0) : 
        [];

      products.push({
        name: productData.name,
        description: productData.description || undefined,
        keyFeatures: productData.keyFeatures || undefined,
        categoryName: productData.categoryName,
        subcategoryName: productData.subcategoryName,
        brandName: productData.brandName || undefined,
        isActive: isActive,
        specifications: specifications.length > 0 ? specifications : undefined,
        images: images,
      });
    }

    return products;
  }

  private parseCsvLine(line: string): string[] {
    const result: string[] = [];
    let current = '';
    let inQuotes = false;
    
    for (let i = 0; i < line.length; i++) {
      const char = line[i];
      
      if (char === '"') {
        inQuotes = !inQuotes;
      } else if (char === ',' && !inQuotes) {
        result.push(current.trim());
        current = '';
      } else {
        current += char;
      }
    }
    
    result.push(current.trim());
    return result.map(value => value.replace(/^"|"$/g, ''));
  }

  private async processImagesFromUrls(imageUrls: string[]): Promise<string[]> {
    if (!imageUrls || imageUrls.length === 0) {
      return [];
    }

    const uploadedImageUrls: string[] = [];

    for (const imageUrl of imageUrls) {
      try {
        // Download image from URL
        const response = await axios.get(imageUrl, {
          responseType: 'arraybuffer',
          timeout: 10000, // 10 second timeout
        });

        // Generate unique filename
        const fileExtension = path.extname(imageUrl) || '.jpg';
        const uniqueFilename = `${uuidv4()}${fileExtension}`;
        const s3Key = `products/${uniqueFilename}`;

        // Upload to S3
        const uploadCommand = new PutObjectCommand({
          Bucket: this.bucketName,
          Key: s3Key,
          Body: Buffer.from(response.data),
          ContentType: response.headers['content-type'] || 'image/jpeg',
          Metadata: {
            originalUrl: imageUrl,
          },
        });

        await this.s3Client.send(uploadCommand);

        // Generate S3 URL
        const s3Url = `https://${this.bucketName}.s3.${process.env.AWS_REGION}.amazonaws.com/${s3Key}`;
        uploadedImageUrls.push(s3Url);

      } catch (error) {
        console.error(`Failed to process image ${imageUrl}:`, error.message);
        // Continue with other images if one fails
      }
    }

    return uploadedImageUrls;
  }
  private async createProductFromCsv(productData: CsvProductDto): Promise<ProductResponseDto> {
    // Check if product already exists
    const existingProduct = await this.prisma.product.findFirst({
      where: { name: productData.name },
    });

    if (existingProduct) {
      throw new ConflictException('Product with this name already exists');
    }

    // Process images from URLs
    const processedImages = await this.processImagesFromUrls(productData.images || []);

    // Find or create category
    const category = await this.findOrCreateCategory(productData.categoryName);

    // Find or create subcategory
    const subcategory = await this.findOrCreateSubcategory(productData.subcategoryName, category.id);

    // Find or create brand if provided
    let brand = null;
    if (productData.brandName) {
      brand = await this.findOrCreateBrand(productData.brandName);
    }

    // Create product
    const product = await this.prisma.product.create({
      data: {
        name: productData.name,
        description: productData.description,
        keyFeatures: productData.keyFeatures,
        specifications: productData.specifications,
        images: processedImages, // Store processed S3 URLs
        categoryId: category.id,
        subcategoryId: subcategory.id,
        brandId: brand?.id,
        isActive: productData.isActive ?? true,
      },
      include: {
        category: true,
        subcategory: true,
        brand: true,
      },
    });

    return this.mapToResponseDto(product);
  }

  private async findOrCreateCategory(categoryName: string) {
    const normalizedName = categoryName.toLowerCase().replace(/\s+/g, '');
    
    let category = await this.prisma.category.findFirst({
      where: {
        name: {
          equals: categoryName,
          mode: 'insensitive',
        },
        parentId: null, // Only main categories
      },
    });

    if (!category) {
      category = await this.prisma.category.create({
        data: {
          name: categoryName,
          description: `Auto-created category for ${categoryName}`,
          isActive: true,
          sortOrder: 0,
        },
      });
    }

    return category;
  }

  private async findOrCreateSubcategory(subcategoryName: string, categoryId: string) {
    let subcategory = await this.prisma.category.findFirst({
      where: {
        name: {
          equals: subcategoryName,
          mode: 'insensitive',
        },
        parentId: categoryId,
      },
    });

    if (!subcategory) {
      subcategory = await this.prisma.category.create({
        data: {
          name: subcategoryName,
          description: `Auto-created subcategory for ${subcategoryName}`,
          parentId: categoryId,
          isActive: true,
          sortOrder: 0,
        },
      });
    }

    return subcategory;
  }

  private async findOrCreateBrand(brandName: string) {
    let brand = await this.prisma.brand.findFirst({
      where: {
        name: {
          equals: brandName,
          mode: 'insensitive',
        },
      },
    });

    if (!brand) {
      brand = await this.prisma.brand.create({
        data: {
          name: brandName,
          description: `Auto-created brand for ${brandName}`,
          isActive: true,
        },
      });
    }

    return brand;
  }

  private mapToResponseDto(product: any): ProductResponseDto {
    return {
      id: product.id,
      name: product.name,
      description: product.description,
      keyFeatures: product.keyFeatures,
      specifications: product.specifications,
      images: product.images || [],
      categoryId: product.categoryId,
      subcategoryId: product.subcategoryId,
      brandId: product.brandId,
      isActive: product.isActive,
      createdAt: product.createdAt,
      updatedAt: product.updatedAt,
      categoryName: product.category?.name,
      subcategoryName: product.subcategory?.name,
      brandName: product.brand?.name,
    };
  }
}
