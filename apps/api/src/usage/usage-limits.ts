import { Tier } from 'generated/prisma/enums';

export type UsageActionType = 'CREATE' | 'EXPORT';
export type ResolvedTier = 'free' | Tier;

export const TIER_DAILY_LIMITS: Record<
  ResolvedTier,
  Record<UsageActionType, number>
> = {
  free: { CREATE: 1, EXPORT: 1 },
  [Tier.pro]: { CREATE: 10, EXPORT: 10 },
  [Tier.max]: { CREATE: 50, EXPORT: 50 },
};
