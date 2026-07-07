import { registerAs } from '@nestjs/config';
import { optionalEnv } from './env';

export const webConfig = registerAs('web', () => ({
  baseUrl: optionalEnv('WEB_BASE_URL') ?? 'http://localhost:3000',
}));
