import { Type } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsEnum, IsOptional, IsString, ValidateNested } from 'class-validator';
import { DocumentType } from 'generated/prisma/enums';

export class DocumentApplicantInfoDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  firstName?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  lastName?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  email?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  phone?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  avatarUrl?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  address?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  city?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  state?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  zip?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  country?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  linkedIn?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  portfolio?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  summary?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  skills?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  experience?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  education?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  achievements?: string;
}

export enum CreateDocumentDtoCreationMode {
  ACCOUNT = 'ACCOUNT',
  SCRATCH = 'SCRATCH',
}

export class CreateDocumentDto {
  @ApiProperty({ required: true })
  @IsString()
  jobTitle: string;

  @ApiProperty({ required: true })
  @IsString()
  company: string;

  @ApiProperty({ required: true })
  @IsString()
  description: string;

  @ApiProperty({
    required: false,
    enum: CreateDocumentDtoCreationMode,
    default: CreateDocumentDtoCreationMode.ACCOUNT,
  })
  @IsEnum(CreateDocumentDtoCreationMode)
  @IsOptional()
  creationMode?: CreateDocumentDtoCreationMode;

  @ApiProperty({
    required: true,
    enum: DocumentType,
    enumName: 'DocumentType',
  })
  @IsEnum(DocumentType)
  type: DocumentType;

  @ApiPropertyOptional({ type: DocumentApplicantInfoDto })
  @IsOptional()
  @ValidateNested()
  @Type(() => DocumentApplicantInfoDto)
  applicantInfo?: DocumentApplicantInfoDto;
}
