import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  StreamableFile,
  Session,
} from '@nestjs/common';
import { DocumentService } from './document.service';
import { ApiBody, ApiOkResponse, ApiParam } from '@nestjs/swagger';
import {
  CreateDocumentDto,
  CreateDocumentDtoCreationMode,
} from './dto/create-document.dto';
import { UserService } from 'src/user/user.service';
import { buildApplicantInfo } from 'src/ai/utils';
import { AiService } from 'src/ai/ai.service';
import { toGetDocumentsPreviewDto } from './mappers/get-documents.mapper';
import { GetDocumentsPreviewDto } from './dto/get-documents-preview.dto';
import { GetDocumentDto } from './dto/get-document.dto';
import { toGetDocumentDto } from './mappers/get-document.mapper';
import { DocumentType } from 'generated/prisma/enums';
import { createResumeConstructorPdfBuffer } from './document-pdf';
import { type ResumeExportPayload } from '../shared/resume-constructor-data';

function getDocumentTypeLabel(type: DocumentType) {
  return type === 'RESUME' ? 'resume' : 'cover letter';
}

@Controller('document')
export class DocumentController {
  constructor(
    private documentService: DocumentService,
    private userService: UserService,
    private aiService: AiService,
  ) {}

  @Post('resume/pdf')
  @ApiBody({
    schema: {
      type: 'object',
    },
  })
  async exportResumePdf(@Body() payload: ResumeExportPayload) {
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

  @Get(':documentId')
  @ApiParam({ name: 'documentId', example: '1', required: true })
  @ApiOkResponse({ type: GetDocumentDto })
  async getUserDocument(
    @Session() session: any,
    @Param('documentId') documentId: string,
  ) {
    try {
      const document = await this.documentService.getUserDocumentById(
        session.passport.user,
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
  async getUserDocumentsPreview(
    @Session() session: any,
  ): Promise<GetDocumentsPreviewDto[]> {
    try {
      const documents = await this.documentService.getUserDocumentsPreview(
        session.passport.user,
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
  async createDocument(
    @Session() session: any,
    @Body() body: CreateDocumentDto,
  ) {
    const {
      company,
      creationMode = CreateDocumentDtoCreationMode.ACCOUNT,
      description,
      jobTitle,
      type,
    } = body;
    const userId = session.passport.user;
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

    let documentContent = '';

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
      const response = await this.aiService.ask(userId, userPrompt, {
        system: systemPrompt,
        maxOutputTokens,
      });
      documentContent = response.text;
    }

    const document = await this.documentService.createDocument(
      session.passport.user,
      body,
      documentContent,
    );

    return toGetDocumentDto(document);
  }
}
