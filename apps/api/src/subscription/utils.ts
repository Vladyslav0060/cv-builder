import { SubscriptionStatus, Tier } from 'generated/prisma/enums';
import Stripe from 'stripe';

export const TIER_RANK: Record<Tier, number> = {
  [Tier.pro]: 1,
  [Tier.max]: 2,
};

export const ACTIVE_STATUSES: SubscriptionStatus[] = ['active', 'trialing'];

export type StripePriceConfig = {
  proMonthly: string;
  proSixMonth: string;
  maxMonthly: string;
  maxSixMonth: string;
};

export function getTierByPriceId(
  priceId: string,
  prices: StripePriceConfig,
): Tier {
  if ([prices.proMonthly, prices.proSixMonth].includes(priceId)) {
    return Tier.pro;
  }
  if ([prices.maxMonthly, prices.maxSixMonth].includes(priceId)) {
    return Tier.max;
  }
  throw new Error(`Unknown priceId: ${priceId}`);
}

export function extractSubscriptionFields(subscription: Stripe.Subscription): {
  id: string;
  status: Stripe.Subscription['status'];
  current_period_end: number;
  priceId: string;
} {
  const {
    id,
    status,
    items: { data: itemsData },
  } = subscription;
  const {
    current_period_end,
    price: { id: priceId },
  } = itemsData[0];
  return { id, status, current_period_end, priceId };
}
