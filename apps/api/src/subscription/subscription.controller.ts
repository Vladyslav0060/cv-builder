import {
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
import Stripe, { Event } from 'stripe';
import { AuthenticatedGuard } from 'src/auth/guards/authenticated.guard';
import { SafeUser } from 'src/user/user.select';

@Controller('subscription')
export class SubscriptionController {
  constructor(private subscriptionService: SubscriptionService) {}

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
  ): Promise<Event> {
    const rawBody = req.rawBody;
    if (!rawBody) throw new Error();
    return this.subscriptionService.constructEvent(rawBody, signature);
  }
}
