import { Injectable } from '@nestjs/common';
import { AiResumeResult, AiService } from 'src/ai/ai.service';
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
import { createResumeConstructorPdfBuffer } from './document-pdf';
import { DocumentService } from './document.service';
import { toGetDocumentDto } from './mappers/get-document.mapper';
import { toGetDocumentsPreviewDto } from './mappers/get-documents.mapper';
import { toResumeExportPayload } from './mappers/resume.mapper';
import { DocumentType } from 'generated/prisma/enums';

function getDocumentTypeLabel(type: DocumentType) {
  return type === 'RESUME' ? 'resume' : 'cover letter';
}

@Injectable()
export class DocumentApplicationService {
  constructor(
    private readonly documentService: DocumentService,
    private readonly userService: UserService,
    private readonly aiService: AiService,
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

    const maxOutputTokens = process.env.MAX_OUTPUT_TOKENS
      ? Number(process.env.MAX_OUTPUT_TOKENS)
      : 600;
    const applicantSource =
      body.applicantInfo ??
      (creationMode === CreateDocumentDtoCreationMode.ACCOUNT
        ? await this.userService.findEnrichedUser(userId)
        : undefined);
    const applicantInfo = applicantSource
      ? buildApplicantInfo(applicantSource)
      : '';

    let documentContent: string | null = null;

    if (type === 'COVER_LETTER') {
      const systemPrompt =
        creationMode === CreateDocumentDtoCreationMode.ACCOUNT
          ? `You are an expert career coach. Write a professional ${getDocumentTypeLabel(
              type,
            )} using the applicant's details and tailoring it to the job description. Keep formatting clean and professional. Use ${maxOutputTokens} tokens max.`
          : `You are an expert career coach. Write a professional ${getDocumentTypeLabel(
              type,
            )} from scratch using the job brief. Keep formatting clean and professional. Use ${maxOutputTokens} tokens max.`;

      const userPrompt = [
        applicantInfo || null,
        `Job Posting:
Title: ${jobTitle}
Company: ${company}
Description: ${description}`,
      ]
        .filter(Boolean)
        .join('\n\n');
      const response = await this.aiService.ask(userPrompt, {
        system: systemPrompt,
        maxOutputTokens,
      });
      documentContent = response.text;
    }

    const [document, aiResumeData] = await Promise.all([
      this.documentService.createDocument(userId, body, documentContent),
      type === 'RESUME' && applicantSource && applicantInfo
        ? this.aiService
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
      const fullName = [applicantSource.firstName, applicantSource.lastName]
        .filter(Boolean)
        .join(' ');
      const location = [
        applicantSource.city,
        applicantSource.state,
        applicantSource.country,
      ]
        .filter(Boolean)
        .join(', ');
      const fallbackSkills = applicantSource.skills
        ? applicantSource.skills
            .split(/[,\n]+/)
            .map((s) => s.trim())
            .filter(Boolean)
        : [];

      await this.documentService.upsertResume(userId, document.id, {
        resume: {
          personalInfo: {
            fullName,
            title: aiResumeData?.title ?? jobTitle,
            email: applicantSource.email ?? '',
            ...(applicantSource.phone && { phone: applicantSource.phone }),
            ...(location && { location }),
            ...(applicantSource.portfolio && {
              website: applicantSource.portfolio,
            }),
            ...(applicantSource.linkedIn && {
              linkedin: applicantSource.linkedIn,
            }),
          },
          summary:
            aiResumeData?.summary ?? applicantSource.summary ?? undefined,
          experience: (aiResumeData?.experience ?? []).map((exp) => ({
            ...exp,
            endDate: exp.endDate ?? undefined,
          })),
          education: (aiResumeData?.education ?? []).map((edu) => ({
            ...edu,
            endDate: edu.endDate ?? undefined,
          })),
          skills: aiResumeData?.skills ?? fallbackSkills,
          languages: aiResumeData?.languages ?? [],
          projects: (aiResumeData?.projects ?? []).map((project) => ({
            ...project,
            endDate: project.endDate ?? undefined,
          })),
          certifications: aiResumeData?.certifications ?? [],
        },
      });
    }

    return toGetDocumentDto(document);
  }

  async exportResumePdf(userId: string, payload: ResumeExportPayloadDto) {
    await this.usageQuotaService.consumeQuota(userId, 'EXPORT');

    const pdfBuffer = await createResumeConstructorPdfBuffer(
      payload.resume,
      payload.template,
      payload.colorScheme,
    );
    const filename = `${payload.resume.personalInfo.fullName || 'resume'}.pdf`
      .replace(/[^\w.-]+/g, '_')
      .replace(/^_+|_+$/g, '');

    return { pdfBuffer, filename };
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
