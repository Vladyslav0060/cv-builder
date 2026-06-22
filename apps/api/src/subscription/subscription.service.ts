import { Injectable } from '@nestjs/common';
import Stripe, { Event } from 'stripe';

@Injectable()
export class SubscriptionService {
  constructor() {}
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

  async constructEvent(
    rawBody: string | Buffer,
    signature: string,
  ): Promise<Event> {
    return this.stripe.webhooks.constructEvent(
      rawBody,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET as string,
    );
  }
}
