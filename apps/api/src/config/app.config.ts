import { registerAs } from '@nestjs/config';
import { numberEnv, optionalEnv, requiredEnv } from './env';

export const appConfig = registerAs('app', () => ({
  nodeEnv: optionalEnv('NODE_ENV') ?? 'development',
  port: numberEnv('PORT', 5050),
  secret: requiredEnv('APP_SECRET'),
}));
