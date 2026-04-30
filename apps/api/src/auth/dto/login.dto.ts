import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsString, MinLength } from 'class-validator';

export class LoginDto {
  @ApiProperty({ format: 'email' })
  @IsString()
  @IsEmail()
  email: string;

  @ApiProperty({ minLength: 3 })
  @IsString()
  @MinLength(3)
  password: string;
}
