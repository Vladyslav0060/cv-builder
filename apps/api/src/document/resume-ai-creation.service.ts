import { Injectable } from '@nestjs/common';
import { AiResumeEditorDraft, AiService } from 'src/ai/ai.service';
import {
  ResumeCertification,
  ResumeColorSchemeId,
  ResumeData,
  ResumeEducation,
  ResumeExperience,
  ResumeExportPayload,
  ResumeProject,
  ResumeTemplateId,
} from '../shared/resume-constructor-data';
import { CreateAiResumeDto } from './dto/create-ai-resume.dto';

function cleanText(value: unknown, fallback = '') {
  return typeof value === 'string' && value.trim().length
    ? value.trim()
    : fallback;
}

function cleanTextOrUndefined(value: unknown) {
  const text = cleanText(value);
  return text || undefined;
}

function cleanStringList(value: unknown, limit: number) {
  if (!Array.isArray(value)) return [];

  return value
    .map((item) => cleanText(item))
    .filter(Boolean)
    .slice(0, limit);
}

const RESUME_TEMPLATES = new Set<ResumeTemplateId>([
  'classic',
  'modern',
  'minimal',
]);
const RESUME_COLOR_SCHEMES = new Set<ResumeColorSchemeId>([
  'slate',
  'forest',
  'wine',
  'amber',
  'orchid',
  'graphite',
  'teal',
  'rose',
]);

type ContactHints = {
  fullName?: string;
  email?: string;
  phone?: string;
  location?: string;
  website?: string;
  linkedin?: string;
  github?: string;
  upwork?: string;
};

function normalizeTemplate(value: unknown): ResumeTemplateId {
  const template = cleanText(value);
  return RESUME_TEMPLATES.has(template as ResumeTemplateId)
    ? (template as ResumeTemplateId)
    : 'modern';
}

function normalizeColorScheme(value: unknown): ResumeColorSchemeId {
  const colorScheme = cleanText(value);
  return RESUME_COLOR_SCHEMES.has(colorScheme as ResumeColorSchemeId)
    ? (colorScheme as ResumeColorSchemeId)
    : 'teal';
}

type LegacyAiPersonalInfo = {
  personalInfo?: Partial<ContactHints> & {
    title?: string;
  };
  title?: string;
  summary?: string;
};

