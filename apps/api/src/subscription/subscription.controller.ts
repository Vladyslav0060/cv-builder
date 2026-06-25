import Stripe from 'stripe';
import {
  BadRequestException,
  Body,
  Controller,
  Get,
  Headers,
  Post,
  RawBodyRequest,
  Req,
  UseGuards,
} from '@nestjs/common';
import { ApiBody, ApiOkResponse } from '@nestjs/swagger';
import { Request } from 'express';
import { SubscriptionService } from './subscription.service';
import { CurrentUser } from 'src/auth/decorators/current-user.decorator';
import { AuthenticatedGuard } from 'src/auth/guards/authenticated.guard';
import { SafeUser } from 'src/user/user.select';
import { TierGuard } from 'src/auth/guards/tier.guard';
import { RequireTier } from 'src/auth/decorators/require-tier.decorator';
import { Tier } from 'generated/prisma/enums';
import { PlanDto } from './dto/get-plans.dto';
import { CreateCheckoutSessionDto } from './dto/create-checkout-session.dto';
import { CheckoutSessionDto } from './dto/checkout-session.dto';

@Controller('subscription')
export class SubscriptionController {
  constructor(private subscriptionService: SubscriptionService) {}

  @Get('plans')
  @ApiOkResponse({ type: [PlanDto] })
  getPlans(): Promise<PlanDto[]> {
    return this.subscriptionService.getPlans();
  }

  @Post('test')
  @UseGuards(TierGuard)
  @RequireTier(Tier.pro)
  test() {
    console.log('test');
    return 'test succeed';
  }

  @Post('checkout-session')
  @UseGuards(AuthenticatedGuard)
  @ApiBody({ type: CreateCheckoutSessionDto })
  @ApiOkResponse({ type: CheckoutSessionDto })
  async createCheckoutSession(
    @CurrentUser() currentUser: SafeUser,
    @Body() body: CreateCheckoutSessionDto,
  ): Promise<CheckoutSessionDto> {
    const session = await this.subscriptionService.createCheckoutSession(
      currentUser.id,
      body.priceId,
    );
    return { url: session.url };
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
