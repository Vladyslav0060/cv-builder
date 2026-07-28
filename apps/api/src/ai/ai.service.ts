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

export type AiGeneratedResumeResult = AiResumeResult & {
  personalInfo?: {
    fullName?: string;
    title?: string;
    email?: string;
    phone?: string;
    location?: string;
    website?: string;
    linkedin?: string;
    github?: string;
  };
};

function parseJsonObject(text: string): Record<string, unknown> {
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

    return parsed as Record<string, unknown>;
  } catch {
    return {};
  }
}

function parseResumeResult(text: string): AiResumeResult {
  return parseJsonObject(text);
}

function parseGeneratedResumeResult(text: string): AiGeneratedResumeResult {
  return parseJsonObject(text);
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
  "skills": ["React", "TypeScript", "Frontend Architecture", "Performance Optimization"],
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

  async generateResumeFromBrief(input: {
    introduction: string;
    background: string;
    target?: string;
    previousResumeText?: string;
  }): Promise<AiGeneratedResumeResult> {
    const systemPrompt = `You are an elite CV/resume strategist, ATS optimization specialist, and technical recruiter.
Generate a polished, highly specific resume as strict JSON.
Return ONLY a valid JSON object. Do not include markdown, code fences, comments, or explanations.

Use this exact schema:
{
  "personalInfo": {
    "fullName": "",
    "title": "",
    "email": "",
    "phone": "",
    "location": "",
    "website": "",
    "linkedin": "",
    "github": ""
  },
  "summary": "3-4 sentence professional summary tailored to the target",
  "skills": ["skill1", "skill2"],
  "languages": ["language1"],
  "experience": [
    {
      "id": "exp-1",
      "company": "",
      "position": "",
      "location": "",
      "startDate": "",
      "endDate": "",
      "isCurrent": false,
      "description": ["achievement-focused bullet"]
    }
  ],
  "education": [
    {"id": "edu-1", "school": "", "degree": "", "field": "", "startDate": "", "endDate": ""}
  ],
  "projects": [
    {"id": "proj-1", "name": "", "description": ["bullet"], "technologies": ["tech"], "link": "", "startDate": "", "endDate": ""}
  ],
  "certifications": [
    {"id": "cert-1", "name": "", "issuer": "", "date": ""}
  ]
}

Quality rules:
- Build a complete, recruiter-ready CV from the user input and uploaded old CV text.
- Data priority order is strict:
  1. User-entered introduction, background, and target role/job details.
  2. Uploaded old CV text.
  3. Conservative inference from the provided facts.
- Treat the uploaded old CV as source data for contact details, GitHub/LinkedIn/portfolio/Upwork URLs, certifications, education, work history, projects, skills, languages, and dates.
- If the manual user input and uploaded CV conflict, use the manual user input.
- Preserve real contact links from the source text in "personalInfo": GitHub URLs go in "github", LinkedIn URLs go in "linkedin", and portfolio/personal/Upwork URLs go in "website" when no better website is provided.
- Prefer concrete achievements, business impact, ownership, tools, domain context, and seniority signals.
- Do not invent employers, schools, credentials, dates, contact details, links, or exact metrics.
- You may improve phrasing and infer reasonable professional positioning from provided facts.
- If a metric is not provided, write impact without fake numbers.
- Keep bullet points concise, active, and outcome-oriented.
- Use 3-5 bullets for strong recent roles and 1-3 bullets for older or less relevant roles.
- Skills contract:
  - The "skills" array is rendered as individual CV skill chips/bullets. Every item must make sense by itself.
  - Return 10-20 professional skill labels, not words split from sentences.
  - Valid skills are technologies, tools, platforms, methods, architecture areas, business domains, or professional capabilities.
  - Good examples: "React", "Next.js", "TypeScript", "Frontend Architecture", "Performance Optimization", "API Integration", "Stripe", "Design Systems", "SaaS Dashboards", "Accessibility", "Product Engineering".
  - Bad examples: "2021-Present", "Frontend Engineer at BrightOps", "and Tailwind", "Built reusable form", "modal", "table", "Integrated Stripe Checkout", "- Built marketplace admin tools with React".
  - Never include job titles, employer names, dates, bullets, copied resume lines, sentence fragments, standalone UI nouns, or anything starting with "-", "and", "with", "built", "led", "created", "improved", or "integrated".
  - Each skill should use professional capitalization and should not end with punctuation.
- If the user provides an old CV, preserve important facts but rewrite weak bullets into stronger modern CV language.
- Use empty strings or empty arrays for truly unknown data. Never use placeholders like "N/A" or "TBD".
- Make the resume fit a polished 1-2 page PDF and remain easy to edit.`;

    const userPrompt = [
      `Introduction:\n${input.introduction}`,
      `Experience, skills, education, and achievements:\n${input.background}`,
      input.target ? `Target role or job context:\n${input.target}` : null,
      input.previousResumeText
        ? `Text extracted from uploaded old CV:\n${input.previousResumeText}`
        : null,
    ]
      .filter(Boolean)
      .join('\n\n');

    const result = await this.ask(userPrompt, {
      system: systemPrompt,
      maxOutputTokens:
        this.cfg.get<number>('ai.resumeMaxOutputTokens') ??
        this.cfg.get<number>('ai.maxOutputTokens') ??
        4200,
    });

    return parseGeneratedResumeResult(result.text);
  }
}
