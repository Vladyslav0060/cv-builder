import { registerAs } from '@nestjs/config';
import { optionalEnv, requiredEnv } from './env';

export const databaseConfig = registerAs('database', () => ({
  databaseUrl: requiredEnv('DATABASE_URL'),
  directUrl: optionalEnv('DIRECT_URL'),
  sessionConnectionString:
    optionalEnv('DIRECT_URL') ?? requiredEnv('DATABASE_URL'),
}));
