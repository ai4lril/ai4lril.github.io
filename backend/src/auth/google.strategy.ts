import { Injectable } from '@nestjs/common';
import { AuthService } from './auth.service';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy, VerifyCallback } from 'passport-google-oauth20';

@Injectable()
export class GoogleStrategy extends PassportStrategy(Strategy, 'google') {
  constructor(private authService: AuthService) {
    super({
      clientID: process.env.GOOGLE_CLIENT_ID || '',
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || '',
      callbackURL:
        process.env.GOOGLE_CALLBACK_URL || '/api/auth/google/callback',
      scope: ['email', 'profile'],
    });
  }

  validate(
    accessToken: string,
    refreshToken: string,
    profile: {
      id: string;
      name?: { givenName?: string; familyName?: string; displayName?: string };
      emails?: Array<{ value: string }>;
      photos?: Array<{ value: string }>;
    },
    done: VerifyCallback,
  ): void {
    try {
      const { id, name, emails, photos } = profile;

      if (!id) {
        return done(new Error('Google profile ID is missing'));
      }

      if (!emails || !emails[0] || !emails[0].value) {
        return done(new Error('Google email is missing'));
      }

      const user = {
        googleId: id,
        email: emails[0].value,
        firstName: name?.givenName || '',
        lastName: name?.familyName || '',
        displayName:
          name?.displayName ||
          `${name?.givenName || ''} ${name?.familyName || ''}`.trim() ||
          emails[0].value.split('@')[0],
        picture: photos?.[0]?.value,
        accessToken,
      };

      done(null, user);
    } catch (error) {
      done(error);
    }
  }
}
