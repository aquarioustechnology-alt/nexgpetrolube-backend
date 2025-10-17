import { ApiProperty } from '@nestjs/swagger';

export class AddressDto {
  @ApiProperty({ description: 'Address ID' })
  id: string;

  @ApiProperty({ description: 'Address type' })
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

  @ApiProperty({ description: 'PIN/Postal code' })
  pincode: string;

  @ApiProperty({ description: 'Is default address' })
  isDefault: boolean;
}

export class KycDocumentDto {
  @ApiProperty({ description: 'Document ID' })
  id: string;

  @ApiProperty({ description: 'Document type' })
  type: string;

  @ApiProperty({ description: 'Document URL' })
  url: string;

  @ApiProperty({ description: 'Document name' })
  name: string;
}

export class KycDto {
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

  @ApiProperty({ description: 'KYC status' })
  kycStatus: string;

  @ApiProperty({ description: 'Rejection reason', required: false })
  rejectionReason?: string;

  @ApiProperty({ description: 'Submitted at' })
  submittedAt: string;

  @ApiProperty({ description: 'KYC documents' })
  documents: KycDocumentDto[];
}

export class BankDetailDto {
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
}

export class ProfileResponseDto {
  @ApiProperty({ description: 'User ID' })
  id: string;

  @ApiProperty({ description: 'Email address' })
  email: string;

  @ApiProperty({ description: 'Phone number' })
  phone?: string;

  @ApiProperty({ description: 'First name' })
  firstName?: string;

  @ApiProperty({ description: 'Last name' })
  lastName?: string;

  @ApiProperty({ description: 'Company name' })
  companyName: string;

  @ApiProperty({ description: 'User role' })
  role: string;

  @ApiProperty({ description: 'KYC status' })
  kycStatus: string;

  @ApiProperty({ description: 'Is active' })
  isActive: boolean;

  @ApiProperty({ description: 'Is email verified' })
  isEmailVerified: boolean;

  @ApiProperty({ description: 'Is phone verified' })
  isPhoneVerified: boolean;

  @ApiProperty({ description: 'Profile image URL' })
  profileImage?: string;

  @ApiProperty({ description: 'Date of birth' })
  dateOfBirth?: string;

  @ApiProperty({ description: 'Gender' })
  gender?: string;

  @ApiProperty({ description: 'Account type' })
  accountType?: string;

  @ApiProperty({ description: 'Created at' })
  createdAt: string;

  @ApiProperty({ description: 'Updated at' })
  updatedAt: string;

  @ApiProperty({ description: 'User addresses' })
  addresses: AddressDto[];

  @ApiProperty({ description: 'KYC information' })
  kyc?: KycDto;

  @ApiProperty({ description: 'Bank details' })
  bankDetails?: BankDetailDto;

  @ApiProperty({ description: 'Profile completion percentage' })
  profileCompletion: number;
}
