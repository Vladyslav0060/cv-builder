import { registerAs } from '@nestjs/config';
import { numberEnv, optionalEnv } from './env';

export const aiConfig = registerAs('ai', () => ({
  cloudflareAccountId: optionalEnv('CLOUDFLARE_ACCOUNT_ID'),
  cloudflareApiToken: optionalEnv('CLOUDFLARE_API_TOKEN'),
  model: optionalEnv('CLOUDFLARE_AI_MODEL') ?? '@cf/meta/llama-3.1-8b-instruct',
  maxOutputTokens: numberEnv('MAX_OUTPUT_TOKENS', 500),
}));
