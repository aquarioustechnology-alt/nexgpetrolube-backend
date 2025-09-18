import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsString, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';

export class AddressDto {
  @ApiProperty({ description: 'Address line 1' })
  @IsString()
  line1: string;

  @ApiProperty({ description: 'Address line 2', required: false })
  @IsOptional()
  @IsString()
  line2?: string;

  @ApiProperty({ description: 'City' })
  @IsString()
  city: string;

  @ApiProperty({ description: 'State' })
  @IsString()
  state: string;

  @ApiProperty({ description: 'Country', default: 'India' })
  @IsOptional()
  @IsString()
  country?: string;

  @ApiProperty({ description: 'Pincode' })
  @IsString()
  pincode: string;
}

export class KycSubmissionDto {
  @ApiProperty({ description: 'GST number' })
  @IsString()
  gstNumber: string;

  @ApiProperty({ description: 'PAN number' })
  @IsString()
  panNumber: string;

  @ApiProperty({ description: 'Aadhaar number' })
  @IsString()
  aadhaarNumber: string;

  @ApiProperty({ description: 'Communication address' })
  @ValidateNested()
  @Type(() => AddressDto)
  address: AddressDto;

  @ApiProperty({ description: 'Delivery address', required: false })
  @IsOptional()
  @ValidateNested()
  @Type(() => AddressDto)
  deliveryAddress?: AddressDto;

  @ApiProperty({ description: 'Uploaded file filenames', required: false })
  @IsOptional()
  uploadedFiles?: {
    authorizationLetter?: string;
    panDocument?: string;
    aadhaarDocument?: string;
    profilePicture?: string;
    gstCertificate?: string;
    companyRegistration?: string;
    bankStatement?: string;
    addressProof?: string;
  };
}
