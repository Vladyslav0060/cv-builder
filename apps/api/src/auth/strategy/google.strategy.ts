import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Profile, Strategy } from 'passport-google-oauth20';
import { AuthService } from '../auth.service';

@Injectable()
export class GoogleStrategy extends PassportStrategy(Strategy, 'google') {
  constructor(private readonly authService: AuthService) {
    super({
      clientID: process.env.GOOGLE_CLIENT_ID as string,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET as string,
      callbackURL:
        process.env.GOOGLE_CALLBACK_URL ??
        'http://localhost:5050/auth/google/callback',
      scope: ['email', 'profile'],
    });
  }

  async validate(
    _accessToken: string,
    _refreshToken: string,
    profile: Profile,
  ) {
    return this.authService.loginWithGoogle({
      id: profile.id,
      emails: profile.emails?.map((email) => ({ value: email.value })),
      name: {
        givenName: profile.name?.givenName,
        familyName: profile.name?.familyName,
      },
      photos: profile.photos?.map((photo) => ({ value: photo.value })),
    });
  }
}
