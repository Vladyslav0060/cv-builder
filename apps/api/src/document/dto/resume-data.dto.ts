import { Type } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsArray,
  IsBoolean,
  IsEnum,
  IsOptional,
  IsString,
  ValidateNested,
} from 'class-validator';

export enum ResumeTemplateIdDto {
  CLASSIC = 'classic',
  MODERN = 'modern',
}

export enum ResumeColorSchemeIdDto {
  SLATE = 'slate',
  FOREST = 'forest',
  WINE = 'wine',
}

export class ResumePersonalInfoDto {
  @ApiProperty()
  @IsString()
  fullName: string;

  @ApiProperty()
  @IsString()
  title: string;

  @ApiProperty()
  @IsString()
  email: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  phone?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  location?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  website?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  linkedin?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  github?: string;
}

export class ResumeExperienceDto {
  @ApiProperty()
  @IsString()
  id: string;

  @ApiProperty()
  @IsString()
  company: string;

  @ApiProperty()
  @IsString()
  position: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  location?: string;

  @ApiProperty()
  @IsString()
  startDate: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  endDate?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  isCurrent?: boolean;

  @ApiProperty({ type: [String] })
  @IsArray()
  @IsString({ each: true })
  description: string[];
}

export class ResumeEducationDto {
  @ApiProperty()
  @IsString()
  id: string;

  @ApiProperty()
  @IsString()
  school: string;

  @ApiProperty()
  @IsString()
  degree: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  field?: string;

  @ApiProperty()
  @IsString()
  startDate: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  endDate?: string;
}

export class ResumeDataDto {
  @ApiProperty({ type: ResumePersonalInfoDto })
  @ValidateNested()
  @Type(() => ResumePersonalInfoDto)
  personalInfo: ResumePersonalInfoDto;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  summary?: string;

  @ApiProperty({ type: [ResumeExperienceDto] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ResumeExperienceDto)
  experience: ResumeExperienceDto[];

  @ApiProperty({ type: [ResumeEducationDto] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ResumeEducationDto)
  education: ResumeEducationDto[];

  @ApiProperty({ type: [String] })
  @IsArray()
  @IsString({ each: true })
  skills: string[];

  @ApiPropertyOptional({ type: [String] })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  languages?: string[];
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
