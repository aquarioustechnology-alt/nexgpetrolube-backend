import { Injectable } from '@nestjs/common';
import { PrismaService } from '../database/prisma.service';

@Injectable()
export class OtpService {
  constructor(private prisma: PrismaService) {}

  /**
   * Generate a 6-digit OTP
   */
  generateOtp(): string {
    return Math.floor(100000 + Math.random() * 900000).toString();
  }

  /**
   * Send OTP to email and/or phone
   * For demo purposes, we'll just store it in the database and return it
   */
  async sendOtp(email: string, phone?: string): Promise<string> {
    const otp = this.generateOtp();
    const expiresAt = new Date(Date.now() + 5 * 60 * 1000); // 5 minutes from now

    // Store OTP in database
    await this.prisma.otpVerification.upsert({
      where: { email },
      update: {
        otp,
        expiresAt,
        phone: phone || null,
        attempts: 0,
      },
      create: {
        email,
        otp,
        expiresAt,
        phone: phone || null,
        attempts: 0,
      },
    });

    // In a real application, you would send the OTP via email/SMS here
    console.log(`[DEMO] OTP for ${email}: ${otp}`);
    if (phone) {
      console.log(`[DEMO] OTP for ${phone}: ${otp}`);
    }

    // For demo purposes, return the OTP so it can be displayed to the user
    return otp;
  }

  /**
   * Verify OTP
   */
  async verifyOtp(email: string, otp: string): Promise<boolean> {
    const otpRecord = await this.prisma.otpVerification.findUnique({
      where: { email },
    });

    if (!otpRecord) {
      return false;
    }

    // Check if OTP has expired
    if (otpRecord.expiresAt < new Date()) {
      await this.prisma.otpVerification.delete({
        where: { email },
      });
      return false;
    }

    // Check if too many attempts
    if (otpRecord.attempts >= 3) {
      await this.prisma.otpVerification.delete({
        where: { email },
      });
      return false;
    }

    // Check if OTP matches
    if (otpRecord.otp !== otp) {
      await this.prisma.otpVerification.update({
        where: { email },
        data: { attempts: otpRecord.attempts + 1 },
      });
      return false;
    }

    // OTP is valid, but don't delete the record yet (for password reset flow)
    return true;
  }

  /**
   * Delete OTP record (used after successful password reset)
   */
  async deleteOtp(email: string): Promise<void> {
    await this.prisma.otpVerification.delete({
      where: { email },
    });
  }

  /**
   * Clean up expired OTPs
   */
  async cleanupExpiredOtps(): Promise<void> {
    await this.prisma.otpVerification.deleteMany({
      where: {
        expiresAt: {
          lt: new Date(),
        },
      },
    });
  }
}
