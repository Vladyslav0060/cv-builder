import Stripe, { Event } from 'stripe';
import {
  BadRequestException,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { ConfigType } from '@nestjs/config';
import { SubscriptionStatus, Tier } from 'generated/prisma/enums';
import { PrismaService } from 'src/prisma/prisma.service';
import {
  extractSubscriptionFields,
  getTierByPriceId,
  isAllowedPriceId,
} from './utils';
import { TIER_DAILY_LIMITS } from 'src/usage/usage-limits';
import { UsageQuotaService } from 'src/usage/usage-quota.service';
import { PlanDto } from './dto/get-plans.dto';
import { CurrentSubscriptionDto } from './dto/current-subscription.dto';
import { stripeConfig, webConfig } from 'src/config';

@Injectable()
export class SubscriptionService {
  private readonly stripe: Stripe;

  constructor(
    private readonly prisma: PrismaService,
    private readonly usageQuotaService: UsageQuotaService,
    @Inject(stripeConfig.KEY)
    private readonly stripeCfg: ConfigType<typeof stripeConfig>,
    @Inject(webConfig.KEY)
    private readonly web: ConfigType<typeof webConfig>,
  ) {
    this.stripe = new Stripe(this.stripeCfg.secretKey, {
      apiVersion: this.stripeCfg.apiVersion,
    });
  }

  async createCheckoutSession(
    userId: string,
    priceId: string,
  ): Promise<Stripe.Checkout.Session> {
    if (!isAllowedPriceId(priceId, this.stripeCfg.prices)) {
      throw new BadRequestException('Unknown subscription price');
    }

    const customerId = await this.getOrCreateStripeCustomer(userId);

    const existingSubscription = await this.prisma.forUser(userId, (tx) =>
      tx.subscription.findUnique({
        where: { userId },
        select: { stripeSubscriptionId: true, status: true },
      }),
    );

    if (
      existingSubscription &&
      existingSubscription.status !== SubscriptionStatus.canceled
    ) {
      await this.updateExistingSubscription(
        userId,
        existingSubscription,
        priceId,
      );
      return { url: null } as Stripe.Checkout.Session;
    }

    const session = await this.stripe.checkout.sessions.create({
      client_reference_id: userId,
      customer: customerId,
      success_url: `${this.web.baseUrl}/checkout/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${this.web.baseUrl}/checkout/cancel`,
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

  private async updateExistingSubscription(
    userId: string,
    subscription: { stripeSubscriptionId: string },
    priceId: string,
  ): Promise<void> {
    const stripeSubscription = await this.stripe.subscriptions.retrieve(
      subscription.stripeSubscriptionId,
    );

    const itemId = stripeSubscription.items.data[0]?.id;
    if (!itemId) {
      throw new BadRequestException('Subscription item not found');
    }

    const updatedSubscription = await this.stripe.subscriptions.update(
      subscription.stripeSubscriptionId,
      {
        cancel_at_period_end: false,
        items: [{ id: itemId, price: priceId }],
        proration_behavior: 'create_prorations',
      },
    );

    await this.persistSubscription(userId, updatedSubscription);
  }

  private async getOrCreateStripeCustomer(userId: string): Promise<string> {
    const user = await this.prisma.forUser(userId, (tx) =>
      tx.user.findUnique({
        where: { id: userId },
        select: { email: true, stripeCustomerId: true },
      }),
    );

    if (!user) {
      throw new NotFoundException('User not found');
    }
    if (user.stripeCustomerId) {
      return user.stripeCustomerId;
    }

    const customer = await this.stripe.customers.create({
      email: user.email,
      metadata: { userId },
    });

    await this.prisma.forUser(userId, (tx) =>
      tx.user.update({
        where: { id: userId },
        data: { stripeCustomerId: customer.id },
      }),
    );

    return customer.id;
  }

  async getPlans(): Promise<PlanDto[]> {
    const [proMonthly, proSixMonth, maxMonthly, maxSixMonth] =
      await Promise.all(
        [
          this.stripeCfg.prices.proMonthly,
          this.stripeCfg.prices.proSixMonth,
          this.stripeCfg.prices.maxMonthly,
          this.stripeCfg.prices.maxSixMonth,
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
      this.stripeCfg.webhookSecret,
    );
  }

  async handleWebhookEvent(event: Stripe.Event) {
    await this.prisma.forSystem(async (tx) => {
      try {
        await tx.stripeWebhookEvent.create({
          data: {
            id: event.id,
            type: event.type,
          },
        });
      } catch (error) {
        if (this.isUniqueConstraintError(error)) {
          return;
        }
        throw error;
      }

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

          const tier = getTierByPriceId(priceId, this.stripeCfg.prices);

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
              stripeSubscriptionId: stripeSubscription.id,
              status: stripeSubscription.status,
              currentPeriodEnd: new Date(current_period_end * 1000),
              cancelAtPeriodEnd: stripeSubscription.cancel_at_period_end,
              priceId,
              tier,
            },
            where: { userId: client_reference_id },
          });
          break;
        }
        case 'customer.subscription.updated': {
          const stripeSubscription = event.data.object;
          await tx.subscription.update({
            data: {
              ...this.getSubscriptionPersistenceData(stripeSubscription),
              cancelAtPeriodEnd: stripeSubscription.cancel_at_period_end,
            },
            where: {
              stripeSubscriptionId: stripeSubscription.id,
            },
          });
          break;
        }
        case 'customer.subscription.deleted': {
          const stripeSubscription = event.data.object;
          await tx.subscription.update({
            data: { status: SubscriptionStatus.canceled },
            where: {
              stripeSubscriptionId: stripeSubscription.id,
            },
          });
          break;
        }
      }
    });
  }

  private async persistSubscription(
    userId: string,
    stripeSubscription: Stripe.Subscription,
  ): Promise<void> {
    await this.prisma.forUser(userId, (tx) =>
      tx.subscription.update({
        data: {
          ...this.getSubscriptionPersistenceData(stripeSubscription),
          cancelAtPeriodEnd: stripeSubscription.cancel_at_period_end,
        },
        where: { userId },
      }),
    );
  }

  private getSubscriptionPersistenceData(
    stripeSubscription: Stripe.Subscription,
  ) {
    const { current_period_end, priceId } =
      extractSubscriptionFields(stripeSubscription);

    return {
      stripeSubscriptionId: stripeSubscription.id,
      status: stripeSubscription.status,
      currentPeriodEnd: new Date(current_period_end * 1000),
      priceId,
      tier: getTierByPriceId(priceId, this.stripeCfg.prices),
    };
  }

  private isUniqueConstraintError(error: unknown): boolean {
    return (
      typeof error === 'object' &&
      error !== null &&
      'code' in error &&
      error.code === 'P2002'
    );
  }
}
