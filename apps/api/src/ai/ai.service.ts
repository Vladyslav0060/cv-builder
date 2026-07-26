import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { DEFAULT_CLOUDFLARE_AI_MODELS } from 'src/config/ai.config';
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

@Injectable()
export class AiService {
  constructor(
    private readonly cfg: ConfigService,
    private readonly limiter: AiRequestLimiterService,
  ) {}

  private getModels(): string[] {
    const configuredModels = this.cfg.get<string[]>('ai.models');
    if (configuredModels?.length) return configuredModels;

    const legacyModel = this.cfg.get<string>('CLOUDFLARE_AI_MODEL');
    const envModels = this.cfg.get<string>('CLOUDFLARE_AI_MODELS');

    return [
      ...new Set(
        [
          legacyModel,
          ...(envModels?.split(',') ?? []),
          ...DEFAULT_CLOUDFLARE_AI_MODELS,
        ]
          .map((model) => model?.trim())
          .filter((model): model is string => Boolean(model)),
      ),
    ];
  }

  async ask(input: string, opts: AskOptions = {}) {
    return this.limiter.runWithLimits(async () => {
      const accountId =
        this.cfg.get<string>('ai.cloudflareAccountId') ??
        this.cfg.get<string>('CLOUDFLARE_ACCOUNT_ID');
      const apiToken =
        this.cfg.get<string>('ai.cloudflareApiToken') ??
        this.cfg.get<string>('CLOUDFLARE_API_TOKEN');

      if (!accountId || !apiToken) {
        throw new Error(
          'Cloudflare Workers AI credentials are missing (CLOUDFLARE_ACCOUNT_ID / CLOUDFLARE_API_TOKEN)',
        );
      }

      const models = this.getModels();
      const maxOutputTokens = opts.maxOutputTokens ?? 500; // hard cap: biggest saver

      let lastError = '';

      for (const model of models) {
        const resp = await fetch(
          `https://api.cloudflare.com/client/v4/accounts/${accountId}/ai/run/${model}`,
          {
            method: 'POST',
            headers: {
              Authorization: `Bearer ${apiToken}`,
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              messages: [
                { role: 'system', content: opts.system || '' },
                { role: 'user', content: input },
              ],
              max_tokens: maxOutputTokens,
            }),
          },
        );

        if (!resp.ok) {
          const text = await resp.text().catch(() => '');
          lastError = `${resp.status} ${resp.statusText} ${
            text ? `- ${text}` : ''
          }`;

          if (resp.status === 404) continue;

          throw new Error(`Cloudflare AI request failed: ${lastError}`);
        }

        const data: any = await resp.json();
        const output = data?.result?.response ?? '';

        return {
          text: output,
          requestId: data?.result?.id ?? data?.result_id ?? undefined,
          model,
        };
      }

      throw new Error(
        `Cloudflare AI request failed for all configured models (${models.join(
          ', ',
        )}): ${lastError}`,
      );
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
      maxOutputTokens: 2800,
    });

    const jsonMatch = result.text.trim().match(/\{[\s\S]*\}/);
    if (!jsonMatch) return {};

    try {
      return JSON.parse(jsonMatch[0]) as AiResumeResult;
    } catch {
      return {};
    }
  }
}
