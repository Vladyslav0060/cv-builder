import { Injectable } from '@nestjs/common';
import { ResumeExportPayloadDto } from './dto/resume-data.dto';
import { createResumeConstructorPdfBuffer } from './document-pdf';

@Injectable()
export class ResumePdfExportService {
  async exportPdf(payload: ResumeExportPayloadDto) {
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
}
