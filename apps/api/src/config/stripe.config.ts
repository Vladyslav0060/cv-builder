import { registerAs } from '@nestjs/config';
import { requiredEnv } from './env';

export const stripeConfig = registerAs('stripe', () => ({
  secretKey: requiredEnv('STRIPE_SECRET_KEY'),
  webhookSecret: requiredEnv('STRIPE_WEBHOOK_SECRET'),
  apiVersion: '2026-05-27.dahlia' as const,
  prices: {
    proMonthly: requiredEnv('STRIPE_PRO_MONTHLY_PRICE_ID'),
    proSixMonth: requiredEnv('STRIPE_PRO_6M_PRICE_ID'),
    maxMonthly: requiredEnv('STRIPE_MAX_MONTHLY_PRICE_ID'),
    maxSixMonth: requiredEnv('STRIPE_MAX_6M_PRICE_ID'),
  },
}));
