import { ApiProperty } from '@nestjs/swagger';
import { IsNumberString, Length } from 'class-validator';

export class VerifyEmailDto {
  @ApiProperty({ description: '6-digit verification code sent to email' })
  @IsNumberString()
  @Length(6, 6)
  code: string;
}
