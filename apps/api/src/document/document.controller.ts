import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  StreamableFile,
  UseGuards,
} from '@nestjs/common';
import { DocumentService } from './document.service';
import { ApiBody, ApiOkResponse, ApiParam } from '@nestjs/swagger';
import {
  CreateDocumentDto,
  CreateDocumentDtoCreationMode,
} from './dto/create-document.dto';
import { UserService } from 'src/user/user.service';
import { buildApplicantInfo } from 'src/ai/utils';
import { AiService, AiResumeResult } from 'src/ai/ai.service';
import { toGetDocumentsPreviewDto } from './mappers/get-documents.mapper';
import { GetDocumentsPreviewDto } from './dto/get-documents-preview.dto';
import { GetDocumentDto } from './dto/get-document.dto';
import { toGetDocumentDto } from './mappers/get-document.mapper';
import { toResumeExportPayload } from './mappers/resume.mapper';
import { ResumeExportPayloadDto } from './dto/resume-data.dto';
import { DocumentType } from 'generated/prisma/enums';
import { createResumeConstructorPdfBuffer } from './document-pdf';
import { type ResumeExportPayload } from '../shared/resume-constructor-data';
import { CurrentUser } from 'src/auth/decorators/current-user.decorator';
import { AuthenticatedGuard } from 'src/auth/guards/authenticated.guard';
import { SafeUser } from 'src/user/user.select';
import { UsageQuotaService } from 'src/usage/usage-quota.service';

function getDocumentTypeLabel(type: DocumentType) {
  return type === 'RESUME' ? 'resume' : 'cover letter';
}

@Controller('document')
export class DocumentController {
  constructor(
    private documentService: DocumentService,
    private userService: UserService,
    private aiService: AiService,
    private usageQuotaService: UsageQuotaService,
  ) {}

  @Post('resume/pdf')
  @ApiBody({
    schema: {
      type: 'object',
    },
  })
  @UseGuards(AuthenticatedGuard)
  async exportResumePdf(
    @CurrentUser() currentUser: SafeUser,
    @Body() payload: ResumeExportPayload,
  ) {
    await this.usageQuotaService.consumeQuota(currentUser.id, 'EXPORT');

    const pdfBuffer = await createResumeConstructorPdfBuffer(
      payload.resume,
      payload.template,
      payload.colorScheme,
    );
    const filename = `${payload.resume.personalInfo.fullName || 'resume'}.pdf`
      .replace(/[^\w.-]+/g, '_')
      .replace(/^_+|_+$/g, '');

    return new StreamableFile(pdfBuffer, {
      disposition: `attachment; filename="${filename}"`,
      type: 'application/pdf',
    });
  }

  @Get('resume/:documentId')
  @ApiParam({ name: 'documentId', example: '1', required: true })
  @ApiOkResponse({ type: ResumeExportPayloadDto })
  @UseGuards(AuthenticatedGuard)
  async getResumeData(
    @CurrentUser() currentUser: SafeUser,
    @Param('documentId') documentId: string,
  ) {
    const resume = await this.documentService.getResumeByDocumentId(
      currentUser.id,
      documentId,
    );

    return resume ? toResumeExportPayload(resume) : null;
  }

  @Post('resume/:documentId')
  @ApiParam({ name: 'documentId', example: '1', required: true })
  @ApiBody({ type: ResumeExportPayloadDto })
  @ApiOkResponse({ type: ResumeExportPayloadDto })
  @UseGuards(AuthenticatedGuard)
  async saveResumeData(
    @CurrentUser() currentUser: SafeUser,
    @Param('documentId') documentId: string,
    @Body() body: ResumeExportPayloadDto,
  ) {
    const resume = await this.documentService.upsertResume(
      currentUser.id,
      documentId,
      body,
    );

    return toResumeExportPayload(resume);
  }

  @Get(':documentId')
  @ApiParam({ name: 'documentId', example: '1', required: true })
  @ApiOkResponse({ type: GetDocumentDto })
  @UseGuards(AuthenticatedGuard)
  async getUserDocument(
    @CurrentUser() currentUser: SafeUser,
    @Param('documentId') documentId: string,
  ) {
    try {
      const document = await this.documentService.getUserDocumentById(
        currentUser.id,
        documentId,
      );
      return toGetDocumentDto(document);
    } catch (error) {
      throw error;
    }
  }

  @Get('all/preview')
  @ApiOkResponse({
    type: [GetDocumentsPreviewDto],
  })
  @UseGuards(AuthenticatedGuard)
  async getUserDocumentsPreview(
    @CurrentUser() currentUser: SafeUser,
  ): Promise<GetDocumentsPreviewDto[]> {
    try {
      const documents = await this.documentService.getUserDocumentsPreview(
        currentUser.id,
      );
      return documents?.map((document) => toGetDocumentsPreviewDto(document));
    } catch (error) {
      throw error;
    }
  }

  @Post('/generate')
  @ApiBody({
    type: CreateDocumentDto,
  })
  @ApiOkResponse({ type: GetDocumentDto })
  @UseGuards(AuthenticatedGuard)
  async createDocument(
    @CurrentUser() currentUser: SafeUser,
    @Body() body: CreateDocumentDto,
  ) {
    const {
      company,
      creationMode = CreateDocumentDtoCreationMode.ACCOUNT,
      description,
      jobTitle,
      type,
    } = body;
    const userId = currentUser.id;
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
}
