import { registerAs } from '@nestjs/config';
import { optionalEnv } from './env';

export const authConfig = registerAs('auth', () => ({
  successRedirectUrl: optionalEnv('AUTH_SUCCESS_REDIRECT_URL'),
  google: {
    clientId: optionalEnv('GOOGLE_CLIENT_ID'),
    clientSecret: optionalEnv('GOOGLE_CLIENT_SECRET'),
    callbackUrl:
      optionalEnv('GOOGLE_CALLBACK_URL') ??
      'http://localhost:5050/auth/google/callback',
  },
}));
