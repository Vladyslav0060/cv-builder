import { Module } from '@nestjs/common';
import { SubscriptionService } from './subscription.service';
import { SubscriptionController } from './subscription.controller';
import { SubscriptionApplicationService } from './subscription-application.service';
import { PrismaModule } from 'src/prisma/prisma.module';
import { UsageModule } from 'src/usage/usage.module';

@Module({
  imports: [PrismaModule, UsageModule],
  providers: [SubscriptionService, SubscriptionApplicationService],
  controllers: [SubscriptionController],
})
export class SubscriptionModule {}
