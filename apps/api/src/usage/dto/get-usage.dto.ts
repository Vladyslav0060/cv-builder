import { ApiProperty } from '@nestjs/swagger';
import { IsBoolean, IsInt, IsString } from 'class-validator';

export class UsageBreakdownDto {
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

export class GetUsageDto {
  @ApiProperty()
  @IsString()
  tier: string;

  @ApiProperty({ type: UsageBreakdownDto })
  create: UsageBreakdownDto;

  @ApiProperty({ type: UsageBreakdownDto })
  export: UsageBreakdownDto;
}
