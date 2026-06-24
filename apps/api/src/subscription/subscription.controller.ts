import Stripe from 'stripe';
import {
  BadRequestException,
  Body,
  Controller,
  Headers,
  Post,
  RawBodyRequest,
  Req,
  UseGuards,
} from '@nestjs/common';
import { Request } from 'express';
import { SubscriptionService } from './subscription.service';
import { CurrentUser } from 'src/auth/decorators/current-user.decorator';
import { AuthenticatedGuard } from 'src/auth/guards/authenticated.guard';
import { SafeUser } from 'src/user/user.select';
import { TierGuard } from 'src/auth/guards/tier.guard';
import { RequireTier } from 'src/auth/decorators/require-tier.decorator';
import { Tier } from 'generated/prisma/enums';

@Controller('subscription')
export class SubscriptionController {
  constructor(private subscriptionService: SubscriptionService) {}

  @Post('test')
  @UseGuards(TierGuard)
  @RequireTier(Tier.pro)
  test() {
    console.log('test');
    return 'test succeed';
  }

  @Post('checkout-session')
  @UseGuards(AuthenticatedGuard)
  async createCheckoutSession(
    @CurrentUser() currentUser: SafeUser,
    @Body() body: { priceId: string },
  ): Promise<Stripe.Checkout.Session> {
    return this.subscriptionService.createCheckoutSession(
      currentUser.id,
      body.priceId,
    );
  }

  @Post('webhook')
  async webhookHandler(
    @Req() req: RawBodyRequest<Request>,
    @Headers('stripe-signature') signature: string,
  ) {
    let event: Stripe.Event;
    try {
      if (!req.rawBody) throw new BadRequestException('rawBody is missing');
      event = this.subscriptionService.constructEvent(req.rawBody, signature);
    } catch (error) {
      throw new BadRequestException('Webhook signature verification failed');
    }
    await this.subscriptionService.handleWebhookEvent(event);
  }
}
