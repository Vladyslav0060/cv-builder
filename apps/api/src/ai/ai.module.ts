import { Global, Module } from '@nestjs/common';
import { AiService } from './ai.service';
import { ConfigModule } from '@nestjs/config';
import { PrismaModule } from 'src/prisma/prisma.module';
import { AiRequestLimiterService } from './ai-request-limiter.service';
import { AiController } from './ai.controller';

@Global()
@Module({
  controllers: [AiController],
  imports: [ConfigModule, PrismaModule],
  providers: [AiService, AiRequestLimiterService],
  exports: [AiService],
})
export class AiModule {}
