import { BadRequestException, Injectable } from '@nestjs/common';
import Stripe from 'stripe';
import { CheckoutSessionDto } from './dto/checkout-session.dto';
import { CreateCheckoutSessionDto } from './dto/create-checkout-session.dto';
import { SubscriptionService } from './subscription.service';

@Injectable()
export class SubscriptionApplicationService {
  constructor(private readonly subscriptionService: SubscriptionService) {}

  async createCheckoutSession(
    userId: string,
    body: CreateCheckoutSessionDto,
  ): Promise<CheckoutSessionDto> {
    const session = await this.subscriptionService.createCheckoutSession(
      userId,
      body.priceId,
    );
    return { url: session.url };
  }

  async handleWebhook(rawBody: Buffer | undefined, signature: string) {
    let event: Stripe.Event;
    try {
      if (!rawBody) throw new BadRequestException('rawBody is missing');
      event = this.subscriptionService.constructEvent(rawBody, signature);
    } catch {
      throw new BadRequestException('Webhook signature verification failed');
    }

    await this.subscriptionService.handleWebhookEvent(event);
  }
}
