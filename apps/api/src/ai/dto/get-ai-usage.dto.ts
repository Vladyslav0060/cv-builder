import { ApiProperty } from '@nestjs/swagger';
import { IsBoolean, IsInt } from 'class-validator';

export class GetAiUsageDto {
  @ApiProperty()
  @IsInt()
  used: number;

  @ApiProperty()
  @IsInt()
  total: number;

  @ApiProperty()
  @IsInt()
  remaining: number;

  @ApiProperty()
  @IsBoolean()
  unlimited: boolean;
}
