import { Global, Module } from '@nestjs/common';
import { AiService } from './ai.service';
import { ConfigModule } from '@nestjs/config';
import { PrismaModule } from 'src/prisma/prisma.module';
import { AiRequestLimiterService } from './ai-request-limiter.service';
import { AI_TRANSPORT } from './ai-transport';
import { CloudflareAiTransport } from './cloudflare-ai.transport';

@Global()
@Module({
  imports: [ConfigModule, PrismaModule],
  providers: [
    AiService,
    AiRequestLimiterService,
    CloudflareAiTransport,
    { provide: AI_TRANSPORT, useExisting: CloudflareAiTransport },
  ],
  exports: [AiService],
})
export class AiModule {}
