import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { PrismaModule } from 'src/prisma/prisma.module';
import { UsageQuotaService } from './usage-quota.service';
import { UsageController } from './usage.controller';

@Module({
  imports: [ConfigModule, PrismaModule],
  controllers: [UsageController],
  providers: [UsageQuotaService],
  exports: [UsageQuotaService],
})
export class UsageModule {}
