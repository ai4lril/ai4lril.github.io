import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy, Profile } from 'passport-github2';
import { AuthService } from './auth.service';

@Injectable()
export class GitHubStrategy extends PassportStrategy(Strategy, 'github') {
  constructor(private authService: AuthService) {
    super({
      clientID: process.env.GITHUB_CLIENT_ID || '',
      clientSecret: process.env.GITHUB_CLIENT_SECRET || '',
      callbackURL:
        process.env.GITHUB_CALLBACK_URL || '/api/auth/github/callback',
      scope: ['user:email'],
    });
  }

  validate(
    accessToken: string,
    refreshToken: string,
    profile: Profile,
    done: (
      error: Error | null,
      user?: {
        githubId: string;
        email: string;
        firstName: string;
        lastName: string;
        displayName: string;
        username: string;
        picture?: string;
        accessToken: string;
      },
    ) => void,
  ): void {
    const { id, username, displayName, photos, emails } = profile;
    const user = {
      githubId: id.toString(),
      email: emails?.[0]?.value || `${username}@github`,
      firstName: displayName?.split(' ')[0] || username || 'GitHub',
      lastName: displayName?.split(' ').slice(1).join(' ') || 'User',
      displayName: displayName || username || 'GitHub User',
      username: username || `github_${id}`,
      picture: photos?.[0]?.value,
      accessToken,
    };

    done(null, user);
  }
}
