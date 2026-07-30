import { DocumentService } from './document.service';
import { UserService } from 'src/user/user.service';
import { UsageQuotaService } from 'src/usage/usage-quota.service';
import { type ResumeExportPayload } from '../shared/resume-constructor-data';
import { DocumentApplicationService } from './document-application.service';
import { DocumentCreationService } from './document-creation.service';
import { ResumeAiCreationService } from './resume-ai-creation.service';
import { ResumeGenerationService } from './resume-generation.service';
import { ResumeMappingService } from './resume-mapping.service';
import { ResumePdfExportService } from './resume-pdf-export.service';
import { ResumeUploadTextService } from './resume-upload-text.service';

describe('DocumentApplicationService', () => {
  let service: DocumentApplicationService;
  let documentService: Partial<Record<keyof DocumentService, jest.Mock>>;
  let userService: Partial<Record<keyof UserService, jest.Mock>>;
  let documentCreationService: Partial<
    Record<keyof DocumentCreationService, jest.Mock>
  >;
  let resumeAiCreationService: Partial<
    Record<keyof ResumeAiCreationService, jest.Mock>
  >;
  let resumeGenerationService: Partial<
    Record<keyof ResumeGenerationService, jest.Mock>
  >;
  let resumeMappingService: Partial<
    Record<keyof ResumeMappingService, jest.Mock>
  >;
  let resumePdfExportService: Partial<
    Record<keyof ResumePdfExportService, jest.Mock>
  >;
  let resumeUploadTextService: Partial<
    Record<keyof ResumeUploadTextService, jest.Mock>
  >;
  let usageQuotaService: { consumeQuota: jest.Mock };

  beforeEach(() => {
    jest.clearAllMocks();

    documentService = {
      createDocument: jest.fn().mockResolvedValue({ id: 'doc_1' }),
      upsertResume: jest.fn().mockResolvedValue({}),
    };
    userService = {
      findEnrichedUser: jest.fn().mockResolvedValue(undefined),
    };
    documentCreationService = {
      generateContent: jest.fn().mockResolvedValue('generated text'),
    };
    resumeAiCreationService = {
      generateResume: jest.fn().mockResolvedValue({}),
    };
    resumeGenerationService = {
      generateResume: jest.fn().mockResolvedValue({}),
    };
    resumeMappingService = {
      fromApplicantInfo: jest.fn().mockReturnValue({ resume: {} }),
    };
    resumePdfExportService = {
      exportPdf: jest.fn().mockResolvedValue({
        pdfBuffer: Buffer.from('pdf'),
        filename: 'Jane_Doe.pdf',
      }),
    };
    resumeUploadTextService = {
      extractText: jest.fn().mockResolvedValue(undefined),
    };
    usageQuotaService = {
      consumeQuota: jest.fn().mockResolvedValue(undefined),
    };

    service = new DocumentApplicationService(
      documentService as unknown as DocumentService,
      userService as unknown as UserService,
      documentCreationService as unknown as DocumentCreationService,
      resumeAiCreationService as unknown as ResumeAiCreationService,
      resumeGenerationService as unknown as ResumeGenerationService,
      resumeMappingService as unknown as ResumeMappingService,
      resumePdfExportService as unknown as ResumePdfExportService,
      resumeUploadTextService as unknown as ResumeUploadTextService,
      usageQuotaService as unknown as UsageQuotaService,
    );
  });

  describe('exportResumePdf', () => {
    const payload = {
      resume: { personalInfo: { fullName: 'Jane Doe' } },
      template: 'classic',
      colorScheme: 'blue',
    } as unknown as ResumeExportPayload;

    it('consumes the EXPORT quota before generating the PDF', async () => {
      await service.exportResumePdf('user_1', payload);

      expect(usageQuotaService.consumeQuota).toHaveBeenCalledWith(
        'user_1',
        'EXPORT',
      );
      expect(resumePdfExportService.exportPdf).toHaveBeenCalledWith(payload);
    });

    it('propagates the 429 from the quota check without rendering a PDF', async () => {
      usageQuotaService.consumeQuota.mockRejectedValue(
        new Error('Daily export limit reached'),
      );

      await expect(service.exportResumePdf('user_1', payload)).rejects.toThrow(
        'Daily export limit reached',
      );
      expect(resumePdfExportService.exportPdf).not.toHaveBeenCalled();
    });
  });

  describe('createDocument', () => {
    it('consumes the CREATE quota before calling the AI service', async () => {
      const callOrder: string[] = [];
      usageQuotaService.consumeQuota.mockImplementation(async () => {
        callOrder.push('quota');
      });
      documentCreationService.generateContent?.mockImplementation(async () => {
        callOrder.push('ask');
        return 'cover letter';
      });

      await service.createDocument('user_1', {
        type: 'COVER_LETTER',
        jobTitle: 'Engineer',
        company: 'Acme',
        description: 'Build things',
      } as any);

      expect(usageQuotaService.consumeQuota).toHaveBeenCalledWith(
        'user_1',
        'CREATE',
      );
      expect(callOrder).toEqual(['quota', 'ask']);
    });

    it('propagates the 429 from the quota check without calling the AI service', async () => {
      usageQuotaService.consumeQuota.mockRejectedValue(
        new Error('Daily create limit reached'),
      );

      await expect(
        service.createDocument('user_1', {
          type: 'COVER_LETTER',
          jobTitle: 'Engineer',
          company: 'Acme',
          description: 'Build things',
        } as any),
      ).rejects.toThrow('Daily create limit reached');
      expect(documentCreationService.generateContent).not.toHaveBeenCalled();
      expect(documentService.createDocument).not.toHaveBeenCalled();
    });

    it('propagates document persistence errors', async () => {
      documentService.createDocument?.mockRejectedValue(
        new Error('create failed'),
      );

      await expect(
        service.createDocument('user_1', {
          type: 'COVER_LETTER',
          jobTitle: 'Engineer',
          company: 'Acme',
          description: 'Build things',
        } as any),
      ).rejects.toThrow('create failed');
    });
  });
});
