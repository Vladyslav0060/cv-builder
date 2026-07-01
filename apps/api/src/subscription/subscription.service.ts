import Stripe, { Event } from 'stripe';
import {
  BadRequestException,
  Injectable,
  NotFoundException,
  OnModuleInit,
} from '@nestjs/common';
import { SubscriptionStatus, Tier } from 'generated/prisma/enums';
import { PrismaService } from 'src/prisma/prisma.service';
import { extractSubscriptionFields, getTierByPriceId } from './utils';
import { TIER_DAILY_LIMITS } from 'src/usage/usage-limits';
import { UsageQuotaService } from 'src/usage/usage-quota.service';
import { PlanDto } from './dto/get-plans.dto';
import { CurrentSubscriptionDto } from './dto/current-subscription.dto';

@Injectable()
export class SubscriptionService implements OnModuleInit {
  constructor(
    private readonly prisma: PrismaService,
    private readonly usageQuotaService: UsageQuotaService,
  ) {}

  onModuleInit() {
    const required = [
      'STRIPE_SECRET_KEY',
      'STRIPE_WEBHOOK_SECRET',
      'STRIPE_PRO_MONTHLY_PRICE_ID',
      'STRIPE_PRO_6M_PRICE_ID',
      'STRIPE_MAX_MONTHLY_PRICE_ID',
      'STRIPE_MAX_6M_PRICE_ID',
    ];
    const missing = required.filter((key) => !process.env[key]);
    if (missing.length) {
      throw new Error(`Missing env vars: ${missing.join(', ')}`);
    }
  }
  private readonly stripe = new Stripe(
    process.env.STRIPE_SECRET_KEY as string,
    {
      apiVersion: '2026-05-27.dahlia',
    },
  );

  async createCheckoutSession(
    userId: string,
    priceId: string,
  ): Promise<Stripe.Checkout.Session> {
    const session = await this.stripe.checkout.sessions.create({
      client_reference_id: userId,
      success_url: `${process.env.WEB_BASE_URL}/checkout/success`,
      cancel_url: `${process.env.WEB_BASE_URL}/checkout/cancel`,
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      mode: 'subscription',
    });
    return session;
  }

  async getPlans(): Promise<PlanDto[]> {
    const [proMonthly, proSixMonth, maxMonthly, maxSixMonth] =
      await Promise.all(
        [
          process.env.STRIPE_PRO_MONTHLY_PRICE_ID,
          process.env.STRIPE_PRO_6M_PRICE_ID,
          process.env.STRIPE_MAX_MONTHLY_PRICE_ID,
          process.env.STRIPE_MAX_6M_PRICE_ID,
        ].map((priceId) => this.stripe.prices.retrieve(priceId as string)),
      );

    const freePlan: PlanDto = {
      tier: null,
      name: 'Free',
      currency: proMonthly.currency,
      monthlyAmount: 0,
      monthlyPriceId: null,
      sixMonthAmount: 0,
      sixMonthPriceId: null,
    };
    const proPlan: PlanDto = {
      tier: Tier.pro,
      name: 'Pro',
      currency: proMonthly.currency,
      monthlyAmount: proMonthly.unit_amount,
      monthlyPriceId: proMonthly.id,
      sixMonthAmount: proSixMonth.unit_amount,
      sixMonthPriceId: proSixMonth.id,
    };
    const maxPlan: PlanDto = {
      tier: Tier.max,
      name: 'Max',
      currency: maxMonthly.currency,
      monthlyAmount: maxMonthly.unit_amount,
      monthlyPriceId: maxMonthly.id,
      sixMonthAmount: maxSixMonth.unit_amount,
      sixMonthPriceId: maxSixMonth.id,
    };

    return [freePlan, proPlan, maxPlan];
  }

  async getCurrentSubscription(
    userId: string,
  ): Promise<CurrentSubscriptionDto> {
    const subscription = await this.prisma.forUser(userId, (tx) =>
      tx.subscription.findUnique({
        where: { userId },
        select: {
          tier: true,
          status: true,
          currentPeriodEnd: true,
          cancelAtPeriodEnd: true,
        },
      }),
    );

    const tier = await this.usageQuotaService.resolveTier(userId);

    return {
      tier,
      status: subscription?.status ?? null,
      currentPeriodEnd: subscription?.currentPeriodEnd ?? null,
      cancelAtPeriodEnd: subscription?.cancelAtPeriodEnd ?? false,
      limits: TIER_DAILY_LIMITS[tier],
    };
  }

  async cancelSubscription(userId: string): Promise<void> {
    const subscription = await this.prisma.forUser(userId, (tx) =>
      tx.subscription.findUnique({
        where: { userId },
        select: { stripeSubscriptionId: true, status: true },
      }),
    );

    if (!subscription) {
      throw new NotFoundException('No active subscription found');
    }
    if (subscription.status === SubscriptionStatus.canceled) {
      throw new BadRequestException('Subscription is already canceled');
    }

    await this.stripe.subscriptions.update(subscription.stripeSubscriptionId, {
      cancel_at_period_end: true,
    });

    await this.prisma.forUser(userId, (tx) =>
      tx.subscription.update({
        where: { userId },
        data: { cancelAtPeriodEnd: true },
      }),
    );
  }

  constructEvent(rawBody: string | Buffer, signature: string): Event {
    return this.stripe.webhooks.constructEvent(
      rawBody,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET as string,
    );
  }

  async handleWebhookEvent(event: Stripe.Event) {
    switch (event.type) {
      case 'checkout.session.completed': {
        const {
          client_reference_id,
          customer: stripeCustomerId,
          subscription,
        } = event.data.object;
        if (!client_reference_id) return;

        const stripeSubscription = await this.stripe.subscriptions.retrieve(
          subscription as string,
        );

        const { current_period_end, priceId } =
          extractSubscriptionFields(stripeSubscription);

        const tier = getTierByPriceId(priceId);

        await this.prisma.forSystem(async (tx) => {
          await tx.user.update({
            data: { stripeCustomerId: stripeCustomerId as string },
            where: { id: client_reference_id },
          });

          await tx.subscription.upsert({
            create: {
              userId: client_reference_id,
              stripeSubscriptionId: stripeSubscription.id,
              status: stripeSubscription.status,
              currentPeriodEnd: new Date(current_period_end * 1000),
              priceId,
              tier,
            },
            update: {
              status: stripeSubscription.status,
              currentPeriodEnd: new Date(current_period_end * 1000),
            },
            where: { stripeSubscriptionId: stripeSubscription.id },
          });
        });
        break;
      }
      case 'customer.subscription.updated': {
        const stripeSubscription = event.data.object;
        const { current_period_end } =
          extractSubscriptionFields(stripeSubscription);
        await this.prisma.forSystem((tx) =>
          tx.subscription.update({
            data: {
              status: stripeSubscription.status,
              currentPeriodEnd: new Date(current_period_end * 1000),
              cancelAtPeriodEnd: stripeSubscription.cancel_at_period_end,
            },
            where: {
              stripeSubscriptionId: stripeSubscription.id,
            },
          }),
        );
        break;
      }
      case 'customer.subscription.deleted': {
        const stripeSubscription = event.data.object;
        await this.prisma.forSystem((tx) =>
          tx.subscription.update({
            data: { status: SubscriptionStatus.canceled },
            where: {
              stripeSubscriptionId: stripeSubscription.id,
            },
          }),
        );
        break;
      }
    }
  }
}
