import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsNotEmpty, IsOptional, IsString, MaxLength } from 'class-validator';

export class CreateAiResumeDto {
  @ApiProperty({
    description:
      'Short personal introduction: name, current role, seniority, location, contact details, and career direction.',
  })
  @IsString()
  @IsNotEmpty()
  @MaxLength(4000)
  introduction: string;

  @ApiProperty({
    description:
      'Raw work history, responsibilities, achievements, skills, education, projects, and certifications.',
  })
  @IsString()
  @IsNotEmpty()
  @MaxLength(16000)
  background: string;

  @ApiPropertyOptional({
    description:
      'Target role, job description, company, industry, or desired positioning.',
  })
  @IsOptional()
  @IsString()
  @MaxLength(12000)
  target?: string;
}
