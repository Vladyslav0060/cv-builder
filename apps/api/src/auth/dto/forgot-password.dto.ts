import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, MaxLength } from 'class-validator';

export class ForgotPasswordDto {
  @ApiProperty({ format: 'email', example: 'john.doe@example.com' })
  @IsEmail()
  @MaxLength(320)
  email: string;
}
