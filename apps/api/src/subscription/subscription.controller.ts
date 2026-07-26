import {
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
import { CurrentSubscriptionDto } from './dto/current-subscription.dto';
import { SubscriptionApplicationService } from './subscription-application.service';

@Controller('subscription')
export class SubscriptionController {
  constructor(
    private subscriptionService: SubscriptionService,
    private subscriptionApplicationService: SubscriptionApplicationService,
  ) {}

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
    return this.subscriptionApplicationService.createCheckoutSession(
      currentUser.id,
      body,
    );
  }

  @Get('current')
  @UseGuards(AuthenticatedGuard)
  @ApiOkResponse({ type: CurrentSubscriptionDto })
  getCurrentSubscription(
    @CurrentUser() currentUser: SafeUser,
  ): Promise<CurrentSubscriptionDto> {
    return this.subscriptionService.getCurrentSubscription(currentUser.id);
  }

  @Post('cancel')
  @UseGuards(AuthenticatedGuard)
  async cancelSubscription(@CurrentUser() currentUser: SafeUser) {
    await this.subscriptionService.cancelSubscription(currentUser.id);
  }

  @Post('webhook')
  async webhookHandler(
    @Req() req: RawBodyRequest<Request>,
    @Headers('stripe-signature') signature: string,
  ) {
    await this.subscriptionApplicationService.handleWebhook(
      req.rawBody,
      signature,
    );
  }
}
