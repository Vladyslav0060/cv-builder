import { Body, Controller, Post, UseGuards } from '@nestjs/common';
import { SubscriptionService } from './subscription.service';
import { CurrentUser } from 'src/auth/decorators/current-user.decorator';
import Stripe from 'stripe';
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
}
