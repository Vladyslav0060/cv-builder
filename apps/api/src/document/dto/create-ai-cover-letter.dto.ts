import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsNotEmpty, IsOptional, IsString, MaxLength } from 'class-validator';

export class CreateAiCoverLetterDto {
  @ApiProperty({
    description:
      'Applicant identity, role, experience, signature details, and relevant background.',
  })
  @IsString()
  @IsNotEmpty()
  @MaxLength(6000)
  applicant: string;

  @ApiProperty({
    description:
      'Proposal target: job post, client problem, project requirements, company, or recipient context.',
  })
  @IsString()
  @IsNotEmpty()
  @MaxLength(12000)
  proposal: string;

  @ApiProperty({
    description:
      'Most relevant proof: matching achievements, projects, metrics, domain experience, or portfolio notes.',
  })
  @IsString()
  @IsNotEmpty()
  @MaxLength(8000)
  proof: string;

  @ApiPropertyOptional({
    description:
      'Preferred tone, constraints, call to action, availability, rate, or extra personalization.',
  })
  @IsOptional()
  @IsString()
  @MaxLength(4000)
  preferences?: string;
}
