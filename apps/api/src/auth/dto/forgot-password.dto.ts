import { ApiProperty } from '@nestjs/swagger';
import { IsEmail } from 'class-validator';

export class ForgotPasswordDto {
  @ApiProperty({ format: 'email', example: 'john.doe@example.com' })
  @IsEmail()
  email: string;
}
