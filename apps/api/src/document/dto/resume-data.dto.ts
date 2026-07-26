import { Type } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  ArrayMaxSize,
  IsArray,
  IsBoolean,
  IsEmail,
  IsEnum,
  IsOptional,
  IsString,
  IsUrl,
  MaxLength,
  ValidateNested,
} from 'class-validator';

export const ResumeTemplateIdDto = {
  CLASSIC: 'classic',
  MODERN: 'modern',
  MINIMAL: 'minimal',
} as const;

export type ResumeTemplateIdDto =
  (typeof ResumeTemplateIdDto)[keyof typeof ResumeTemplateIdDto];

export const ResumeColorSchemeIdDto = {
  SLATE: 'slate',
  FOREST: 'forest',
  WINE: 'wine',
  AMBER: 'amber',
  ORCHID: 'orchid',
  GRAPHITE: 'graphite',
  TEAL: 'teal',
  ROSE: 'rose',
} as const;

export type ResumeColorSchemeIdDto =
  (typeof ResumeColorSchemeIdDto)[keyof typeof ResumeColorSchemeIdDto];

export class ResumePersonalInfoDto {
  @ApiProperty()
  @IsString()
  @MaxLength(120)
  fullName: string;

  @ApiProperty()
  @IsString()
  @MaxLength(160)
  title: string;

  @ApiProperty()
  @IsEmail()
  @MaxLength(320)
  email: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(50)
  phone?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(200)
  location?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsUrl()
  @MaxLength(2048)
  website?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsUrl()
  @MaxLength(2048)
  linkedin?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsUrl()
  @MaxLength(2048)
  github?: string;
}

export class ResumeExperienceDto {
  @ApiProperty()
  @IsString()
  @MaxLength(100)
  id: string;

  @ApiProperty()
  @IsString()
  @MaxLength(160)
  company: string;

  @ApiProperty()
  @IsString()
  @MaxLength(160)
  position: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(160)
  location?: string;

  @ApiProperty()
  @IsString()
  @MaxLength(40)
  startDate: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(40)
  endDate?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  isCurrent?: boolean;

  @ApiProperty({ type: [String] })
  @IsArray()
  @ArrayMaxSize(20)
  @IsString({ each: true })
  @MaxLength(1000, { each: true })
  description: string[];
}

export class ResumeEducationDto {
  @ApiProperty()
  @IsString()
  @MaxLength(100)
  id: string;

  @ApiProperty()
  @IsString()
  @MaxLength(200)
  school: string;

  @ApiProperty()
  @IsString()
  @MaxLength(200)
  degree: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(200)
  field?: string;

  @ApiProperty()
  @IsString()
  @MaxLength(40)
  startDate: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(40)
  endDate?: string;
}

export class ResumeProjectDto {
  @ApiProperty()
  @IsString()
  @MaxLength(100)
  id: string;

  @ApiProperty()
  @IsString()
  @MaxLength(200)
  name: string;

  @ApiProperty({ type: [String] })
  @IsArray()
  @ArrayMaxSize(20)
  @IsString({ each: true })
  @MaxLength(1000, { each: true })
  description: string[];

  @ApiPropertyOptional({ type: [String] })
  @IsOptional()
  @IsArray()
  @ArrayMaxSize(30)
  @IsString({ each: true })
  @MaxLength(100, { each: true })
  technologies?: string[];

  @ApiPropertyOptional()
  @IsOptional()
  @IsUrl()
  @MaxLength(2048)
  link?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(40)
  startDate?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(40)
  endDate?: string;
}

export class ResumeCertificationDto {
  @ApiProperty()
  @IsString()
  @MaxLength(100)
  id: string;

  @ApiProperty()
  @IsString()
  @MaxLength(200)
  name: string;

  @ApiProperty()
  @IsString()
  @MaxLength(200)
  issuer: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(40)
  date?: string;
}

export class ResumeDataDto {
  @ApiProperty({ type: ResumePersonalInfoDto })
  @ValidateNested()
  @Type(() => ResumePersonalInfoDto)
  personalInfo: ResumePersonalInfoDto;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(4000)
  summary?: string;

  @ApiProperty({ type: [ResumeExperienceDto] })
  @IsArray()
  @ArrayMaxSize(30)
  @ValidateNested({ each: true })
  @Type(() => ResumeExperienceDto)
  experience: ResumeExperienceDto[];

  @ApiProperty({ type: [ResumeEducationDto] })
  @IsArray()
  @ArrayMaxSize(30)
  @ValidateNested({ each: true })
  @Type(() => ResumeEducationDto)
  education: ResumeEducationDto[];

  @ApiProperty({ type: [String] })
  @IsArray()
  @ArrayMaxSize(100)
  @IsString({ each: true })
  @MaxLength(100, { each: true })
  skills: string[];

  @ApiPropertyOptional({ type: [String] })
  @IsOptional()
  @IsArray()
  @ArrayMaxSize(50)
  @IsString({ each: true })
  @MaxLength(100, { each: true })
  languages?: string[];

  @ApiPropertyOptional({ type: [ResumeProjectDto] })
  @IsOptional()
  @IsArray()
  @ArrayMaxSize(30)
  @ValidateNested({ each: true })
  @Type(() => ResumeProjectDto)
  projects?: ResumeProjectDto[];

  @ApiPropertyOptional({ type: [ResumeCertificationDto] })
  @IsOptional()
  @IsArray()
  @ArrayMaxSize(30)
  @ValidateNested({ each: true })
  @Type(() => ResumeCertificationDto)
  certifications?: ResumeCertificationDto[];
}

export class ResumeExportPayloadDto {
  @ApiProperty({ type: ResumeDataDto })
  @ValidateNested()
  @Type(() => ResumeDataDto)
  resume: ResumeDataDto;

  @ApiPropertyOptional({ enum: ResumeTemplateIdDto })
  @IsOptional()
  @IsEnum(ResumeTemplateIdDto)
  template?: ResumeTemplateIdDto;

  @ApiPropertyOptional({ enum: ResumeColorSchemeIdDto })
  @IsOptional()
  @IsEnum(ResumeColorSchemeIdDto)
  colorScheme?: ResumeColorSchemeIdDto;
}
