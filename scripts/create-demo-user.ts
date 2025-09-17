/**
 * Script to create a demo user for testing
 */
import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function createDemoUser() {
  try {
    // Check if demo user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email: 'demo@nexgpetrolube.com' }
    });

    if (existingUser) {
      console.log('Demo user already exists:', existingUser.email);
      return;
    }

    // Hash password
    const hashedPassword = await bcrypt.hash('Demo@123', 12);

    // Create demo user
    const demoUser = await prisma.user.create({
      data: {
        email: 'demo@nexgpetrolube.com',
        firstName: 'Demo',
        lastName: 'User',
        companyName: 'Demo Petroleum Company',
        phone: '+91 98765 43210',
        role: 'BUYER',
        password: hashedPassword,
        isActive: true,
        isEmailVerified: true,
        isPhoneVerified: true,
        kycStatus: 'VERIFIED',
      },
    });

    console.log('Demo user created successfully:', {
      id: demoUser.id,
      email: demoUser.email,
      name: `${demoUser.firstName} ${demoUser.lastName}`,
      company: demoUser.companyName,
      role: demoUser.role,
    });

    console.log('\nDemo credentials:');
    console.log('Email: demo@nexgpetrolube.com');
    console.log('Password: Demo@123');

  } catch (error) {
    console.error('Error creating demo user:', error);
  } finally {
    await prisma.$disconnect();
  }
}

createDemoUser();
