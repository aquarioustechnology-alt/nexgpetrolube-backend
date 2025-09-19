import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting database seeding...');

  // Create categories
  const engineOilCategory = await prisma.category.create({
    data: {
      name: 'Engine Oils',
      description: 'Various types of engine oils for automotive and industrial use',
      isActive: true,
      sortOrder: 1,
    },
  });

  const gearOilCategory = await prisma.category.create({
    data: {
      name: 'Gear Oils',
      description: 'Gear oils for transmission and differential systems',
      isActive: true,
      sortOrder: 2,
    },
  });

  const brakeFluidCategory = await prisma.category.create({
    data: {
      name: 'Brake Fluids',
      description: 'Brake fluids for hydraulic brake systems',
      isActive: true,
      sortOrder: 3,
    },
  });

  // Create subcategories
  const syntheticSubcategory = await prisma.subcategory.create({
    data: {
      name: 'Synthetic',
      description: 'Synthetic engine oils',
      categoryId: engineOilCategory.id,
      isActive: true,
      sortOrder: 1,
    },
  });

  const mineralSubcategory = await prisma.subcategory.create({
    data: {
      name: 'Mineral',
      description: 'Mineral engine oils',
      categoryId: engineOilCategory.id,
      isActive: true,
      sortOrder: 2,
    },
  });

  // Create brands
  const castrolBrand = await prisma.brand.create({
    data: {
      name: 'Castrol',
      description: 'Castrol lubricants and oils',
      isActive: true,
    },
  });

  const mobilBrand = await prisma.brand.create({
    data: {
      name: 'Mobil',
      description: 'Mobil lubricants and oils',
      isActive: true,
    },
  });

  const shellBrand = await prisma.brand.create({
    data: {
      name: 'Shell',
      description: 'Shell lubricants and oils',
      isActive: true,
    },
  });

  // Create units
  const literUnit = await prisma.unit.create({
    data: {
      name: 'Liters',
      symbol: 'L',
      description: 'Volume measurement in liters',
      isActive: true,
    },
  });

  const kgUnit = await prisma.unit.create({
    data: {
      name: 'Kilograms',
      symbol: 'kg',
      description: 'Weight measurement in kilograms',
      isActive: true,
    },
  });

  const piecesUnit = await prisma.unit.create({
    data: {
      name: 'Pieces',
      symbol: 'pcs',
      description: 'Count measurement in pieces',
      isActive: true,
    },
  });

  // Create admin user
  const hashedPassword = await bcrypt.hash('Admin@123', 12);
  
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

  // Create demo users
  const buyerUser = await prisma.user.create({
    data: {
      email: 'buyer@demo.com',
      phone: '+91 98765 43210',
      firstName: 'John',
      lastName: 'Doe',
      companyName: 'Petro Solutions Inc.',
      role: 'BUYER',
      kycStatus: 'APPROVED',
      isActive: true,
      isEmailVerified: true,
      password: hashedPassword,
    },
  });

  const sellerUser = await prisma.user.create({
    data: {
      email: 'seller@demo.com',
      phone: '+91 98765 43211',
      firstName: 'Jane',
      lastName: 'Smith',
      companyName: 'Oil Distributors Ltd.',
      role: 'SELLER',
      kycStatus: 'APPROVED',
      isActive: true,
      isEmailVerified: true,
      password: hashedPassword,
    },
  });

  const bothUser = await prisma.user.create({
    data: {
      email: 'both@demo.com',
      phone: '+91 98765 43212',
      firstName: 'Robert',
      lastName: 'Johnson',
      companyName: 'Global Petro Corp.',
      role: 'BOTH',
      kycStatus: 'PENDING',
      isActive: true,
      isEmailVerified: true,
      password: hashedPassword,
    },
  });

  // Create addresses for users
  await prisma.address.createMany({
    data: [
      {
        userId: buyerUser.id,
        type: 'company',
        line1: '123 Business Park',
        line2: 'Sector 5',
        city: 'Mumbai',
        state: 'Maharashtra',
        country: 'India',
        pincode: '400001',
        isDefault: true,
      },
      {
        userId: sellerUser.id,
        type: 'company',
        line1: '456 Industrial Area',
        line2: 'Phase 2',
        city: 'Delhi',
        state: 'Delhi',
        country: 'India',
        pincode: '110001',
        isDefault: true,
      },
      {
        userId: bothUser.id,
        type: 'company',
        line1: '789 Corporate Hub',
        line2: 'Block A',
        city: 'Bangalore',
        state: 'Karnataka',
        country: 'India',
        pincode: '560001',
        isDefault: true,
      },
    ],
  });

  // Create KYC for approved users
  await prisma.kyc.createMany({
    data: [
      {
        userId: buyerUser.id,
        panNumber: 'AABCA1234Z',
        gstNumber: '27AABCA1234Z1Z5',
        yearsInBusiness: 5,
        kycStatus: 'APPROVED',
        submittedAt: new Date(),
      },
      {
        userId: sellerUser.id,
        panNumber: 'BBBCB5678Y',
        gstNumber: '27BBBCB5678Y2Y6',
        yearsInBusiness: 8,
        kycStatus: 'APPROVED',
        submittedAt: new Date(),
      },
      {
        userId: bothUser.id,
        panNumber: 'CCCCC9012X',
        gstNumber: '27CCCCC9012X3X7',
        yearsInBusiness: 3,
        kycStatus: 'PENDING',
        submittedAt: new Date(),
      },
    ],
  });

  // Create sample listings
  await prisma.listing.createMany({
    data: [
      {
        userId: sellerUser.id,
        title: 'Castrol GTX 15W-40 Engine Oil',
        description: 'High-quality synthetic blend engine oil for commercial vehicles',
        categoryId: engineOilCategory.id,
        subcategoryId: syntheticSubcategory.id,
        brandId: castrolBrand.id,
        unitId: literUnit.id,
        listingType: 'FIXED',
        basePrice: 450.00,
        moq: '200L',
        quantity: 1000,
        status: 'APPROVED',
        isActive: true,
        submittedAt: new Date(),
        approvedAt: new Date(),
        approvedBy: adminUser.id,
      },
      {
        userId: sellerUser.id,
        title: 'Mobil 1 5W-30 Fully Synthetic Oil',
        description: 'Premium fully synthetic engine oil for passenger cars',
        categoryId: engineOilCategory.id,
        subcategoryId: syntheticSubcategory.id,
        brandId: mobilBrand.id,
        unitId: literUnit.id,
        listingType: 'NEGOTIATION',
        basePrice: 650.00,
        moq: '100L',
        quantity: 500,
        status: 'APPROVED',
        isActive: true,
        submittedAt: new Date(),
        approvedAt: new Date(),
        approvedBy: adminUser.id,
      },
    ],
  });

  // Create sample requirements
  await prisma.requirement.createMany({
    data: [
      {
        userId: buyerUser.id,
        userType: 'BUYER',
        title: 'Engine Oil for Fleet Vehicles',
        description: 'Looking for bulk engine oil for fleet of 50 commercial vehicles',
        categoryId: engineOilCategory.id,
        subcategoryId: mineralSubcategory.id,
        productId: 'default-product-id', // You'll need to create actual products first
        quantity: '2000L',
        urgency: 'HIGH',
        status: 'OPEN',
        deliveryMethod: 'pickup',
        deliveryTimeline: 'Within 7 days',
        city: 'Mumbai',
        state: 'Maharashtra',
        visibility: 'public',
        postedAt: new Date(),
      },
      {
        userId: bothUser.id,
        userType: 'SELLER',
        title: 'Gear Oil for Industrial Equipment',
        description: 'Heavy-duty gear oil for industrial machinery',
        categoryId: gearOilCategory.id,
        productId: 'default-product-id', // You'll need to create actual products first
        quantity: '500L',
        urgency: 'MEDIUM',
        status: 'OPEN',
        deliveryMethod: 'self',
        deliveryTimeline: 'Within 15 days',
        city: 'Bangalore',
        state: 'Karnataka',
        visibility: 'public',
        postedAt: new Date(),
      },
    ],
  });

  // Create commission rules
  await prisma.commissionRule.createMany({
    data: [
      {
        name: 'Default Commission',
        percentage: 2.5,
        isActive: true,
        effectiveFrom: new Date(),
      },
      {
        name: 'Engine Oil Commission',
        categoryId: engineOilCategory.id,
        percentage: 3.0,
        isActive: true,
        effectiveFrom: new Date(),
      },
      {
        name: 'Premium Brand Commission',
        brandId: castrolBrand.id,
        percentage: 3.5,
        isActive: true,
        effectiveFrom: new Date(),
      },
    ],
  });

  console.log('✅ Database seeding completed successfully!');
  console.log('📊 Created:');
  console.log(`   - 3 Categories`);
  console.log(`   - 2 Subcategories`);
  console.log(`   - 3 Brands`);
  console.log(`   - 3 Units`);
  console.log(`   - 1 Admin User`);
  console.log(`   - 3 Demo Users`);
  console.log(`   - 3 Addresses`);
  console.log(`   - 3 KYC Records`);
  console.log(`   - 2 Listings`);
  console.log(`   - 2 Requirements`);
  console.log(`   - 3 Commission Rules`);
}

main()
  .catch((e) => {
    console.error('❌ Error during seeding:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