const URL_PATTERN =
  /\b(?:https?:\/\/|www\.)?[a-z0-9.-]+\.(?:com|dev|io|me|net|org|app|co)(?:\/[^\s,;()<>{}[\]"']*)?/gi;

function cleanUrl(value: string) {
  return value.replace(/[.,;:)]+$/g, '').trim();
}

function extractUrls(text: string) {
  const urls: string[] = [];

  for (const match of text.matchAll(URL_PATTERN)) {
    const url = cleanUrl(match[0]);
    const index = match.index ?? 0;

    if (!url || text[index - 1] === '@') continue;
    urls.push(url);
  }

  return [...new Set(urls)];
}

function extractFullName(text: string) {
  const explicitNameMatch = text.match(
    /\b(?:i am|i'm|my name is)\s+([a-z][a-z'-]+(?:\s+[a-z][a-z'-]+){0,3})/i,
  );

  if (explicitNameMatch?.[1]) return cleanText(explicitNameMatch[1]);

  return text
    .split(/\n+/)
    .map((line) => cleanText(line))
    .find(
      (line) =>
        /^[A-Z][a-zA-Z'-]+(?:\s+[A-Z][a-zA-Z'-]+){1,3}$/.test(line) &&
        !/(resume|curriculum|profile|summary|experience|education|engineer|developer|designer|manager|specialist|consultant|architect)/i.test(
          line,
        ),
    );
}

function extractContactHints(text: string): ContactHints {
  const normalized = cleanText(text);
  if (!normalized) return {};

  const urls = extractUrls(normalized);
  const email = cleanTextOrUndefined(
    normalized.match(/[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/i)?.[0],
  );
  const phone = cleanTextOrUndefined(
    normalized.match(/(?:\+?\d[\d\s().-]{7,}\d)/)?.[0]?.replace(/\s+/g, ' '),
  );
  const locationCandidate = cleanTextOrUndefined(
    normalized.match(/\b(?:location|address)\s*:?\s*([^\n]+)/i)?.[1],
  );
  const location =
    locationCandidate && locationCandidate.length <= 80
      ? locationCandidate
      : undefined;
  const github = urls.find((url) => /github\.com/i.test(url));
  const linkedin = urls.find((url) => /linkedin\.com/i.test(url));
  const upwork = urls.find((url) => /upwork\.com/i.test(url));
  const website = urls.find(
    (url) => !/(github|linkedin|upwork)\.com/i.test(url),
  );

  return {
    fullName: extractFullName(normalized),
    email,
    phone,
    location,
    website,
    linkedin,
    github,
    upwork,
  };
}

const KNOWN_SKILLS = [
  'Accessibility',
  'AI-assisted applications',
  'Angular',
  'Apollo Client',
  'API integration',
  'AWS',
  'AWS S3',
  'Billing integrations',
  'Chakra UI',
  'CI/CD',
  'Cloudflare',
  'Cloudflare Workers',
  'Component architecture',
  'CSS',
  'Design systems',
  'Docker',
  'Express.js',
  'Figma',
  'Firebase',
  'Frontend architecture',
  'Git',
  'GitHub Actions',
  'GraphQL',
  'HTML',
  'Jest',
  'JavaScript',
  'Laravel',
  'Material UI',
  'MongoDB',
  'MySQL',
  'Next.js',
  'Node.js',
  'Nuxt.js',
  'Performance optimization',
  'PHP',
  'Playwright',
  'PostgreSQL',
  'Prisma',
  'Product engineering',
  'Python',
  'React',
  'React Native',
  'Redux',
  'REST APIs',
  'Sass',
  'SaaS dashboards',
  'Shopify',
  'Storybook',
  'Stripe',
  'Supabase',
  'Svelte',
  'Tailwind CSS',
  'TanStack Query',
  'TypeScript',
  'UI engineering',
  'Vue.js',
  'Webpack',
  'WordPress',
  'Zustand',
] as const;

const SKILL_ALIASES: Record<string, (typeof KNOWN_SKILLS)[number]> = {
  'api request cleanup': 'Performance optimization',
  billing: 'Billing integrations',
  caching: 'Performance optimization',
  checkout: 'Stripe',
  'continuous integration': 'CI/CD',
  dashboards: 'SaaS dashboards',
  frontend: 'Frontend architecture',
  'frontend engineering': 'UI engineering',
  'github workflows': 'GitHub Actions',
  'material-ui': 'Material UI',
  mui: 'Material UI',
  nest: 'Node.js',
  nestjs: 'Node.js',
  'next js': 'Next.js',
  node: 'Node.js',
  postgresql: 'PostgreSQL',
  payments: 'Stripe',
  performance: 'Performance optimization',
  'react js': 'React',
  'rest api': 'REST APIs',
  tests: 'Jest',
  testing: 'Jest',
  'vue js': 'Vue.js',
};

const NON_SKILL_TERMS = new Set([
  'button',
  'buttons',
  'card',
  'cards',
  'chart',
  'charts',
  'field',
  'fields',
  'form',
  'forms',
  'modal',
  'modals',
  'table',
  'tables',
]);

function sanitizeSkill(value: unknown): string | null {
  const original = cleanText(value);

  if (/^\d{4}(?:\s*[-/]\s*(?:\d{4}|present))?$/i.test(original)) {
    return null;
  }

  const raw = original
    .replace(/^[-*\d.)\s]+/, '')
    .replace(/\s+/g, ' ')
    .replace(/[.;:]+$/g, '')
    .trim();

  if (!raw) return null;
  if (raw.length < 2 || raw.length > 48) return null;
  if (/^(present|current)$/i.test(raw)) return null;
  if (
    /^(and|or|with|using|built|led|created|improved|integrated)\b/i.test(raw)
  ) {
    return null;
  }
  if (
    /^(frontend|backend|full-stack)?\s*(engineer|developer)\s+at\b/i.test(raw)
  ) {
    return null;
  }
  if (/[.!?]$/.test(raw) || raw.split(/\s+/).length > 5) return null;

  const lower = raw.toLowerCase();
  if (NON_SKILL_TERMS.has(lower)) return null;

  const alias = SKILL_ALIASES[lower];
  if (alias) return alias;

  const knownSkill = KNOWN_SKILLS.find(
    (skill) => skill.toLowerCase() === lower,
  );
  if (knownSkill) return knownSkill;

  return null;
}

function escapeRegExp(value: string) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function sourceHasLabel(sourceText: string, label: string) {
  return new RegExp(
    `(^|[^a-z0-9])${escapeRegExp(label.toLowerCase())}([^a-z0-9]|$)`,
    'i',
  ).test(sourceText);
}

function normalizeSkills(value: unknown, sourceText: string, limit = 24) {
  const fromAi: unknown[] = Array.isArray(value) ? value : [];
  const lowerSource = sourceText.toLowerCase();
  const knownMatches = KNOWN_SKILLS.filter((skill) =>
    sourceHasLabel(lowerSource, skill),
  );
  const aliasMatches = Object.entries(SKILL_ALIASES)
    .filter(([alias]) => sourceHasLabel(lowerSource, alias))
    .map(([, skill]) => skill);

  const skills = [...fromAi, ...knownMatches, ...aliasMatches]
    .map(sanitizeSkill)
    .filter((skill): skill is string => Boolean(skill));

  return [...new Set(skills)].slice(0, limit);
}

function normalizeExperience(
  value: Partial<AiResumeEditorDraft>['experience'],
): ResumeExperience[] {
  if (!Array.isArray(value)) return [];

  return value
    .map((item, index) => {
      const company = cleanText(item.company);
      const position = cleanText(item.position);
      const description = cleanStringList(item.description, 5);

      if (!company && !position && !description.length) return null;

      return {
        id: cleanText(item.id, `exp-${index + 1}`),
        company,
        position,
        ...(cleanTextOrUndefined(item.location) && {
          location: cleanText(item.location),
        }),
        startDate: cleanText(item.startDate),
        ...(cleanTextOrUndefined(item.endDate) && {
          endDate: cleanText(item.endDate),
        }),
        ...(typeof item.isCurrent === 'boolean' && {
          isCurrent: item.isCurrent,
        }),
        description,
      };
    })
    .filter((item): item is ResumeExperience => Boolean(item))
    .slice(0, 6);
}

function normalizeEducation(
  value: Partial<AiResumeEditorDraft>['education'],
): ResumeEducation[] {
  if (!Array.isArray(value)) return [];

  return value
    .map((item, index) => {
      const school = cleanText(item.school);
      const degree = cleanText(item.degree);
      const field = cleanTextOrUndefined(item.field);

      if (!school && !degree && !field) return null;

      return {
        id: cleanText(item.id, `edu-${index + 1}`),
        school,
        degree,
        ...(field && { field }),
        startDate: cleanText(item.startDate),
        ...(cleanTextOrUndefined(item.endDate) && {
          endDate: cleanText(item.endDate),
        }),
      };
    })
    .filter((item): item is ResumeEducation => Boolean(item))
    .slice(0, 4);
}

function normalizeProjects(
  value: Partial<AiResumeEditorDraft>['projects'],
): ResumeProject[] {
  if (!Array.isArray(value)) return [];

  return value
    .map((item, index): ResumeProject | null => {
      const name = cleanText(item.name);
      const description = cleanStringList(item.description, 4);
      const technologies = cleanStringList(item.technologies, 10);

      if (!name && !description.length) return null;

      return {
        id: cleanText(item.id, `proj-${index + 1}`),
        name,
        description,
        ...(technologies.length && { technologies }),
        ...(cleanTextOrUndefined(item.link) && { link: cleanText(item.link) }),
        ...(cleanTextOrUndefined(item.startDate) && {
          startDate: cleanText(item.startDate),
        }),
        ...(cleanTextOrUndefined(item.endDate) && {
          endDate: cleanText(item.endDate),
        }),
      };
    })
    .filter((item): item is ResumeProject => Boolean(item))
    .slice(0, 5);
}

function extractCertificationHints(
  previousResumeText: string,
  limit = 5,
): ResumeCertification[] {
  if (!previousResumeText.trim()) return [];

  const lines = previousResumeText
    .split(/\n+/)
    .map((line) =>
      line
        .replace(/^[-*\u2022\d.)\s]+/, '')
        .replace(/\s+/g, ' ')
        .trim(),
    )
    .filter((line) => line.length >= 4 && line.length <= 140);
  const sectionIndex = lines.findIndex((line) =>
    /^(certifications?|certificates?|licenses?)$/i.test(line),
  );
  const nextSectionPattern =
    /^(summary|profile|experience|employment|education|skills|projects|languages|contact)$/i;
  const candidateLines =
    sectionIndex >= 0
      ? lines
          .slice(sectionIndex + 1)
          .filter((line) => !nextSectionPattern.test(line))
          .slice(0, 10)
      : lines.filter((line) =>
          /\b(certified|certificate|certification|aws|google cloud|microsoft|scrum|pmp|cissp|coursera|udemy|oracle|cisco)\b/i.test(
            line,
          ),
        );

  return candidateLines
    .map((line, index): ResumeCertification | null => {
      if (
        !/\b(certified|certificate|certification|aws|google cloud|microsoft|scrum|pmp|cissp|coursera|udemy|oracle|cisco)\b/i.test(
          line,
        )
      ) {
        return null;
      }

      const date = line.match(/\b(?:19|20)\d{2}\b/)?.[0];
      const withoutDate = date
        ? line.replace(new RegExp(`\\b${date}\\b`), '').trim()
        : line;
      const parts = withoutDate
        .split(/\s[-\u2013\u2014|]\s/)
        .map((part) => part.replace(/[,;]+$/g, '').trim())
        .filter(Boolean);
      const name = parts[0] ?? '';
      const issuer = parts[1] ?? '';

      if (!name) return null;

      return {
        id: `cert-upload-${index + 1}`,
        name,
        issuer,
        ...(date && { date }),
      };
    })
    .filter((item): item is ResumeCertification => Boolean(item))
    .slice(0, limit);
}

function normalizeCertifications(
  value: Partial<AiResumeEditorDraft>['certifications'],
  previousResumeText = '',
): ResumeCertification[] {
  const source = Array.isArray(value) ? value : [];
  const fromAi = source
    .map((item, index) => {
      const name = cleanText(item.name);
      const issuer = cleanText(item.issuer);

      if (!name && !issuer) return null;

      return {
        id: cleanText(item.id, `cert-${index + 1}`),
        name,
        issuer,
        ...(cleanTextOrUndefined(item.date) && { date: cleanText(item.date) }),
      };
    })
    .filter((item): item is ResumeCertification => Boolean(item));
  const fromUpload = extractCertificationHints(previousResumeText);
  const merged = [...fromAi, ...fromUpload];
  const seen = new Set<string>();

  return merged
    .filter((item) => {
      const key = `${item.name}|${item.issuer}`.toLowerCase();
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    })
    .slice(0, 5);
}

function buildFallbackTitle(target?: string) {
  const firstLine = target
    ?.split('\n')
    .map((line) => line.trim())
    .find(Boolean);

  return firstLine?.slice(0, 80) || 'Professional Resume';
}

function buildFallbackFullName(introduction: string) {
  const explicitNameMatch = introduction.match(
    /\b(?:i am|i'm|my name is)\s+([a-z][a-z'-]+(?:\s+[a-z][a-z'-]+){0,3})/i,
  );

  return cleanText(explicitNameMatch?.[1], 'Your Name');
}

function buildFallbackSummary(body: CreateAiResumeDto) {
  const introduction = cleanText(body.introduction);
  const target = cleanText(body.target);
  const background = cleanText(body.background);

  return [introduction, target || background]
    .filter(Boolean)
    .join(' ')
    .slice(0, 700);
}

function buildFallbackSkills(body: CreateAiResumeDto, previousResumeText = '') {
  return normalizeSkills(
    [],
    [body.introduction, body.background, body.target, previousResumeText]
      .filter(Boolean)
      .join('\n'),
    18,
  );
}

function buildFallbackExperience(body: CreateAiResumeDto): ResumeExperience[] {
  const description = body.background
    .split(/\n+/)
    .map((line) => line.trim().replace(/^[-*]\s*/, ''))
    .filter(Boolean)
    .slice(0, 5);

  if (!description.length) return [];

  return [
    {
      id: 'exp-1',
      company: '',
      position: buildFallbackTitle(body.target),
      startDate: '',
      description,
    },
  ];
}

function toResumePayload(
  result: Partial<AiResumeEditorDraft>,
  body: CreateAiResumeDto,
  previousResumeText: string,
): ResumeExportPayload {
  const legacy = result as Partial<AiResumeEditorDraft> & LegacyAiPersonalInfo;
  const profile =
    result.profile ??
    ({} as Partial<NonNullable<AiResumeEditorDraft['profile']>>);
  const contact =
    result.contact ??
    ({} as Partial<NonNullable<AiResumeEditorDraft['contact']>>);
  const legacyPersonalInfo = legacy.personalInfo ?? {};
  const manualText = [body.introduction, body.background, body.target]
    .filter(Boolean)
    .join('\n');
  const manualContactHints = {
    ...extractContactHints(manualText),
    fullName: extractContactHints(body.introduction).fullName,
  };
  const uploadContactHints = extractContactHints(previousResumeText);
  const title =
    cleanText(profile.title) ||
    cleanText(legacyPersonalInfo.title) ||
    cleanText(legacy.title) ||
    buildFallbackTitle(body.target);
  const sourceText = [
    body.introduction,
    body.background,
    body.target,
    previousResumeText,
    profile.summary,
    legacy.summary,
  ]
    .filter(Boolean)
    .join('\n');
  const experience = normalizeExperience(result.experience);
  const skills = normalizeSkills(result.skills, sourceText, 30);
  const resume: ResumeData = {
    personalInfo: {
      fullName:
        manualContactHints.fullName ||
        cleanText(profile.fullName) ||
        cleanText(legacyPersonalInfo.fullName) ||
        uploadContactHints.fullName ||
        buildFallbackFullName(body.introduction),
      title,
      email:
        manualContactHints.email ||
        cleanText(contact.email) ||
        cleanText(legacyPersonalInfo.email) ||
        uploadContactHints.email ||
        '',
      ...((manualContactHints.phone ||
        cleanTextOrUndefined(contact.phone) ||
        cleanTextOrUndefined(legacyPersonalInfo.phone) ||
        uploadContactHints.phone) && {
        phone:
          manualContactHints.phone ||
          cleanText(contact.phone) ||
          cleanText(legacyPersonalInfo.phone) ||
          uploadContactHints.phone,
      }),
      ...((manualContactHints.location ||
        cleanTextOrUndefined(contact.location) ||
        cleanTextOrUndefined(legacyPersonalInfo.location) ||
        uploadContactHints.location) && {
        location:
          manualContactHints.location ||
          cleanText(contact.location) ||
          cleanText(legacyPersonalInfo.location) ||
          uploadContactHints.location,
      }),
      ...((manualContactHints.website ||
        cleanTextOrUndefined(contact.website) ||
        cleanTextOrUndefined(legacyPersonalInfo.website) ||
        uploadContactHints.website) && {
        website:
          manualContactHints.website ||
          cleanText(contact.website) ||
          cleanText(legacyPersonalInfo.website) ||
          uploadContactHints.website,
      }),
      ...((manualContactHints.linkedin ||
        cleanTextOrUndefined(contact.linkedin) ||
        cleanTextOrUndefined(legacyPersonalInfo.linkedin) ||
        uploadContactHints.linkedin) && {
        linkedin:
          manualContactHints.linkedin ||
          cleanText(contact.linkedin) ||
          cleanText(legacyPersonalInfo.linkedin) ||
          uploadContactHints.linkedin,
      }),
      ...((manualContactHints.github ||
        cleanTextOrUndefined(contact.github) ||
        cleanTextOrUndefined(legacyPersonalInfo.github) ||
        uploadContactHints.github) && {
        github:
          manualContactHints.github ||
          cleanText(contact.github) ||
          cleanText(legacyPersonalInfo.github) ||
          uploadContactHints.github,
      }),
      ...((manualContactHints.upwork ||
        cleanTextOrUndefined(contact.upwork) ||
        uploadContactHints.upwork) && {
        upwork:
          manualContactHints.upwork ||
          cleanText(contact.upwork) ||
          uploadContactHints.upwork,
      }),
    },
    summary:
      cleanTextOrUndefined(profile.summary) ??
      cleanTextOrUndefined(legacy.summary) ??
      buildFallbackSummary(body),
    experience:
      experience.length > 0 ? experience : buildFallbackExperience(body),
    education: normalizeEducation(result.education),
    skills:
      skills.length > 0
        ? skills
        : buildFallbackSkills(body, previousResumeText),
    languages: cleanStringList(result.languages, 8),
    projects: normalizeProjects(result.projects),
    certifications: normalizeCertifications(
      result.certifications,
      previousResumeText,
    ),
  };

  return {
    resume,
    template: normalizeTemplate(result.presentation?.template),
    colorScheme: normalizeColorScheme(result.presentation?.colorScheme),
  };
}

@Injectable()
export class ResumeAiCreationService {
  constructor(private readonly aiService: AiService) {}

  async generateResume(
    body: CreateAiResumeDto,
    previousResumeText: string,
  ): Promise<ResumeExportPayload> {
    const result = await this.aiService.generateResumeFromBrief({
      introduction: body.introduction,
      background: body.background,
      target: body.target,
      previousResumeText,
    });

    return toResumePayload(result, body, previousResumeText);
  }
}
