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

  async validate(
    accessToken: string,
    refreshToken: string,
    profile: Profile,
    done: (
      error: Error | null,
      user?: {
        githubId: string;
        email?: string;
        firstName: string;
        lastName: string;
        displayName: string;
        username: string;
        picture?: string;
        accessToken: string;
      },
    ) => void,
  ): Promise<void> {
    try {
      const { id, username, displayName, photos, emails } = profile;

      // Try to get email from profile first
      let email = emails?.[0]?.value;

      // If no email in profile, try to fetch from GitHub API
      if (!email && accessToken) {
        try {
          const response = await fetch('https://api.github.com/user/emails', {
            headers: {
              Authorization: `token ${accessToken}`,
              Accept: 'application/vnd.github.v3+json',
            },
          });

          if (response.ok) {
            const emailData = await response.json();
            const primaryEmail = emailData.find((e: any) => e.primary)?.email;
            const verifiedEmail = emailData.find((e: any) => e.verified)?.email;
            email = primaryEmail || verifiedEmail || emailData[0]?.email;
          }
        } catch (err) {
          console.warn('Failed to fetch email from GitHub API:', err instanceof Error ? err.message : err);
          // Email fetching failed, will be handled in auth.service
        }
      }

      const user = {
        githubId: id.toString(),
        email, // May be undefined if GitHub email is hidden
        firstName: displayName?.split(' ')[0] || username || 'GitHub',
        lastName: displayName?.split(' ').slice(1).join(' ') || 'User',
        displayName: displayName || username || 'GitHub User',
        username: username || `github_${id}`,
        picture: photos?.[0]?.value,
        accessToken,
      };

      done(null, user);
    } catch (error) {
      done(error as Error);
    }
  }
}
