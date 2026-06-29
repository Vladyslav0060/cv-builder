import { SubscriptionStatus, Tier } from 'generated/prisma/enums';
import Stripe from 'stripe';

export const TIER_RANK: Record<Tier, number> = {
  [Tier.pro]: 1,
  [Tier.max]: 2,
};

export const ACTIVE_STATUSES: SubscriptionStatus[] = ['active', 'trialing'];

export function getTierByPriceId(priceId: string): Tier {
  if (
    [
      process.env.STRIPE_PRO_MONTHLY_PRICE_ID,
      process.env.STRIPE_PRO_6M_PRICE_ID,
    ].includes(priceId)
  ) {
    return Tier.pro;
  }
  if (
    [
      process.env.STRIPE_MAX_MONTHLY_PRICE_ID,
      process.env.STRIPE_MAX_6M_PRICE_ID,
    ].includes(priceId)
  ) {
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
