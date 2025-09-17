/**
 * Script to create admin user for NexGPetrolube admin portal
 */
import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function createAdminUser() {
  try {
    // Check if admin user already exists
    const existingAdmin = await prisma.adminUser.findUnique({
      where: { email: 'admin@nexgpetrolube.com' }
    });

    if (existingAdmin) {
      console.log('Admin user already exists:', existingAdmin.email);
      return;
    }

    // Hash password
    const hashedPassword = await bcrypt.hash('Admin@123', 12);

    // Create admin user
    const adminUser = await prisma.adminUser.create({
      data: {
        email: 'admin@nexgpetrolube.com',
        firstName: 'Admin',
        lastName: 'User',
        password: hashedPassword,
        role: 'SUPER_ADMIN',
        isActive: true,
      },
    });

    console.log('Admin user created successfully:', {
      id: adminUser.id,
      email: adminUser.email,
      name: `${adminUser.firstName} ${adminUser.lastName}`,
      role: adminUser.role,
    });

    console.log('\nAdmin credentials:');
    console.log('Email: admin@nexgpetrolube.com');
    console.log('Password: Admin@123');

  } catch (error) {
    console.error('Error creating admin user:', error);
  } finally {
    await prisma.$disconnect();
  }
}

createAdminUser();
