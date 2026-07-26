import { Injectable } from '@nestjs/common';
import { AiResumeResult } from 'src/ai/ai.service';
import { buildApplicantInfo } from 'src/ai/utils';
import { UsageQuotaService } from 'src/usage/usage-quota.service';
import { UserService } from 'src/user/user.service';
import {
  CreateDocumentDto,
  CreateDocumentDtoCreationMode,
} from './dto/create-document.dto';
import { GetDocumentDto } from './dto/get-document.dto';
import { GetDocumentsPreviewDto } from './dto/get-documents-preview.dto';
import { ResumeExportPayloadDto } from './dto/resume-data.dto';
import { DocumentCreationService } from './document-creation.service';
import { DocumentService } from './document.service';
import { toGetDocumentDto } from './mappers/get-document.mapper';
import { toGetDocumentsPreviewDto } from './mappers/get-documents.mapper';
import { toResumeExportPayload } from './mappers/resume.mapper';
import { ResumeGenerationService } from './resume-generation.service';
import { ResumeMappingService } from './resume-mapping.service';
import { ResumePdfExportService } from './resume-pdf-export.service';

@Injectable()
export class DocumentApplicationService {
  constructor(
    private readonly documentService: DocumentService,
    private readonly userService: UserService,
    private readonly documentCreationService: DocumentCreationService,
    private readonly resumeGenerationService: ResumeGenerationService,
    private readonly resumeMappingService: ResumeMappingService,
    private readonly resumePdfExportService: ResumePdfExportService,
    private readonly usageQuotaService: UsageQuotaService,
  ) {}

  async createDocument(
    userId: string,
    body: CreateDocumentDto,
  ): Promise<GetDocumentDto> {
    const {
      company,
      creationMode = CreateDocumentDtoCreationMode.ACCOUNT,
      description,
      jobTitle,
      type,
    } = body;

    await this.usageQuotaService.consumeQuota(userId, 'CREATE');

    const applicantSource =
      body.applicantInfo ??
      (creationMode === CreateDocumentDtoCreationMode.ACCOUNT
        ? await this.userService.findEnrichedUser(userId)
        : undefined);
    const applicantInfo = applicantSource
      ? buildApplicantInfo(applicantSource)
      : '';
    const documentContent = await this.documentCreationService.generateContent(
      body,
      applicantInfo,
    );

    const [document, aiResumeData] = await Promise.all([
      this.documentService.createDocument(userId, body, documentContent),
      type === 'RESUME' && applicantSource && applicantInfo
        ? this.resumeGenerationService
            .generateResume(applicantInfo, {
              title: jobTitle,
              company,
              description,
            })
            .catch((err) => {
              console.error(
                '[createDocument] generateResume failed:',
                err?.message ?? err,
              );
              return null as AiResumeResult | null;
            })
        : Promise.resolve(null as AiResumeResult | null),
    ]);

    if (type === 'RESUME' && applicantSource && document) {
      const resumePayload = this.resumeMappingService.fromApplicantInfo(
        applicantSource,
        jobTitle,
        aiResumeData,
      );
      await this.documentService.upsertResume(
        userId,
        document.id,
        resumePayload,
      );
    }

    return toGetDocumentDto(document);
  }

  async exportResumePdf(userId: string, payload: ResumeExportPayloadDto) {
    await this.usageQuotaService.consumeQuota(userId, 'EXPORT');
    return this.resumePdfExportService.exportPdf(payload);
  }

  async getResumeData(userId: string, documentId: string) {
    const resume = await this.documentService.getResumeByDocumentId(
      userId,
      documentId,
    );

    return resume ? toResumeExportPayload(resume) : null;
  }

  async saveResumeData(
    userId: string,
    documentId: string,
    body: ResumeExportPayloadDto,
  ) {
    const resume = await this.documentService.upsertResume(
      userId,
      documentId,
      body,
    );

    return toResumeExportPayload(resume);
  }

  async getUserDocument(userId: string, documentId: string) {
    const document = await this.documentService.getUserDocumentById(
      userId,
      documentId,
    );
    return toGetDocumentDto(document);
  }

  async updateDocumentContent(
    userId: string,
    documentId: string,
    content: string,
  ) {
    const document = await this.documentService.updateDocumentContent(
      userId,
      documentId,
      content,
    );
    return toGetDocumentDto(document);
  }

  async getUserDocumentsPreview(
    userId: string,
  ): Promise<GetDocumentsPreviewDto[]> {
    const documents =
      await this.documentService.getUserDocumentsPreview(userId);
    return documents?.map((document) => toGetDocumentsPreviewDto(document));
  }
}
