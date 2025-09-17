import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../../database/prisma.service';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    private configService: ConfigService,
    private prisma: PrismaService,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: configService.get<string>('JWT_SECRET'),
    });
  }

  async validate(payload: any) {
    const { sub: userId, type, email, role } = payload;

    if (!userId || !type) {
      throw new UnauthorizedException('Invalid token payload');
    }

    // For demo admin user
    if (type === 'admin' && userId === 'admin-demo') {
      return {
        sub: userId,
        email,
        role,
        type,
        firstName: 'Admin',
        lastName: 'User',
      };
    }

    // Validate user exists and is active
    if (type === 'user') {
      const user = await this.prisma.user.findUnique({
        where: { id: userId },
        select: {
          id: true,
          email: true,
          firstName: true,
          lastName: true,
          companyName: true,
          role: true,
          kycStatus: true,
          isActive: true,
          isEmailVerified: true,
          profileImage: true,
        },
      });

      if (!user || !user.isActive) {
        throw new UnauthorizedException('User not found or inactive');
      }

      return {
        sub: user.id,
        email: user.email,
        role: user.role,
        type,
        firstName: user.firstName,
        lastName: user.lastName,
        companyName: user.companyName,
        kycStatus: user.kycStatus,
        isEmailVerified: user.isEmailVerified,
        profileImage: user.profileImage,
      };
    }

    // Validate admin user
    if (type === 'admin') {
      const admin = await this.prisma.adminUser.findUnique({
        where: { id: userId },
        select: {
          id: true,
          email: true,
          firstName: true,
          lastName: true,
          role: true,
          isActive: true,
        },
      });

      if (!admin || !admin.isActive) {
        throw new UnauthorizedException('Admin not found or inactive');
      }

      return {
        sub: admin.id,
        email: admin.email,
        role: admin.role,
        type,
        firstName: admin.firstName,
        lastName: admin.lastName,
      };
    }

    throw new UnauthorizedException('Invalid user type');
  }
}
