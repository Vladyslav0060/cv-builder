import { ApiProperty } from '@nestjs/swagger';
import { IsString, Matches } from 'class-validator';

export class VerifyEmailDto {
  @ApiProperty({ description: '6-digit verification code sent to email' })
  @IsString()
  @Matches(/^\d{6}$/)
  code: string;
}
