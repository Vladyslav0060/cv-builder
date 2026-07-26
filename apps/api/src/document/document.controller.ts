import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  StreamableFile,
  UseGuards,
} from '@nestjs/common';
import { ApiBody, ApiOkResponse, ApiParam } from '@nestjs/swagger';
import { CreateDocumentDto } from './dto/create-document.dto';
import { UpdateDocumentContentDto } from './dto/update-document-content.dto';
import { GetDocumentsPreviewDto } from './dto/get-documents-preview.dto';
import { GetDocumentDto } from './dto/get-document.dto';
import { ResumeExportPayloadDto } from './dto/resume-data.dto';
import { CurrentUser } from 'src/auth/decorators/current-user.decorator';
import { AuthenticatedGuard } from 'src/auth/guards/authenticated.guard';
import { SafeUser } from 'src/user/user.select';
import { DocumentApplicationService } from './document-application.service';

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
