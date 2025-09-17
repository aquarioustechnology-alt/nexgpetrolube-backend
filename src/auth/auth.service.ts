import { Injectable, UnauthorizedException, BadRequestException, NotFoundException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import * as bcrypt from 'bcryptjs';
import { PrismaService } from '../database/prisma.service';
import { UsersService } from '../users/users.service';
import { OtpService } from './otp.service';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';
import { UserDetailsResponseDto, UpdateUserDetailsDto } from './dto/user-details.dto';
import { AdminLoginDto } from './dto/admin-login.dto';
import { SendOtpDto } from './dto/send-otp.dto';
import { VerifyOtpDto } from './dto/verify-otp.dto';

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
    private configService: ConfigService,
    private usersService: UsersService,
    private otpService: OtpService,
  ) {}

  async validateUser(email: string, password: string): Promise<any> {
    const user = await this.prisma.user.findUnique({
      where: { email },
      include: {
        addresses: true,
        kyc: true,
      },
    });

    if (user && user.password && await bcrypt.compare(password, user.password)) {
      const { password: _, ...result } = user;
      return result;
    }
    return null;
  }

  async validateAdmin(email: string, password: string): Promise<any> {
    // Check against admin users table
    const admin = await this.prisma.adminUser.findUnique({
      where: { email },
    });

    if (admin && admin.isActive && admin.password && await bcrypt.compare(password, admin.password)) {
      const { password: _, ...result } = admin;
      return result;
    }
    return null;
  }

  async login(loginDto: LoginDto) {
    const user = await this.validateUser(loginDto.email, loginDto.password);
    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    if (!user.isActive) {
      throw new UnauthorizedException('Account is deactivated');
    }

    const payload = {
      sub: user.id,
      email: user.email,
      role: user.role,
      type: 'user',
    };

    return {
      access_token: this.jwtService.sign(payload),
      user: {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        companyName: user.companyName,
        role: user.role,
        kycStatus: user.kycStatus,
        isEmailVerified: user.isEmailVerified,
        profileImage: user.profileImage,
      },
    };
  }

  async adminLogin(adminLoginDto: AdminLoginDto) {
    const admin = await this.validateAdmin(adminLoginDto.email, adminLoginDto.password);
    if (!admin) {
      throw new UnauthorizedException('Invalid admin credentials');
    }

    if (!admin.isActive) {
      throw new UnauthorizedException('Admin account is deactivated');
    }

    // Update last login time
    await this.prisma.adminUser.update({
      where: { id: admin.id },
      data: { lastLoginAt: new Date() },
    });

    const payload = {
      sub: admin.id,
      email: admin.email,
      role: admin.role,
      type: 'admin',
    };

    return {
      access_token: this.jwtService.sign(payload),
      admin: {
        id: admin.id,
        email: admin.email,
        firstName: admin.firstName,
        lastName: admin.lastName,
        role: admin.role,
      },
    };
  }

  async register(registerDto: RegisterDto) {
    // Check if user already exists
    const existingUser = await this.prisma.user.findUnique({
      where: { email: registerDto.email },
    });

    if (existingUser) {
      throw new BadRequestException('User with this email already exists');
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(registerDto.password, 12);

    // Create user
    const user = await this.prisma.user.create({
      data: {
        email: registerDto.email,
        firstName: registerDto.firstName,
        lastName: registerDto.lastName,
        companyName: registerDto.companyName,
        phone: registerDto.phone,
        role: registerDto.role || 'BUYER',
        password: hashedPassword,
        isActive: true,
      },
    });

    // Create default address if provided
    if (registerDto.address) {
      await this.prisma.address.create({
        data: {
          userId: user.id,
          type: 'company',
          line1: registerDto.address.line1,
          line2: registerDto.address.line2,
          city: registerDto.address.city,
          state: registerDto.address.state,
          country: registerDto.address.country || 'India',
          pincode: registerDto.address.pincode,
          isDefault: true,
        },
      });
    }

    // Handle uploaded files - store filenames in user profile or create KYC record
    if (registerDto.uploadedFiles) {
      // For now, we'll just log the uploaded files
      // In a real application, you might want to create a KYC record or store in user profile
      console.log('Uploaded files for user:', user.id, registerDto.uploadedFiles);
    }

    const { password: _, ...userWithoutPassword } = user;

    return {
      message: 'User registered successfully',
      user: userWithoutPassword,
    };
  }

  async refreshToken(userId: string, userType: 'user' | 'admin') {
    let user;
    
    if (userType === 'admin') {
      user = await this.prisma.adminUser.findUnique({
        where: { id: userId },
      });
    } else {
      user = await this.prisma.user.findUnique({
        where: { id: userId },
      });
    }

    if (!user || !user.isActive) {
      throw new UnauthorizedException('User not found or inactive');
    }

    const payload = {
      sub: user.id,
      email: user.email,
      role: user.role,
      type: userType,
    };

    return {
      access_token: this.jwtService.sign(payload),
    };
  }

  async logout() {
    // In a real application, you might want to blacklist the token
    // For now, we'll just return a success message
    return { message: 'Logged out successfully' };
  }

  async sendOtp(sendOtpDto: SendOtpDto) {
    const otp = await this.otpService.sendOtp(sendOtpDto.email, sendOtpDto.phone);
    
    return {
      message: 'OTP sent successfully',
      // In production, don't return the OTP
      // For demo purposes, we'll return it
      otp: otp,
    };
  }

  async verifyOtp(verifyOtpDto: VerifyOtpDto) {
    const isValid = await this.otpService.verifyOtp(verifyOtpDto.email, verifyOtpDto.otp);
    
    if (!isValid) {
      throw new BadRequestException('Invalid or expired OTP');
    }

    // Update user email verification status if user exists
    const user = await this.prisma.user.findUnique({
      where: { email: verifyOtpDto.email },
    });

    if (user) {
      await this.prisma.user.update({
        where: { email: verifyOtpDto.email },
        data: { isEmailVerified: true },
      });
    }

    return {
      message: 'OTP verified successfully',
      verified: true,
    };
  }

  async forgotPassword(forgotPasswordDto: { emailOrMobile: string }) {
    const { emailOrMobile } = forgotPasswordDto;
    
    // Check if it's an email or mobile number
    const isEmail = emailOrMobile.includes('@');
    
    let user;
    if (isEmail) {
      user = await this.prisma.user.findUnique({
        where: { email: emailOrMobile },
      });
    } else {
      // Remove any non-digit characters and check if it's a valid mobile
      const mobileNumber = emailOrMobile.replace(/\D/g, '');
      if (mobileNumber.length !== 10) {
        throw new BadRequestException('Please enter a valid 10-digit mobile number');
      }
      
      user = await this.prisma.user.findFirst({
        where: { 
          phone: {
            endsWith: mobileNumber
          }
        },
      });
    }

    if (!user) {
      throw new BadRequestException('No account found with this email or mobile number');
    }

    // Generate and send OTP for password reset
    const otp = await this.otpService.sendOtp(
      user.email, 
      user.phone ? user.phone.replace('+91', '') : undefined
    );

    return {
      message: 'Password reset OTP sent successfully',
      otp: otp, // Include OTP in response for demo purposes
    };
  }

  async verifyResetOtp(verifyResetOtpDto: { emailOrMobile: string; otp: string }) {
    const { emailOrMobile, otp } = verifyResetOtpDto;
    
    // Check if it's an email or mobile number
    const isEmail = emailOrMobile.includes('@');
    
    let user;
    if (isEmail) {
      user = await this.prisma.user.findUnique({
        where: { email: emailOrMobile },
      });
    } else {
      const mobileNumber = emailOrMobile.replace(/\D/g, '');
      user = await this.prisma.user.findFirst({
        where: { 
          phone: {
            endsWith: mobileNumber
          }
        },
      });
    }

    if (!user) {
      throw new BadRequestException('No account found with this email or mobile number');
    }

    // Verify the OTP
    const isValid = await this.otpService.verifyOtp(user.email, otp);
    
    if (!isValid) {
      throw new BadRequestException('Invalid or expired OTP');
    }

    return {
      message: 'OTP verified successfully. You can now reset your password.',
      verified: true,
    };
  }

  async resetPassword(resetPasswordDto: { emailOrMobile: string; otp: string; newPassword: string }) {
    const { emailOrMobile, otp, newPassword } = resetPasswordDto;
    
    // Check if it's an email or mobile number
    const isEmail = emailOrMobile.includes('@');
    
    let user;
    if (isEmail) {
      user = await this.prisma.user.findUnique({
        where: { email: emailOrMobile },
      });
    } else {
      const mobileNumber = emailOrMobile.replace(/\D/g, '');
      user = await this.prisma.user.findFirst({
        where: { 
          phone: {
            endsWith: mobileNumber
          }
        },
      });
    }

    if (!user) {
      throw new BadRequestException('No account found with this email or mobile number');
    }

    // Verify the OTP one more time
    const isValid = await this.otpService.verifyOtp(user.email, otp);
    
    if (!isValid) {
      throw new BadRequestException('Invalid or expired OTP');
    }

    // Hash the new password
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    // Update the user's password
    await this.prisma.user.update({
      where: { id: user.id },
      data: { password: hashedPassword },
    });

    // Delete the OTP record after successful password reset
    await this.otpService.deleteOtp(user.email);

    return {
      message: 'Password reset successfully',
    };
  }

  async getUserDetails(userId: string): Promise<UserDetailsResponseDto> {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        phone: true,
        firstName: true,
        lastName: true,
        companyName: true,
        role: true,
        kycStatus: true,
        isActive: true,
        isEmailVerified: true,
        isPhoneVerified: true,
        profileImage: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    if (!user) {
      throw new NotFoundException('User not found');
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
      createdAt: user.createdAt.toISOString(),
      updatedAt: user.updatedAt.toISOString(),
    };
  }

  async updateUserDetails(userId: string, updateData: UpdateUserDetailsDto): Promise<UserDetailsResponseDto> {
    // Check if user exists
    const existingUser = await this.prisma.user.findUnique({
      where: { id: userId },
    });

    if (!existingUser) {
      throw new NotFoundException('User not found');
    }

    // Update user details
    const updatedUser = await this.prisma.user.update({
      where: { id: userId },
      data: {
        ...(updateData.firstName !== undefined && { firstName: updateData.firstName }),
        ...(updateData.lastName !== undefined && { lastName: updateData.lastName }),
        ...(updateData.companyName !== undefined && { companyName: updateData.companyName }),
        ...(updateData.phone !== undefined && { phone: updateData.phone }),
        ...(updateData.profileImage !== undefined && { profileImage: updateData.profileImage }),
        updatedAt: new Date(),
      },
      select: {
        id: true,
        email: true,
        phone: true,
        firstName: true,
        lastName: true,
        companyName: true,
        role: true,
        kycStatus: true,
        isActive: true,
        isEmailVerified: true,
        isPhoneVerified: true,
        profileImage: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    return {
      id: updatedUser.id,
      email: updatedUser.email,
      phone: updatedUser.phone,
      firstName: updatedUser.firstName,
      lastName: updatedUser.lastName,
      companyName: updatedUser.companyName,
      role: updatedUser.role,
      kycStatus: updatedUser.kycStatus,
      isActive: updatedUser.isActive,
      isEmailVerified: updatedUser.isEmailVerified,
      isPhoneVerified: updatedUser.isPhoneVerified,
      profileImage: updatedUser.profileImage,
      createdAt: updatedUser.createdAt.toISOString(),
      updatedAt: updatedUser.updatedAt.toISOString(),
    };
  }
}
