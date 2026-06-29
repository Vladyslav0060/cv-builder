import { ApiProperty } from '@nestjs/swagger';
import { SubscriptionStatus, Tier } from 'generated/prisma/enums';

export class UsageLimitsDto {
  @ApiProperty()
  CREATE: number;

  @ApiProperty()
  EXPORT: number;
}

export class CurrentSubscriptionDto {
  @ApiProperty({ enum: ['free', ...Object.values(Tier)] })
  tier: 'free' | Tier;

  @ApiProperty({ enum: SubscriptionStatus, nullable: true })
  status: SubscriptionStatus | null;

  @ApiProperty({ type: Date, nullable: true })
  currentPeriodEnd: Date | null;

  @ApiProperty()
  cancelAtPeriodEnd: boolean;

  @ApiProperty({ type: UsageLimitsDto })
  limits: UsageLimitsDto;
}
