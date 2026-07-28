import { Inject, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { AI_TRANSPORT, AiTransport } from './ai-transport';
import { AiRequestLimiterService } from './ai-request-limiter.service';

type AskOptions = {
  system?: string;
  maxOutputTokens?: number;
  highQuality?: boolean;
};

export type AiResumeResult = {
  title?: string;
  summary?: string;
  skills?: string[];
  languages?: string[];
  experience?: Array<{
    id: string;
    company: string;
    position: string;
    location?: string;
    startDate: string;
    endDate?: string | null;
    isCurrent?: boolean;
    description: string[];
  }>;
  education?: Array<{
    id: string;
    school: string;
    degree: string;
    field?: string;
    startDate: string;
    endDate?: string | null;
  }>;
  projects?: Array<{
    id: string;
    name: string;
    description: string[];
    technologies?: string[];
    link?: string;
    startDate?: string;
    endDate?: string | null;
  }>;
  certifications?: Array<{
    id: string;
    name: string;
    issuer: string;
    date?: string;
  }>;
};

function parseResumeResult(text: string): AiResumeResult {
  const jsonMatch = text.trim().match(/\{[\s\S]*\}/);
  if (!jsonMatch) return {};

  try {
    const parsed: unknown = JSON.parse(jsonMatch[0]);
    if (
      typeof parsed !== 'object' ||
      parsed === null ||
      Array.isArray(parsed)
    ) {
      return {};
    }

    return parsed as AiResumeResult;
  } catch {
    return {};
  }
}

@Injectable()
export class AiService {
  constructor(
    private readonly cfg: ConfigService,
    private readonly limiter: AiRequestLimiterService,
    @Inject(AI_TRANSPORT) private readonly transport: AiTransport,
  ) {}

  async ask(input: string, opts: AskOptions = {}) {
    return this.limiter.runWithLimits(async () => {
      const maxOutputTokens =
        opts.maxOutputTokens ??
        this.cfg.get<number>('ai.maxOutputTokens') ??
        500;

      return this.transport.complete({
        messages: [
          { role: 'system', content: opts.system || '' },
          { role: 'user', content: input },
        ],
        maxOutputTokens,
      });
    });
  }

  async generateResume(
    applicantInfo: string,
    job: { title: string; company: string; description: string },
  ): Promise<AiResumeResult> {
    const systemPrompt = `You are an expert resume writer. Generate a tailored resume in JSON format.
Return ONLY a valid JSON object — no markdown, no code fences, no explanation.
Use this exact schema:
{
  "title": "professional title matching the job",
  "summary": "2-4 sentence professional summary tailored to the job",
  "skills": ["skill1", "skill2"],
  "languages": ["language1"],
  "experience": [
    {"id":"exp-1","company":"","position":"","location":"","startDate":"","endDate":"","isCurrent":false,"description":["bullet point"]}
  ],
  "education": [
    {"id":"edu-1","school":"","degree":"","field":"","startDate":"","endDate":""}
  ],
  "projects": [
    {"id":"proj-1","name":"","description":["bullet point"],"technologies":["tech1","tech2"],"link":"","startDate":"","endDate":""}
  ],
  "certifications": [
    {"id":"cert-1","name":"","issuer":"","date":""}
  ]
}
Parse the applicant's experience, education, projects, and certifications from their profile text and structure them into the arrays above. Tailor descriptions to highlight relevance to the job. Only include projects/certifications the applicant actually mentions — do not invent them. Use empty arrays if no data is available.`;

    const userPrompt = [
      applicantInfo || null,
      `Target Job:\nTitle: ${job.title}\nCompany: ${job.company}\nDescription: ${job.description}`,
    ]
      .filter(Boolean)
      .join('\n\n');

    const result = await this.ask(userPrompt, {
      system: systemPrompt,
      maxOutputTokens:
        this.cfg.get<number>('ai.resumeMaxOutputTokens') ??
        this.cfg.get<number>('ai.maxOutputTokens') ??
        2800,
    });

    return parseResumeResult(result.text);
  }
}
