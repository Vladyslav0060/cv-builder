import Stripe, { Event } from 'stripe';
import { Injectable, OnModuleInit } from '@nestjs/common';
import { SubscriptionStatus } from 'generated/prisma/enums';
import { PrismaService } from 'src/prisma/prisma.service';
import { extractSubscriptionFields, getTierByPriceId } from './utils';

@Injectable()
export class SubscriptionService implements OnModuleInit {
  constructor(private readonly prisma: PrismaService) {}

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

        await this.prisma.$transaction(async (tx) => {
          await tx.user.update({
            data: { stripeCustomerId: stripeCustomerId as string },
            where: { id: client_reference_id as string },
          });

          await tx.subscription.upsert({
            create: {
              userId: client_reference_id as string,
              stripeSubscriptionId: stripeSubscription.id,
              status: stripeSubscription.status as SubscriptionStatus,
              currentPeriodEnd: new Date(current_period_end * 1000),
              priceId,
              tier,
            },
            update: {
              status: stripeSubscription.status as SubscriptionStatus,
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
        await this.prisma.subscription.update({
          data: {
            status: stripeSubscription.status as SubscriptionStatus,
            currentPeriodEnd: new Date(current_period_end * 1000),
          },
          where: {
            stripeSubscriptionId: stripeSubscription.id,
          },
        });
        break;
      }
      case 'customer.subscription.deleted': {
        const stripeSubscription = event.data.object;
        await this.prisma.subscription.update({
          data: { status: SubscriptionStatus.canceled },
          where: {
            stripeSubscriptionId: stripeSubscription.id,
          },
        });
        break;
      }
    }
  }
}
