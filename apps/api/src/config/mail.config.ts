import { registerAs } from '@nestjs/config';
import { booleanEnv, numberEnv, optionalEnv } from './env';

export const mailConfig = registerAs('mail', () => ({
  host: optionalEnv('SMTP_HOST'),
  port: numberEnv('SMTP_PORT', 587),
  secure: booleanEnv('SMTP_SECURE'),
  user: optionalEnv('SMTP_USER'),
  pass: optionalEnv('SMTP_PASS'),
  from: optionalEnv('SMTP_FROM'),
}));
