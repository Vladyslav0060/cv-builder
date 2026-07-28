import {
  BadRequestException,
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  StreamableFile,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import {
  ApiBody,
  ApiConsumes,
  ApiOkResponse,
  ApiOperation,
  ApiParam,
} from '@nestjs/swagger';
import { FileInterceptor } from '@nestjs/platform-express';
import { CreateAiCoverLetterDto } from './dto/create-ai-cover-letter.dto';
import { CreateAiResumeDto } from './dto/create-ai-resume.dto';
import { CreateDocumentDto } from './dto/create-document.dto';
import { UpdateDocumentContentDto } from './dto/update-document-content.dto';
import { GetDocumentsPreviewDto } from './dto/get-documents-preview.dto';
import { GetDocumentDto } from './dto/get-document.dto';
import { ResumeExportPayloadDto } from './dto/resume-data.dto';
import { CurrentUser } from 'src/auth/decorators/current-user.decorator';
import { AuthenticatedGuard } from 'src/auth/guards/authenticated.guard';
import { SafeUser } from 'src/user/user.select';
import { DocumentApplicationService } from './document-application.service';

const RESUME_UPLOAD_LIMIT_BYTES = 5 * 1024 * 1024;
const RESUME_UPLOAD_MIME_TYPES = new Set([
  'application/pdf',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'text/plain',
  'text/markdown',
]);

@Controller('document')
export class DocumentController {
  constructor(private documentApplicationService: DocumentApplicationService) {}

  @Post('resume/pdf')
  @ApiBody({
    schema: {
      type: 'object',
    },
  })
  @UseGuards(AuthenticatedGuard)
  async exportResumePdf(
    @CurrentUser() currentUser: SafeUser,
    @Body() payload: ResumeExportPayloadDto,
  ) {
    const { pdfBuffer, filename } =
      await this.documentApplicationService.exportResumePdf(
        currentUser.id,
        payload,
      );

    return new StreamableFile(pdfBuffer, {
      disposition: `attachment; filename="${filename}"`,
      type: 'application/pdf',
    });
  }

  @Post('resume/ai')
  @ApiOperation({ summary: 'Create an AI-generated resume from short inputs' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      required: ['introduction', 'background'],
      properties: {
        introduction: {
          type: 'string',
          description:
            'Who the applicant is, contact details, seniority, and career direction.',
        },
        background: {
          type: 'string',
          description:
            'Experience, skills, achievements, education, and project notes.',
        },
        target: {
          type: 'string',
          description: 'Optional target role, company, or job description.',
        },
        file: {
          type: 'string',
          format: 'binary',
          description: 'Optional old CV as PDF, DOCX, TXT, or Markdown.',
        },
      },
    },
  })
  @ApiOkResponse({ type: GetDocumentDto })
  @UseGuards(AuthenticatedGuard)
  @UseInterceptors(
    FileInterceptor('file', {
      limits: { fileSize: RESUME_UPLOAD_LIMIT_BYTES },
      fileFilter: (_req, file, cb) => {
        const filename = file.originalname.toLowerCase();
        const allowed =
          RESUME_UPLOAD_MIME_TYPES.has(file.mimetype) ||
          filename.endsWith('.pdf') ||
          filename.endsWith('.docx') ||
          filename.endsWith('.txt') ||
          filename.endsWith('.md');

        if (!allowed) {
          return cb(
            new BadRequestException(
              'Upload a PDF, DOCX, TXT, or Markdown CV file.',
            ),
            false,
          );
        }

        cb(null, true);
      },
    }),
  )
  async createAiResume(
    @CurrentUser() currentUser: SafeUser,
    @Body() body: CreateAiResumeDto,
    @UploadedFile()
    file?: {
      buffer: Buffer;
      mimetype: string;
      originalname: string;
      size: number;
    },
  ) {
    return this.documentApplicationService.createAiResume(
      currentUser.id,
      body,
      file,
    );
  }

  @Post('cover-letter/ai')
  @ApiOperation({ summary: 'Create an AI-generated cover letter' })
  @ApiBody({ type: CreateAiCoverLetterDto })
  @ApiOkResponse({ type: GetDocumentDto })
  @UseGuards(AuthenticatedGuard)
  async createAiCoverLetter(
    @CurrentUser() currentUser: SafeUser,
    @Body() body: CreateAiCoverLetterDto,
  ) {
    return this.documentApplicationService.createAiCoverLetter(
      currentUser.id,
      body,
    );
  }

  @Get('resume/:documentId')
  @ApiParam({ name: 'documentId', example: '1', required: true })
  @ApiOkResponse({ type: ResumeExportPayloadDto })
  @UseGuards(AuthenticatedGuard)
  async getResumeData(
    @CurrentUser() currentUser: SafeUser,
    @Param('documentId') documentId: string,
  ) {
    return this.documentApplicationService.getResumeData(
      currentUser.id,
      documentId,
    );
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
    return this.documentApplicationService.saveResumeData(
      currentUser.id,
      documentId,
      body,
    );
  }

  @Get(':documentId')
  @ApiParam({ name: 'documentId', example: '1', required: true })
  @ApiOkResponse({ type: GetDocumentDto })
  @UseGuards(AuthenticatedGuard)
  async getUserDocument(
    @CurrentUser() currentUser: SafeUser,
    @Param('documentId') documentId: string,
  ) {
    return this.documentApplicationService.getUserDocument(
      currentUser.id,
      documentId,
    );
  }

  @Patch(':documentId/content')
  @ApiParam({ name: 'documentId', example: '1', required: true })
  @ApiBody({ type: UpdateDocumentContentDto })
  @ApiOkResponse({ type: GetDocumentDto })
  @UseGuards(AuthenticatedGuard)
  async updateDocumentContent(
    @CurrentUser() currentUser: SafeUser,
    @Param('documentId') documentId: string,
    @Body() body: UpdateDocumentContentDto,
  ) {
    return this.documentApplicationService.updateDocumentContent(
      currentUser.id,
      documentId,
      body.content,
    );
  }

  @Get('all/preview')
  @ApiOkResponse({
    type: [GetDocumentsPreviewDto],
  })
  @UseGuards(AuthenticatedGuard)
  async getUserDocumentsPreview(
    @CurrentUser() currentUser: SafeUser,
  ): Promise<GetDocumentsPreviewDto[]> {
    return this.documentApplicationService.getUserDocumentsPreview(
      currentUser.id,
    );
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
    return this.documentApplicationService.createDocument(currentUser.id, body);
  }
}
