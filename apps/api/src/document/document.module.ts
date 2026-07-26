import { Module } from '@nestjs/common';
import { DocumentService } from './document.service';
import { DocumentController } from './document.controller';
import { DocumentApplicationService } from './document-application.service';
import { DocumentCreationService } from './document-creation.service';
import { PrismaModule } from 'src/prisma/prisma.module';
import { UserModule } from 'src/user/user.module';
import { AiModule } from 'src/ai/ai.module';
import { UsageModule } from 'src/usage/usage.module';
import { ResumeGenerationService } from './resume-generation.service';
import { ResumeMappingService } from './resume-mapping.service';
import { ResumePdfExportService } from './resume-pdf-export.service';

@Module({
  imports: [PrismaModule, UserModule, AiModule, UsageModule],
  providers: [
    DocumentService,
    DocumentApplicationService,
    DocumentCreationService,
    ResumeGenerationService,
    ResumeMappingService,
    ResumePdfExportService,
  ],
  controllers: [DocumentController],
  exports: [
    DocumentService,
    DocumentApplicationService,
    DocumentCreationService,
    ResumeGenerationService,
    ResumeMappingService,
    ResumePdfExportService,
  ],
})
export class DocumentModule {}
