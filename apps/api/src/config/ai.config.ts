import { registerAs } from '@nestjs/config';
import { numberEnv, optionalEnv } from './env';

export const DEFAULT_CLOUDFLARE_AI_MODELS = [
  '@cf/meta/llama-3.1-8b-instruct-fast',
  '@cf/meta/llama-3.2-3b-instruct',
  '@cf/openai/gpt-oss-20b',
] as const;

export const aiConfig = registerAs('ai', () => ({
  cloudflareAccountId: optionalEnv('CLOUDFLARE_ACCOUNT_ID'),
  cloudflareApiToken: optionalEnv('CLOUDFLARE_API_TOKEN'),
  models: [
    ...new Set(
      [
        optionalEnv('CLOUDFLARE_AI_MODEL'),
        ...(optionalEnv('CLOUDFLARE_AI_MODELS')?.split(',') ?? []),
        ...DEFAULT_CLOUDFLARE_AI_MODELS,
      ]
        .map((model) => model?.trim())
        .filter((model): model is string => Boolean(model)),
    ),
  ],
  maxOutputTokens: numberEnv('MAX_OUTPUT_TOKENS', 500),
  coverLetterMaxOutputTokens: numberEnv(
    'AI_COVER_LETTER_MAX_OUTPUT_TOKENS',
    600,
  ),
  resumeMaxOutputTokens: numberEnv('AI_RESUME_MAX_OUTPUT_TOKENS', 2800),
}));
