jest.mock('./document-pdf', () => ({
  createResumeConstructorPdfBuffer: jest.fn(),
}));

import { DocumentController } from './document.controller';
import { DocumentService } from './document.service';
import { UserService } from 'src/user/user.service';
import { AiService } from 'src/ai/ai.service';
import { UsageQuotaService } from 'src/usage/usage-quota.service';
import { createResumeConstructorPdfBuffer } from './document-pdf';
import { SafeUser } from 'src/user/user.select';
import { type ResumeExportPayload } from '../shared/resume-constructor-data';

describe('DocumentController', () => {
  let controller: DocumentController;
  let documentService: Partial<Record<keyof DocumentService, jest.Mock>>;
  let userService: Partial<Record<keyof UserService, jest.Mock>>;
  let aiService: Partial<Record<keyof AiService, jest.Mock>>;
  let usageQuotaService: { consumeQuota: jest.Mock };

  const currentUser = { id: 'user_1' } as SafeUser;

  beforeEach(() => {
    documentService = {
      createDocument: jest.fn().mockResolvedValue({ id: 'doc_1' }),
      upsertResume: jest.fn().mockResolvedValue({}),
    };
    userService = {
      findEnrichedUser: jest.fn().mockResolvedValue(undefined),
    };
    aiService = {
      ask: jest.fn().mockResolvedValue({ text: 'generated text' }),
      generateResume: jest.fn().mockResolvedValue({}),
    };
    usageQuotaService = {
      consumeQuota: jest.fn().mockResolvedValue(undefined),
    };

    controller = new DocumentController(
      documentService as unknown as DocumentService,
      userService as unknown as UserService,
      aiService as unknown as AiService,
      usageQuotaService as unknown as UsageQuotaService,
    );

    (createResumeConstructorPdfBuffer as jest.Mock).mockResolvedValue(
      Buffer.from('pdf'),
    );
  });

  describe('exportResumePdf', () => {
    const payload = {
      resume: { personalInfo: { fullName: 'Jane Doe' } },
      template: 'classic',
      colorScheme: 'blue',
    } as unknown as ResumeExportPayload;

    it('consumes the EXPORT quota before generating the PDF', async () => {
      await controller.exportResumePdf(currentUser, payload);

      expect(usageQuotaService.consumeQuota).toHaveBeenCalledWith(
        'user_1',
        'EXPORT',
      );
      expect(createResumeConstructorPdfBuffer).toHaveBeenCalled();
    });

    it('propagates the 429 from the quota check without rendering a PDF', async () => {
      usageQuotaService.consumeQuota.mockRejectedValue(
        new Error('Daily export limit reached'),
      );

      await expect(
        controller.exportResumePdf(currentUser, payload),
      ).rejects.toThrow('Daily export limit reached');
      expect(createResumeConstructorPdfBuffer).not.toHaveBeenCalled();
    });
  });

  describe('createDocument', () => {
    it('consumes the CREATE quota before calling the AI service', async () => {
      const callOrder: string[] = [];
      usageQuotaService.consumeQuota.mockImplementation(async () => {
        callOrder.push('quota');
      });
      (aiService.ask as jest.Mock).mockImplementation(async () => {
        callOrder.push('ask');
        return { text: 'cover letter' };
      });

      await controller.createDocument(currentUser, {
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
        controller.createDocument(currentUser, {
          type: 'COVER_LETTER',
          jobTitle: 'Engineer',
          company: 'Acme',
          description: 'Build things',
        } as any),
      ).rejects.toThrow('Daily create limit reached');
      expect(aiService.ask).not.toHaveBeenCalled();
      expect(documentService.createDocument).not.toHaveBeenCalled();
    });
  });
});
