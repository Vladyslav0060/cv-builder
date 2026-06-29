import { ApiProperty } from '@nestjs/swagger';
import { Tier } from 'generated/prisma/enums';

export class PlanDto {
  @ApiProperty({ enum: Tier, nullable: true })
  tier: Tier | null;

  @ApiProperty()
  name: string;

  @ApiProperty()
  currency: string;

  @ApiProperty({ type: Number, nullable: true })
  monthlyAmount: number | null;

  @ApiProperty({ type: String, nullable: true })
  monthlyPriceId: string | null;

  @ApiProperty({ type: Number, nullable: true })
  sixMonthAmount: number | null;

  @ApiProperty({ type: String, nullable: true })
  sixMonthPriceId: string | null;
}
