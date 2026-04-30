import { ApiProperty } from '@nestjs/swagger';
import { UserRole } from '../../user/dto/create-user.dto';
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

  @ApiProperty({ enum: UserRole, example: UserRole.USER })
  role: string;

  @ApiProperty()
  createdAt: Date;

  @ApiProperty()
  updatedAt: Date;
}
