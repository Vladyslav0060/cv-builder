import { Injectable } from '@nestjs/common';
import { AiResumeResult, AiService } from 'src/ai/ai.service';

@Injectable()
export class ResumeGenerationService {
  constructor(private readonly aiService: AiService) {}

  async generateResume(
    applicantInfo: string,
    job: { title: string; company: string; description: string },
  ): Promise<AiResumeResult> {
    return this.aiService.generateResume(applicantInfo, job);
  }
}
