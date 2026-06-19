import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsString } from 'class-validator';

export class MeDto {
  @ApiProperty()
  id: string;

  @ApiProperty({ example: 'john.doe@example.com' })
  @IsEmail()
  email: string;

  @ApiProperty({ required: false, nullable: true })
  @IsString()
  firstName: string;

  @ApiProperty({ required: false, nullable: true })
  @IsString()
  lastName: string;

  @ApiProperty({ required: false, nullable: true })
  avatarUrl: string;

  @ApiProperty()
  emailVerified: boolean;

  @ApiProperty()
  createdAt: Date;

  @ApiProperty()
  updatedAt: Date;
}
