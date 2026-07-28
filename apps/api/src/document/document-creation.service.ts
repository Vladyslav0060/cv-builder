import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { AiService } from 'src/ai/ai.service';
import {
  CreateDocumentDto,
  CreateDocumentDtoCreationMode,
} from './dto/create-document.dto';

function getDocumentTypeLabel(type: CreateDocumentDto['type']) {
  return type === 'RESUME' ? 'resume' : 'cover letter';
}

@Injectable()
export class DocumentCreationService {
  constructor(
    private readonly aiService: AiService,
    private readonly cfg: ConfigService,
  ) {}

  async generateContent(
    body: CreateDocumentDto,
    applicantInfo: string,
  ): Promise<string | null> {
    const {
      company,
      creationMode = CreateDocumentDtoCreationMode.ACCOUNT,
      description,
      jobTitle,
      type,
    } = body;

    if (type !== 'COVER_LETTER') {
      return null;
    }

    const maxOutputTokens =
      this.cfg.get<number>('ai.coverLetterMaxOutputTokens') ??
      this.cfg.get<number>('ai.maxOutputTokens') ??
      600;
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

    return response.text;
  }
}
