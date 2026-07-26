import { Module } from '@nestjs/common';
import { DocumentService } from './document.service';
import { DocumentController } from './document.controller';
import { DocumentApplicationService } from './document-application.service';
import { PrismaModule } from 'src/prisma/prisma.module';
import { UserModule } from 'src/user/user.module';
import { AiModule } from 'src/ai/ai.module';
import { UsageModule } from 'src/usage/usage.module';

@Module({
  imports: [PrismaModule, UserModule, AiModule, UsageModule],
  providers: [DocumentService, DocumentApplicationService],
  controllers: [DocumentController],
  exports: [DocumentService, DocumentApplicationService],
})
export class DocumentModule {}
