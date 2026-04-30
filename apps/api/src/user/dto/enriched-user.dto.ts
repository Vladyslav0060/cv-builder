import { ApiProperty } from '@nestjs/swagger';
import { UserRole } from './create-user.dto';

export class EnrichedUserDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  email: string;

  @ApiProperty({ nullable: true })
  firstName: string;

  @ApiProperty({ nullable: true })
  lastName: string;

  @ApiProperty({ nullable: true })
  avatarUrl: string;

  @ApiProperty({ enum: UserRole, example: UserRole.USER })
  role: UserRole;

  @ApiProperty({ nullable: true })
  address: string;

  @ApiProperty({ nullable: true })
  city: string;

  @ApiProperty({ nullable: true })
  state: string;

  @ApiProperty({ nullable: true })
  zip: string;

  @ApiProperty({ nullable: true })
  country: string;

  @ApiProperty({ nullable: true })
  linkedIn: string;

  @ApiProperty({ nullable: true })
  phone: string;

  @ApiProperty({ nullable: true })
  skills: string;

  @ApiProperty({ nullable: true })
  experience: string;

  @ApiProperty({ nullable: true })
  education: string;

  @ApiProperty({ nullable: true })
  achievements: string;

  @ApiProperty({ nullable: true })
  summary: string;

  @ApiProperty({ nullable: true })
  portfolio: string;

  @ApiProperty()
  createdAt: Date;

  @ApiProperty()
  updatedAt: Date;

  @ApiProperty({
    description: 'Percentage of non-empty profile fields',
    example: 75,
  })
  profileFilledPercentage: number;
}
