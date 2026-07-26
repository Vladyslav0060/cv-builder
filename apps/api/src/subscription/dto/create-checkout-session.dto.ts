import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, Matches, MaxLength } from 'class-validator';

export class CreateCheckoutSessionDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  @Matches(/^price_[A-Za-z0-9_]+$/)
  @MaxLength(255)
  priceId: string;
}
