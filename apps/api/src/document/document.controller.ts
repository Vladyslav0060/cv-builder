import { Body, Controller, Get, Param, Post, Session } from '@nestjs/common';
import { DocumentService } from './document.service';
import { ApiBody, ApiOkResponse, ApiParam } from '@nestjs/swagger';
import { CreateDocumentDto } from './dto/create-document.dto';
import { UserService } from 'src/user/user.service';
import { buildApplicantInfo } from 'src/ai/utils';
import { AiService } from 'src/ai/ai.service';
import { toGetDocumentsPreviewDto } from './mappers/get-documents.mapper';
import { GetDocumentsPreviewDto } from './dto/get-documents-preview.dto';
import { GetDocumentDto } from './dto/get-document.dto';
import { toGetDocumentDto } from './mappers/get-document.mapper';

@Controller('document')
export class DocumentController {
  constructor(
    private documentService: DocumentService,
    private userService: UserService,
    private aiService: AiService,
  ) {}
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
  async createDocument(
    @Session() session: any,
    @Body() body: CreateDocumentDto,
  ) {
    const { company, description, jobTitle, type } = body;
    console.log({ body });
    const userId = session.passport.user;
    const user = await this.userService.findEnrichedUser(userId);
    const applicantInfo = buildApplicantInfo(user);

    const systemPrompt = `You are an expert career coach. Write a professional ${
      type
    } using the applicant's details and tailoring it to the job description. Keep formatting clean and professional.`;

    const userPrompt = `
${applicantInfo}

Job Posting:
Title: ${jobTitle}
Company: ${company}
Description: ${description}
`;
    const response = await this.aiService.ask(userPrompt, {
      system: systemPrompt,
    });
    return this.documentService.createDocument(session.passport.user, {
      ...body,
      content: response.text,
    });
  }
}
