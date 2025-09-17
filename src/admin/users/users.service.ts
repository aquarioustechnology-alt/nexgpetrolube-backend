import { Injectable, NotFoundException, BadRequestException, ConflictException } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { CreateUserDto, UpdateUserDto } from './dto/create-user.dto';
import { PaginationDto, PaginatedResponseDto } from '../common/dto/pagination.dto';
import { AdminUserResponseDto } from './dto/user-response.dto';
import { UserDetailsResponseDto } from './dto/user-details.dto';
import { UpdateUserStatusDto, UserStatusResponseDto } from './dto/user-status.dto';
import * as bcrypt from 'bcryptjs';
import { UserRole, KycStatus } from '@prisma/client';
import * as fs from 'fs';
import * as path from 'path';

@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService) {}

  // Find actual file in uploads directory by searching for files that start with the original filename
  private getMimeType(fileName: string): string {
    const extension = fileName.split('.').pop()?.toLowerCase();
    const mimeTypes: { [key: string]: string } = {
      'jpg': 'image/jpeg',
      'jpeg': 'image/jpeg',
      'png': 'image/png',
      'gif': 'image/gif',
      'pdf': 'application/pdf',
      'doc': 'application/msword',
      'docx': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    };
    return mimeTypes[extension || ''] || 'application/octet-stream';
  }

  private async findActualFile(originalFileName: string): Promise<string | null> {
    try {
      const uploadsDir = path.join(process.cwd(), 'uploads');
      
      if (!fs.existsSync(uploadsDir)) {
        return null;
      }

      const files = fs.readdirSync(uploadsDir);
      const fileNameWithoutExt = path.parse(originalFileName).name;
      const fileExt = path.parse(originalFileName).ext;

      // Look for files that start with the original filename (without extension)
      const matchingFile = files.find(file => 
        file.startsWith(fileNameWithoutExt) && file.endsWith(fileExt)
      );

      return matchingFile || null;
    } catch (error) {
      console.error('Error finding actual file:', error);
      return null;
    }
  }

  async createUser(createUserDto: CreateUserDto, adminId: string) {
    // Check if user already exists
    const existingUser = await this.prisma.user.findUnique({
      where: { email: createUserDto.email },
    });

    if (existingUser) {
      throw new ConflictException('User with this email already exists');
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(createUserDto.password, 12);

    // Create user with transaction to ensure data consistency
    const result = await this.prisma.$transaction(async (tx) => {
      // Create user
      const user = await tx.user.create({
        data: {
          email: createUserDto.email,
          password: hashedPassword,
          firstName: createUserDto.firstName,
          lastName: createUserDto.lastName,
          companyName: createUserDto.companyName,
          phone: createUserDto.phone,
          role: createUserDto.role as UserRole,
          kycStatus: (createUserDto.kycStatus as KycStatus) || 'NOT_SUBMITTED',
          // createdBy: adminId, // TODO: Add createdBy field to User model
        },
      });

      // Create addresses if provided
      const addresses = [];
      if (createUserDto.address) {
        const address = await tx.address.create({
          data: {
            userId: user.id,
            type: 'company',
            line1: createUserDto.address.line1,
            line2: createUserDto.address.line2,
            city: createUserDto.address.city,
            state: createUserDto.address.state,
            country: createUserDto.address.country || 'India',
            pincode: createUserDto.address.pincode,
            isDefault: true,
          },
        });
        addresses.push(address);
      }

      if (createUserDto.deliveryAddress) {
        const deliveryAddress = await tx.address.create({
          data: {
            userId: user.id,
            type: 'delivery',
            line1: createUserDto.deliveryAddress.line1,
            line2: createUserDto.deliveryAddress.line2,
            city: createUserDto.deliveryAddress.city,
            state: createUserDto.deliveryAddress.state,
            country: createUserDto.deliveryAddress.country || 'India',
            pincode: createUserDto.deliveryAddress.pincode,
            isDefault: false,
          },
        });
        addresses.push(deliveryAddress);
      }

      // Create KYC record if provided
      if (createUserDto.gstNumber || createUserDto.panNumber || createUserDto.aadhaarNumber) {
        await tx.kyc.create({
          data: {
            userId: user.id,
            gstNumber: createUserDto.gstNumber,
            panNumber: createUserDto.panNumber,
            aadhaarNumber: createUserDto.aadhaarNumber,
            kycStatus: (createUserDto.kycStatus as KycStatus) || 'NOT_SUBMITTED',
            submittedAt: new Date(),
          },
        });

        // Handle uploaded files for KYC documents
        if (createUserDto.uploadedFiles) {
          // Get the KYC record that was just created
          const kycRecord = await tx.kyc.findUnique({
            where: { userId: user.id },
          });
          
          if (kycRecord) {
            const documentPromises = [];

            // Process each uploaded file
            for (const [documentType, fileName] of Object.entries(createUserDto.uploadedFiles)) {
              if (fileName) {
                const actualFileName = await this.findActualFile(fileName);
                if (actualFileName) {
                  const uploadsDir = path.join(process.cwd(), 'uploads');
                  const filePath = path.join(uploadsDir, actualFileName);
                  
                  if (fs.existsSync(filePath)) {
                    const stats = fs.statSync(filePath);
                    const mimeType = this.getMimeType(actualFileName);
                    
                    const documentPromise = tx.kycDocument.create({
                      data: {
                        kycId: kycRecord.id,
                        type: documentType,
                        fileName: actualFileName,
                        fileUrl: `/uploads/${actualFileName}`,
                        fileSize: stats.size,
                        mimeType: mimeType,
                        isVerified: false,
                        uploadedAt: new Date(),
                      },
                    });
                    documentPromises.push(documentPromise);
                  }
                }
              }
            }

            // Execute all document creation promises
            await Promise.all(documentPromises);
          }
        }
      }

      // Fetch the complete user with all relations
      const completeUser = await tx.user.findUnique({
        where: { id: user.id },
        include: {
          addresses: true,
          kyc: {
            include: {
              documents: true,
            },
          },
        },
      });

      return completeUser;
    });

    // Transform to response DTO
    const response: AdminUserResponseDto = {
      id: result!.id,
      email: result!.email,
      phone: result!.phone || undefined,
      firstName: result!.firstName || undefined,
      lastName: result!.lastName || undefined,
      companyName: result!.companyName,
      role: result!.role,
      kycStatus: result!.kycStatus,
      isActive: result!.isActive,
      isEmailVerified: result!.isEmailVerified,
      isPhoneVerified: result!.isPhoneVerified,
      profileImage: result!.profileImage || undefined,
      createdAt: result!.createdAt,
      updatedAt: result!.updatedAt,
      addresses: result!.addresses?.map(addr => ({
        id: addr.id,
        type: addr.type,
        line1: addr.line1,
        line2: addr.line2,
        city: addr.city,
        state: addr.state,
        country: addr.country,
        pincode: addr.pincode,
        isDefault: addr.isDefault,
      })),
      kyc: result!.kyc ? {
        id: result!.kyc.id,
        gstNumber: result!.kyc.gstNumber || undefined,
        panNumber: result!.kyc.panNumber || undefined,
        aadhaarNumber: result!.kyc.aadhaarNumber || undefined,
        kycStatus: result!.kyc.kycStatus,
        submittedAt: result!.kyc.submittedAt,
        reviewedAt: result!.kyc.reviewedAt || undefined,
      } : undefined,
      kycDocumentsCount: result!.kyc?.documents?.length || 0,
    };

    return response;
  }

  async updateUser(userId: string, updateUserDto: UpdateUserDto, adminUserId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      include: { addresses: true, kyc: { include: { documents: true } } },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    // Check if trying to modify KYC data for approved users
    if (user.kycStatus === 'APPROVED' && (
      updateUserDto.gstNumber !== undefined || 
      updateUserDto.panNumber !== undefined || 
      updateUserDto.aadhaarNumber !== undefined ||
      updateUserDto.uploadedFiles !== undefined ||
      (updateUserDto.kycStatus && updateUserDto.kycStatus !== 'APPROVED')
    )) {
      throw new BadRequestException('Cannot modify KYC information for verified users. KYC data is locked once approved.');
    }

    // Update user basic information
    const updatedUser = await this.prisma.user.update({
      where: { id: userId },
      data: {
        email: updateUserDto.email,
        firstName: updateUserDto.firstName,
        lastName: updateUserDto.lastName,
        companyName: updateUserDto.companyName,
        phone: updateUserDto.phone,
        role: updateUserDto.role as UserRole,
        kycStatus: updateUserDto.kycStatus as KycStatus,
        updatedAt: new Date(),
        // updatedBy: adminUserId, // TODO: Add updatedBy field to User model
      },
    });

    // Update addresses if provided
    if (updateUserDto.address) {
      const existingCompanyAddress = user.addresses.find(addr => addr.type === 'company');
      
      if (existingCompanyAddress) {
        await this.prisma.address.update({
          where: { id: existingCompanyAddress.id },
          data: {
            line1: updateUserDto.address!.line1,
            line2: updateUserDto.address!.line2,
            city: updateUserDto.address!.city,
            state: updateUserDto.address!.state,
            country: updateUserDto.address!.country || 'India',
            pincode: updateUserDto.address!.pincode,
            updatedAt: new Date(),
          },
        });
      } else {
        await this.prisma.address.create({
          data: {
            userId: userId,
            type: 'company',
            line1: updateUserDto.address!.line1,
            line2: updateUserDto.address!.line2,
            city: updateUserDto.address!.city,
            state: updateUserDto.address!.state,
            country: updateUserDto.address!.country || 'India',
            pincode: updateUserDto.address!.pincode,
            isDefault: true,
          },
        });
      }
    }

    if (updateUserDto.deliveryAddress) {
      const existingDeliveryAddress = user.addresses.find(addr => addr.type === 'delivery');
      
      if (existingDeliveryAddress) {
        await this.prisma.address.update({
          where: { id: existingDeliveryAddress.id },
          data: {
            line1: updateUserDto.deliveryAddress!.line1,
            line2: updateUserDto.deliveryAddress!.line2,
            city: updateUserDto.deliveryAddress!.city,
            state: updateUserDto.deliveryAddress!.state,
            country: updateUserDto.deliveryAddress!.country || 'India',
            pincode: updateUserDto.deliveryAddress!.pincode,
            updatedAt: new Date(),
          },
        });
      } else {
        await this.prisma.address.create({
          data: {
            userId: userId,
            type: 'delivery',
            line1: updateUserDto.deliveryAddress!.line1,
            line2: updateUserDto.deliveryAddress!.line2,
            city: updateUserDto.deliveryAddress!.city,
            state: updateUserDto.deliveryAddress!.state,
            country: updateUserDto.deliveryAddress!.country || 'India',
            pincode: updateUserDto.deliveryAddress!.pincode,
            isDefault: false,
          },
        });
      }
    }

    // Update KYC information if provided
    if (updateUserDto.gstNumber || updateUserDto.panNumber || updateUserDto.aadhaarNumber) {
      if (user.kyc) {
        await this.prisma.kyc.update({
          where: { id: user.kyc.id },
          data: {
            gstNumber: updateUserDto.gstNumber,
            panNumber: updateUserDto.panNumber,
            aadhaarNumber: updateUserDto.aadhaarNumber,
            updatedAt: new Date(),
          },
        });
      } else {
        await this.prisma.kyc.create({
          data: {
            userId: userId,
            gstNumber: updateUserDto.gstNumber,
            panNumber: updateUserDto.panNumber,
            aadhaarNumber: updateUserDto.aadhaarNumber,
            kycStatus: 'NOT_SUBMITTED',
            submittedAt: new Date(),
          },
        });
      }
    }

    // Handle uploaded files for KYC documents
    if (updateUserDto.uploadedFiles) {
      let kycRecord = user.kyc;
      if (!kycRecord) {
        kycRecord = await this.prisma.kyc.create({
          data: {
            userId: userId,
            kycStatus: 'NOT_SUBMITTED',
            submittedAt: new Date(),
          },
          include: {
            documents: true,
          },
        });
      }

      // Process each uploaded file
      for (const [documentType, fileName] of Object.entries(updateUserDto.uploadedFiles)) {
        if (fileName) {
          const actualFileName = await this.findActualFile(fileName);
          if (actualFileName) {
            const uploadsDir = path.join(process.cwd(), 'uploads');
            const filePath = path.join(uploadsDir, actualFileName);
            
            if (fs.existsSync(filePath)) {
              const stats = fs.statSync(filePath);
              const mimeType = this.getMimeType(actualFileName);
              
              // Check if document of this type already exists
              const existingDoc = await this.prisma.kycDocument.findFirst({
                where: {
                  kycId: kycRecord.id,
                  type: documentType,
                },
              });

              if (existingDoc) {
                // Update existing document
                await this.prisma.kycDocument.update({
                  where: { id: existingDoc.id },
                  data: {
                    fileName: actualFileName,
                    fileUrl: `/uploads/${actualFileName}`,
                    fileSize: stats.size,
                    mimeType: mimeType,
                    uploadedAt: new Date(),
                  },
                });
              } else {
                // Create new document
                await this.prisma.kycDocument.create({
                  data: {
                    kycId: kycRecord.id,
                    type: documentType,
                    fileName: actualFileName,
                    fileUrl: `/uploads/${actualFileName}`,
                    fileSize: stats.size,
                    mimeType: mimeType,
                    isVerified: false,
                    uploadedAt: new Date(),
                  },
                });
              }
            }
          }
        }
      }
    }

    // Fetch updated user with all relations
    const finalUser = await this.prisma.user.findUnique({
      where: { id: userId },
      include: {
        addresses: true,
        kyc: {
          include: {
            documents: true,
          },
        },
      },
    });

    // Transform to response DTO
    const response: AdminUserResponseDto = {
      id: finalUser!.id,
      email: finalUser!.email,
      phone: finalUser!.phone || undefined,
      firstName: finalUser!.firstName || undefined,
      lastName: finalUser!.lastName || undefined,
      companyName: finalUser!.companyName,
      role: finalUser!.role,
      kycStatus: finalUser!.kycStatus,
      isActive: finalUser!.isActive,
      isEmailVerified: finalUser!.isEmailVerified,
      isPhoneVerified: finalUser!.isPhoneVerified,
      profileImage: finalUser!.profileImage || undefined,
      createdAt: finalUser!.createdAt,
      updatedAt: finalUser!.updatedAt,
      addresses: finalUser!.addresses?.map(addr => ({
        id: addr.id,
        type: addr.type,
        line1: addr.line1,
        line2: addr.line2,
        city: addr.city,
        state: addr.state,
        country: addr.country,
        pincode: addr.pincode,
        isDefault: addr.isDefault,
      })),
      kyc: finalUser!.kyc ? {
        id: finalUser!.kyc.id,
        gstNumber: finalUser!.kyc.gstNumber || undefined,
        panNumber: finalUser!.kyc.panNumber || undefined,
        aadhaarNumber: finalUser!.kyc.aadhaarNumber || undefined,
        kycStatus: finalUser!.kyc.kycStatus,
        submittedAt: finalUser!.kyc.submittedAt,
        reviewedAt: finalUser!.kyc.reviewedAt || undefined,
      } : undefined,
      kycDocumentsCount: finalUser!.kyc?.documents?.length || 0,
    };

    return response;
  }

  async getUsers(paginationDto: PaginationDto): Promise<PaginatedResponseDto<AdminUserResponseDto>> {
    const {
      page = 1,
      limit = 10,
      search,
      sortBy = 'createdAt',
      sortOrder = 'desc',
      role,
      kycStatus,
      isActive,
    } = paginationDto;

    const skip = (page - 1) * limit;

    // Build where clause
    const where: any = {};

    if (search) {
      where.OR = [
        { email: { contains: search, mode: 'insensitive' } },
        { firstName: { contains: search, mode: 'insensitive' } },
        { lastName: { contains: search, mode: 'insensitive' } },
        { companyName: { contains: search, mode: 'insensitive' } },
        { phone: { contains: search, mode: 'insensitive' } },
      ];
    }

    if (role) {
      where.role = role;
    }

    if (kycStatus) {
      where.kycStatus = kycStatus;
    }

    if (typeof isActive === 'boolean') {
      where.isActive = isActive;
    }

    // Execute queries in parallel
    const [users, total] = await Promise.all([
      this.prisma.user.findMany({
        where,
        skip,
        take: limit,
        orderBy: { [sortBy]: sortOrder },
        include: {
          addresses: true,
          kyc: {
            include: {
              documents: true,
            },
          },
        },
      }),
      this.prisma.user.count({ where }),
    ]);

    // Transform users to response DTOs
    const userResponses: AdminUserResponseDto[] = users.map(user => ({
      id: user.id,
      email: user.email,
      phone: user.phone || undefined,
      firstName: user.firstName || undefined,
      lastName: user.lastName || undefined,
      companyName: user.companyName,
      role: user.role,
      kycStatus: user.kycStatus,
      isActive: user.isActive,
      isEmailVerified: user.isEmailVerified,
      isPhoneVerified: user.isPhoneVerified,
      profileImage: user.profileImage || undefined,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
      addresses: user.addresses?.map(addr => ({
        id: addr.id,
        type: addr.type,
        line1: addr.line1,
        line2: addr.line2,
        city: addr.city,
        state: addr.state,
        country: addr.country,
        pincode: addr.pincode,
        isDefault: addr.isDefault,
      })),
      kyc: user.kyc ? {
        id: user.kyc.id,
        gstNumber: user.kyc.gstNumber || undefined,
        panNumber: user.kyc.panNumber || undefined,
        aadhaarNumber: user.kyc.aadhaarNumber || undefined,
        kycStatus: user.kyc.kycStatus,
        submittedAt: user.kyc.submittedAt,
        reviewedAt: user.kyc.reviewedAt || undefined,
      } : undefined,
      kycDocumentsCount: user.kyc?.documents?.length || 0,
    }));

    const totalPages = Math.ceil(total / limit);

    return {
      data: userResponses,
      meta: {
        page,
        limit,
        total,
        totalPages,
        hasNextPage: page < totalPages,
        hasPreviousPage: page > 1,
      }
    };
  }

  async getUserDetails(userId: string): Promise<UserDetailsResponseDto> {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      include: {
        addresses: {
          orderBy: [
            { isDefault: 'desc' },
            { createdAt: 'asc' }
          ]
        },
        kyc: {
          include: {
            documents: {
              orderBy: { uploadedAt: 'desc' }
            }
          }
        },
        bankDetails: true,
      },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    // Transform addresses
    const addresses = user.addresses.map(addr => ({
      id: addr.id,
      type: addr.type,
      line1: addr.line1,
      line2: addr.line2,
      city: addr.city,
      state: addr.state,
      country: addr.country,
      pincode: addr.pincode,
      isDefault: addr.isDefault,
      createdAt: addr.createdAt,
      updatedAt: addr.updatedAt,
    }));

    // Transform KYC details
    let kycDetails = undefined;
    if (user.kyc) {
      kycDetails = {
        id: user.kyc.id,
        panNumber: user.kyc.panNumber,
        aadhaarNumber: user.kyc.aadhaarNumber,
        gstNumber: user.kyc.gstNumber,
        yearsInBusiness: user.kyc.yearsInBusiness,
        kycStatus: user.kyc.kycStatus,
        rejectionReason: user.kyc.rejectionReason,
        reviewedBy: user.kyc.reviewedBy,
        reviewedAt: user.kyc.reviewedAt,
        submittedAt: user.kyc.submittedAt,
        createdAt: user.kyc.createdAt,
        updatedAt: user.kyc.updatedAt,
        documents: user.kyc.documents.map(doc => ({
          id: doc.id,
          type: doc.type,
          fileName: doc.fileName,
          fileUrl: doc.fileUrl,
          fileSize: doc.fileSize,
          mimeType: doc.mimeType,
          isVerified: doc.isVerified,
          uploadedAt: doc.uploadedAt,
        })),
      };
    }

    // Transform bank details
    let bankDetails = undefined;
    if (user.bankDetails) {
      bankDetails = {
        id: user.bankDetails.id,
        accountNumber: user.bankDetails.accountNumber,
        ifscCode: user.bankDetails.ifscCode,
        bankName: user.bankDetails.bankName,
        accountHolderName: user.bankDetails.accountHolderName,
        isVerified: user.bankDetails.isVerified,
        createdAt: user.bankDetails.createdAt,
        updatedAt: user.bankDetails.updatedAt,
      };
    }

    return {
      id: user.id,
      email: user.email,
      phone: user.phone,
      firstName: user.firstName,
      lastName: user.lastName,
      companyName: user.companyName,
      role: user.role,
      kycStatus: user.kycStatus,
      isActive: user.isActive,
      isEmailVerified: user.isEmailVerified,
      isPhoneVerified: user.isPhoneVerified,
      profileImage: user.profileImage,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
      addresses,
      kyc: kycDetails,
      bankDetails,
    };
  }

  async updateUserStatus(userId: string, statusDto: UpdateUserStatusDto): Promise<UserStatusResponseDto> {
    // Check if user exists
    const existingUser = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, email: true, companyName: true, isActive: true }
    });

    if (!existingUser) {
      throw new NotFoundException('User not found');
    }

    const updatedUser = await this.prisma.user.update({
      where: { id: userId },
      data: {
        isActive: statusDto.isActive,
        updatedAt: new Date(),
      },
      select: {
        id: true,
        email: true,
        companyName: true,
        isActive: true,
        updatedAt: true,
      }
    });

    return {
      id: updatedUser.id,
      email: updatedUser.email,
      companyName: updatedUser.companyName,
      isActive: updatedUser.isActive,
      updatedAt: updatedUser.updatedAt,
      statusChangeReason: statusDto.reason,
    };
  }

  /**
   * Enable user account
   */
  async enableUser(userId: string, reason?: string): Promise<UserStatusResponseDto> {
    return this.updateUserStatus(userId, { isActive: true, reason });
  }

  /**
   * Disable user account
   */
  async disableUser(userId: string, reason?: string): Promise<UserStatusResponseDto> {
    return this.updateUserStatus(userId, { isActive: false, reason });
  }
}