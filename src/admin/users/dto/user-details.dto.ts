import { ApiProperty } from '@nestjs/swagger';
import { UserRole, KycStatus } from '@prisma/client';

export class AddressDetailsDto {
  @ApiProperty({ description: 'Address ID' })
  id: string;

  @ApiProperty({ description: 'Address type (personal, company, billing, delivery)' })
  type: string;

  @ApiProperty({ description: 'Address line 1' })
  line1: string;

  @ApiProperty({ description: 'Address line 2', required: false })
  line2?: string;

  @ApiProperty({ description: 'City' })
  city: string;

  @ApiProperty({ description: 'State' })
  state: string;

  @ApiProperty({ description: 'Country' })
  country: string;

  @ApiProperty({ description: 'Pincode' })
  pincode: string;

  @ApiProperty({ description: 'Is default address' })
  isDefault: boolean;

  @ApiProperty({ description: 'Created date' })
  createdAt: Date;

  @ApiProperty({ description: 'Updated date' })
  updatedAt: Date;
}

export class KycDocumentDetailsDto {
  @ApiProperty({ description: 'Document ID' })
  id: string;

  @ApiProperty({ description: 'Document type (pan, aadhaar, gst, company_registration, authorization_letter)' })
  type: string;

  @ApiProperty({ description: 'File name' })
  fileName: string;

  @ApiProperty({ description: 'File URL' })
  fileUrl: string;

  @ApiProperty({ description: 'File size in bytes' })
  fileSize: number;

  @ApiProperty({ description: 'MIME type' })
  mimeType: string;

  @ApiProperty({ description: 'Is verified' })
  isVerified: boolean;

  @ApiProperty({ description: 'Upload date' })
  uploadedAt: Date;
}

export class KycDetailsDto {
  @ApiProperty({ description: 'KYC ID' })
  id: string;

  @ApiProperty({ description: 'PAN number' })
  panNumber?: string;

  @ApiProperty({ description: 'Aadhaar number' })
  aadhaarNumber?: string;

  @ApiProperty({ description: 'GST number' })
  gstNumber?: string;

  @ApiProperty({ description: 'Years in business' })
  yearsInBusiness?: number;

  @ApiProperty({ description: 'KYC status', enum: KycStatus })
  kycStatus: KycStatus;

  @ApiProperty({ description: 'Rejection reason', required: false })
  rejectionReason?: string;

  @ApiProperty({ description: 'Reviewed by admin ID', required: false })
  reviewedBy?: string;

  @ApiProperty({ description: 'Review date', required: false })
  reviewedAt?: Date;

  @ApiProperty({ description: 'Submission date' })
  submittedAt: Date;

  @ApiProperty({ description: 'Created date' })
  createdAt: Date;

  @ApiProperty({ description: 'Updated date' })
  updatedAt: Date;

  @ApiProperty({ description: 'KYC documents', type: [KycDocumentDetailsDto] })
  documents: KycDocumentDetailsDto[];
}

export class BankDetailsDto {
  @ApiProperty({ description: 'Bank detail ID' })
  id: string;

  @ApiProperty({ description: 'Account number' })
  accountNumber: string;

  @ApiProperty({ description: 'IFSC code' })
  ifscCode: string;

  @ApiProperty({ description: 'Bank name' })
  bankName: string;

  @ApiProperty({ description: 'Account holder name' })
  accountHolderName: string;

  @ApiProperty({ description: 'Is verified' })
  isVerified: boolean;

  @ApiProperty({ description: 'Created date' })
  createdAt: Date;

  @ApiProperty({ description: 'Updated date' })
  updatedAt: Date;
}

export class UserDetailsResponseDto {
  @ApiProperty({ description: 'User ID' })
  id: string;

  @ApiProperty({ description: 'Email address' })
  email: string;

  @ApiProperty({ description: 'Phone number', required: false })
  phone?: string;

  @ApiProperty({ description: 'First name', required: false })
  firstName?: string;

  @ApiProperty({ description: 'Last name', required: false })
  lastName?: string;

  @ApiProperty({ description: 'Company name' })
  companyName: string;

  @ApiProperty({ description: 'User role', enum: UserRole })
  role: UserRole;

  @ApiProperty({ description: 'KYC status', enum: KycStatus })
  kycStatus: KycStatus;

  @ApiProperty({ description: 'Is active' })
  isActive: boolean;

  @ApiProperty({ description: 'Is email verified' })
  isEmailVerified: boolean;

  @ApiProperty({ description: 'Is phone verified' })
  isPhoneVerified: boolean;

  @ApiProperty({ description: 'Profile image URL', required: false })
  profileImage?: string;

  @ApiProperty({ description: 'Created date' })
  createdAt: Date;

  @ApiProperty({ description: 'Updated date' })
  updatedAt: Date;

  @ApiProperty({ description: 'User addresses', type: [AddressDetailsDto] })
  addresses: AddressDetailsDto[];

  @ApiProperty({ description: 'KYC details', required: false })
  kyc?: KycDetailsDto;

  @ApiProperty({ description: 'Bank details', required: false })
  bankDetails?: BankDetailsDto;
}
