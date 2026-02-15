import {
  Injectable,
  UnauthorizedException,
  ConflictException,
  BadRequestException,
  Logger,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../prisma/prisma.service';
import { VerificationService } from '../verification.service';
import * as bcrypt from 'bcryptjs';
import { LoginDto } from './dto/login.dto';
import { SignupDto } from './dto/signup.dto';

interface UserCreateData {
  first_name: string;
  last_name: string;
  display_name: string;
  username: string;
  email: string;
  password?: string;
  phone_number?: string | null;
  current_residence_pincode?: string | null;
  birth_place_pincode?: string | null;
  birth_date?: Date | null;
  gender?: string | null;
  religion?: string;
  mother?: string;
  first_language?: string | null;
  second_language?: string;
  third_language?: string;
  fourth_language?: string;
  fifth_language?: string;
  profile_picture_url?: string;
}

interface JwtPayload {
  sub: string;
  email?: string;
  type?: string;
  iat?: number;
  exp?: number;
}

export interface OAuthUser {
  googleId?: string;
  githubId?: string;
  oauthProvider?: string;
  email?: string;
  displayName?: string;
  givenName?: string;
  familyName?: string;
  name?: string;
  firstName?: string;
  lastName?: string;
  username?: string;
  picture?: string;
  accessToken?: string;
}

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);

  constructor(
    private jwtService: JwtService,
    private prisma: PrismaService,
    private verificationService: VerificationService,
  ) { }

  async signup(signupDto: SignupDto) {
    const { email, username, password, birth_date, ...userData } = signupDto;

    // Password is required for regular signup (not OAuth)
    if (!password || password.trim() === '') {
      throw new BadRequestException('Password is required for signup');
    }

    // Check if user already exists
    const existingUser = await this.prisma.user.findFirst({
      where: {
        OR: [{ email }, { username }],
      },
    });

    if (existingUser) {
      throw new ConflictException(
        'User with this email or username already exists',
      );
    }

    // Hash password (required for regular signup)
    const hashedPassword = await bcrypt.hash(password, 12);

    // Prepare user data with conditional fields
    const userCreateData: UserCreateData = {
      ...userData,
      email,
      username,
      password: hashedPassword,
      phone_number: userData.phone_number === '' ? null : userData.phone_number,
      current_residence_pincode:
        userData.current_residence_pincode === ''
          ? null
          : userData.current_residence_pincode,
      birth_place_pincode:
        userData.birth_place_pincode === ''
          ? null
          : userData.birth_place_pincode,
      gender: userData.gender === '' ? null : userData.gender,
      first_language:
        userData.first_language === '' ? null : userData.first_language,
    };

    // Only include birth_date if it was provided
    if (birth_date) {
      userCreateData.birth_date = new Date(birth_date);
    }

    // Create user
    const user = await this.prisma.user.create({
      data: userCreateData,
      select: {
        id: true,
        first_name: true,
        last_name: true,
        display_name: true,
        username: true,
        email: true,
        phone_number: true,
        current_residence_pincode: true,
        birth_place_pincode: true,
        birth_date: true,
        gender: true,
        religion: true,
        mother: true,
        first_language: true,
        second_language: true,
        third_language: true,
        fourth_language: true,
        fifth_language: true,
        profile_picture_url: true,
        created_at: true,
      },
    });

    // Generate JWT token with expiration
    const payload = { sub: user.id, email: user.email };
    const token = this.jwtService.sign(payload, { expiresIn: '15m' });

    // Generate refresh token (longer expiration)
    const refreshToken = this.jwtService.sign(
      { sub: user.id, type: 'refresh' },
      { expiresIn: '7d' },
    );

    // Send verification email (non-blocking, do not await)
    this.verificationService
      .sendVerificationEmail(user.id)
      .catch((err) =>
        this.logger.warn(`Failed to send verification email: ${err.message}`),
      );

    return {
      user,
      token,
      refreshToken,
    };
  }

  async login(loginDto: LoginDto) {
    const { email, password } = loginDto;

    // Find user by email
    const user = await this.prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    // Check if user has a password (OAuth users might not have one)
    if (!user.password) {
      throw new UnauthorizedException(
        'Please use OAuth login for this account',
      );
    }

    // Verify password
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid credentials');
    }

    // Generate JWT token
    const payload = { sub: user.id, email: user.email };
    const token = this.jwtService.sign(payload);

    return {
      user: {
        id: user.id,
        first_name: user.first_name,
        last_name: user.last_name,
        display_name: user.display_name,
        username: user.username,
        email: user.email,
        phone_number: user.phone_number,
        current_residence_pincode: user.current_residence_pincode,
        birth_place_pincode: user.birth_place_pincode,
        birth_date: user.birth_date,
        gender: user.gender,
        religion: user.religion,
        mother: user.mother,
        first_language: user.first_language,
        second_language: user.second_language,
        third_language: user.third_language,
        fourth_language: user.fourth_language,
        fifth_language: user.fifth_language,
        profile_picture_url: user.profile_picture_url,
        created_at: user.created_at,
      },
      token,
    };
  }

  async googleLogin(
    profile: OAuthUser & {
      googleId: string;
      firstName?: string;
      lastName?: string;
      picture?: string;
    },
  ) {
    const { googleId, email, firstName, lastName, displayName, picture } =
      profile;

    // Validate email is present (Google should always provide email)
    if (!email) {
      throw new BadRequestException(
        'Email is required for Google OAuth. Please ensure your Google account has a verified email address.',
      );
    }

    // Use transaction to prevent race conditions
    return await this.prisma.$transaction(
      async (tx) => {
        // Check if user exists by Google ID
        let user = await tx.user.findUnique({
          where: { googleId },
          include: {
            oauthAccounts: true,
          },
        });

        // If not found, check by email
        if (!user) {
          user = await tx.user.findUnique({
            where: { email },
            include: {
              oauthAccounts: true,
            },
          });
        }

        if (user) {
          // Handle email conflict: user exists with different provider
          // const hasGoogleAccount = user.oauthAccounts.some(
          //   (acc) => acc.provider === 'GOOGLE',
          // );
          // const hasOtherProvider = user.oauthAccounts.some(
          //   (acc) => acc.provider !== 'GOOGLE',
          // );

          // Update Google ID if not set (account linking)
          if (!user.googleId) {
            // Check if another user already has this Google ID (race condition)
            const existingGoogleUser = await tx.user.findUnique({
              where: { googleId },
            });

            if (existingGoogleUser && existingGoogleUser.id !== user.id) {
              throw new ConflictException(
                'This Google account is already linked to another user.',
              );
            }

            user = await tx.user.update({
              where: { id: user.id },
              data: {
                googleId,
                oauthProvider: user.oauthProvider || 'GOOGLE',
                profile_picture_url: picture || user.profile_picture_url,
              },
              include: {
                oauthAccounts: true,
              },
            });
          }

          // Create or update OAuth account link
          await tx.oAuthAccount.upsert({
            where: {
              provider_providerId: {
                provider: 'GOOGLE',
                providerId: googleId,
              },
            },
            create: {
              userId: user.id,
              provider: 'GOOGLE',
              providerId: googleId,
              email,
            },
            update: {
              email,
            },
          });
        } else {
          // Check for race condition: another process might have created user
          const existingUser = await tx.user.findFirst({
            where: {
              OR: [{ googleId }, { email }],
            },
          });

          if (existingUser) {
            // Retry with existing user
            return this.googleLogin(profile);
          }

          // Create new user with minimal profile
          const username = `user_${Date.now()}_${Math.random().toString(36).substring(7)}`;
          try {
            user = await tx.user.create({
              data: {
                email,
                username,
                first_name: firstName || 'User',
                last_name: lastName || '',
                display_name:
                  displayName ||
                  `${firstName || ''} ${lastName || ''}`.trim() ||
                  'User',
                googleId,
                oauthProvider: 'GOOGLE',
                profile_picture_url: picture,
                // Minimal required fields for OAuth users
                phone_number: '',
                current_residence_pincode: '',
                birth_place_pincode: '',
              },
              include: {
                oauthAccounts: true,
              },
            });

            // Create OAuth account link
            await tx.oAuthAccount.create({
              data: {
                userId: user.id,
                provider: 'GOOGLE',
                providerId: googleId,
                email,
              },
            });
          } catch (error: any) {
            // Handle unique constraint violations (race condition)
            if (error.code === 'P2002') {
              // User was created by another process, retry lookup
              user = await tx.user.findUnique({
                where: { email },
                include: {
                  oauthAccounts: true,
                },
              });
              if (user && !user.googleId) {
                user = await tx.user.update({
                  where: { id: user.id },
                  data: {
                    googleId,
                    oauthProvider: 'GOOGLE',
                    profile_picture_url: picture || user.profile_picture_url,
                  },
                  include: {
                    oauthAccounts: true,
                  },
                });
              }
            } else {
              throw error;
            }
          }
        }

        // Ensure user exists (should never be null at this point, but TypeScript needs this check)
        if (!user) {
          throw new Error('Failed to create or retrieve user');
        }

        // Generate JWT token with expiration
        const payload = { sub: user.id, email: user.email };
        const token = this.jwtService.sign(payload, { expiresIn: '15m' });

        // Generate refresh token (longer expiration)
        const refreshToken = this.jwtService.sign(
          { sub: user.id, type: 'refresh' },
          { expiresIn: '7d' },
        );

        return {
          user: {
            id: user.id,
            first_name: user.first_name,
            last_name: user.last_name,
            display_name: user.display_name,
            username: user.username,
            email: user.email,
            phone_number: user.phone_number,
            current_residence_pincode: user.current_residence_pincode,
            birth_place_pincode: user.birth_place_pincode,
            birth_date: user.birth_date,
            gender: user.gender,
            religion: user.religion,
            mother: user.mother,
            first_language: user.first_language,
            second_language: user.second_language,
            third_language: user.third_language,
            fourth_language: user.fourth_language,
            fifth_language: user.fifth_language,
            profile_picture_url: user.profile_picture_url,
            created_at: user.created_at,
          },
          token,
          refreshToken,
        };
      },
    );
  }

  /**
   * Fetch GitHub user email using access token
   * GitHub allows users to hide their email, so we need to fetch it via API
   */
  private async fetchGitHubEmail(
    accessToken: string,
  ): Promise<string | null> {
    try {
      const response = await fetch('https://api.github.com/user/emails', {
        headers: {
          Authorization: `token ${accessToken}`,
          Accept: 'application/vnd.github.v3+json',
        },
      });

      if (!response.ok) {
        this.logger.warn('Failed to fetch GitHub emails');
        return null;
      }

      const emails = await response.json();
      // Find primary email or first verified email
      const primaryEmail = emails.find((e: any) => e.primary)?.email;
      const verifiedEmail = emails.find((e: any) => e.verified)?.email;

      return primaryEmail || verifiedEmail || emails[0]?.email || null;
    } catch (error) {
      this.logger.error(
        `Error fetching GitHub email: ${error instanceof Error ? error.message : 'Unknown error'}`,
      );
      return null;
    }
  }

  async githubLogin(
    profile: OAuthUser & {
      githubId: string;
      email?: string;
      firstName?: string;
      lastName?: string;
      username?: string;
      picture?: string;
      accessToken?: string;
    },
  ) {
    const {
      githubId,
      email: profileEmail,
      firstName,
      lastName,
      displayName,
      username,
      picture,
      accessToken,
    } = profile;

    // Try to fetch email from GitHub API if not in profile (GitHub allows hiding email)
    let email: string | undefined = profileEmail;
    if (!email && accessToken) {
      const fetchedEmail = await this.fetchGitHubEmail(accessToken);
      email = fetchedEmail || undefined;
    }

    // If still no email, generate a placeholder (but warn user)
    const uniqueUsername =
      username ||
      `github_${Date.now()}_${Math.random().toString(36).substring(7)}`;
    const userEmail = email || `${uniqueUsername}@github.noreply`;

    // Use transaction to prevent race conditions
    return await this.prisma.$transaction(
      async (tx) => {
        // Check if user exists by GitHub ID
        let user = await tx.user.findUnique({
          where: { githubId },
          include: {
            oauthAccounts: true,
          },
        });

        // If not found, check by email (only if we have a real email)
        if (!user && email && !email.endsWith('@github.noreply')) {
          user = await tx.user.findUnique({
            where: { email },
            include: {
              oauthAccounts: true,
            },
          });
        }

        if (user) {
          // Handle email conflict: user exists with different provider
          // const hasGithubAccount = user.oauthAccounts.some(
          //   (acc) => acc.provider === 'GITHUB',
          // );

          // Update GitHub ID if not set (account linking)
          if (!user.githubId) {
            // Check if another user already has this GitHub ID (race condition)
            const existingGithubUser = await tx.user.findUnique({
              where: { githubId },
            });

            if (existingGithubUser && existingGithubUser.id !== user.id) {
              throw new ConflictException(
                'This GitHub account is already linked to another user.',
              );
            }

            user = await tx.user.update({
              where: { id: user.id },
              data: {
                githubId,
                oauthProvider: user.oauthProvider || 'GITHUB',
                profile_picture_url: picture || user.profile_picture_url,
              },
              include: {
                oauthAccounts: true,
              },
            });
          }

          // Create or update OAuth account link
          await tx.oAuthAccount.upsert({
            where: {
              provider_providerId: {
                provider: 'GITHUB',
                providerId: githubId,
              },
            },
            create: {
              userId: user.id,
              provider: 'GITHUB',
              providerId: githubId,
              email: email || user.email,
            },
            update: {
              email: email || user.email,
            },
          });
        } else {
          // Check for race condition: another process might have created user
          const existingUser = await tx.user.findFirst({
            where: {
              OR: [{ githubId }, { email: userEmail }],
            },
          });

          if (existingUser) {
            // Retry with existing user
            return this.githubLogin(profile);
          }

          // Create new user with minimal profile
          try {
            user = await tx.user.create({
              data: {
                email: userEmail,
                username: uniqueUsername,
                first_name: firstName || 'GitHub',
                last_name: lastName || 'User',
                display_name: displayName || username || 'GitHub User',
                githubId,
                oauthProvider: 'GITHUB',
                profile_picture_url: picture,
                // Minimal required fields for OAuth users
                phone_number: '',
                current_residence_pincode: '',
                birth_place_pincode: '',
              },
              include: {
                oauthAccounts: true,
              },
            });

            // Create OAuth account link
            await tx.oAuthAccount.create({
              data: {
                userId: user.id,
                provider: 'GITHUB',
                providerId: githubId,
                email: email || userEmail,
              },
            });
          } catch (error: any) {
            // Handle unique constraint violations (race condition)
            if (error.code === 'P2002') {
              // User was created by another process, retry lookup
              user = await tx.user.findUnique({
                where: { githubId },
                include: {
                  oauthAccounts: true,
                },
              });
              if (!user && email && !email.endsWith('@github.noreply')) {
                user = await tx.user.findUnique({
                  where: { email },
                  include: {
                    oauthAccounts: true,
                  },
                });
              }
              if (user && !user.githubId) {
                user = await tx.user.update({
                  where: { id: user.id },
                  data: {
                    githubId,
                    oauthProvider: 'GITHUB',
                    profile_picture_url: picture || user.profile_picture_url,
                  },
                  include: {
                    oauthAccounts: true,
                  },
                });
              }
            } else {
              throw error;
            }
          }
        }

        // Ensure user exists (should never be null at this point, but TypeScript needs this check)
        if (!user) {
          throw new Error('Failed to create or retrieve user');
        }

        // Generate JWT token with expiration
        const payload = { sub: user.id, email: user.email };
        const token = this.jwtService.sign(payload, { expiresIn: '15m' });

        // Generate refresh token (longer expiration)
        const refreshToken = this.jwtService.sign(
          { sub: user.id, type: 'refresh' },
          { expiresIn: '7d' },
        );

        return {
          user: {
            id: user.id,
            first_name: user.first_name,
            last_name: user.last_name,
            display_name: user.display_name,
            username: user.username,
            email: user.email,
            phone_number: user.phone_number,
            current_residence_pincode: user.current_residence_pincode,
            birth_place_pincode: user.birth_place_pincode,
            birth_date: user.birth_date,
            gender: user.gender,
            religion: user.religion,
            mother: user.mother,
            first_language: user.first_language,
            second_language: user.second_language,
            third_language: user.third_language,
            fourth_language: user.fourth_language,
            fifth_language: user.fifth_language,
            profile_picture_url: user.profile_picture_url,
            created_at: user.created_at,
          },
          token,
          refreshToken,
          // Warn if email was not available from GitHub
          emailWarning:
            !email || email.endsWith('@github.noreply')
              ? 'Email not available from GitHub. Please update your email in profile settings.'
              : undefined,
        };
      },
      {
        timeout: 10000, // 10 second timeout for transaction
      },
    );
  }

  async linkOAuthProvider(
    userId: string,
    provider: 'GOOGLE' | 'GITHUB',
    providerId: string,
    email?: string,
  ) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new UnauthorizedException('User not found');
    }

    // Check if provider ID already exists
    const existingAccount = await this.prisma.oAuthAccount.findUnique({
      where: {
        provider_providerId: {
          provider,
          providerId,
        },
      },
    });

    if (existingAccount && existingAccount.userId !== userId) {
      throw new ConflictException(
        'This OAuth account is already linked to another user',
      );
    }

    // Update user model
    const updateData: {
      googleId?: string;
      githubId?: string;
      oauthProvider?: 'GOOGLE' | 'GITHUB';
    } = {};
    if (provider === 'GOOGLE') {
      updateData.googleId = providerId;
    } else if (provider === 'GITHUB') {
      updateData.githubId = providerId;
    }
    if (!user.oauthProvider) {
      updateData.oauthProvider = provider;
    }

    await this.prisma.user.update({
      where: { id: userId },
      data: updateData,
    });

    // Create or update OAuth account link
    await this.prisma.oAuthAccount.upsert({
      where: {
        provider_providerId: {
          provider,
          providerId,
        },
      },
      create: {
        userId,
        provider,
        providerId,
        email,
      },
      update: {
        email,
      },
    });

    return {
      success: true,
      message: `${provider} account linked successfully`,
    };
  }

  async unlinkOAuthProvider(userId: string, provider: 'GOOGLE' | 'GITHUB') {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new UnauthorizedException('User not found');
    }

    // Check if user has password or another OAuth provider
    const oauthAccounts = await this.prisma.oAuthAccount.findMany({
      where: { userId },
    });

    if (!user.password && oauthAccounts.length <= 1) {
      throw new ConflictException(
        'Cannot unlink the only authentication method. Please set a password first.',
      );
    }

    // Remove OAuth account link
    await this.prisma.oAuthAccount.deleteMany({
      where: {
        userId,
        provider,
      },
    });

    // Update user model
    const updateData: {
      googleId?: null;
      githubId?: null;
      oauthProvider?: 'GOOGLE' | 'GITHUB' | null;
    } = {};
    if (provider === 'GOOGLE') {
      updateData.googleId = null;
    } else if (provider === 'GITHUB') {
      updateData.githubId = null;
    }

    // Reset oauthProvider if this was the primary provider
    if (user.oauthProvider === provider) {
      const remainingAccounts = oauthAccounts.filter(
        (acc) => acc.provider !== provider,
      );
      updateData.oauthProvider =
        remainingAccounts.length > 0
          ? (remainingAccounts[0].provider as 'GOOGLE' | 'GITHUB')
          : null;
    }

    await this.prisma.user.update({
      where: { id: userId },
      data: updateData,
    });

    return {
      success: true,
      message: `${provider} account unlinked successfully`,
    };
  }

  async validateUser(userId: string) {
    return this.prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        first_name: true,
        last_name: true,
        display_name: true,
        username: true,
        email: true,
        phone_number: true,
        current_residence_pincode: true,
        birth_place_pincode: true,
        birth_date: true,
        gender: true,
        religion: true,
        mother: true,
        first_language: true,
        second_language: true,
        third_language: true,
        fourth_language: true,
        fifth_language: true,
        profile_picture_url: true,
        created_at: true,
      },
    });
  }

  async refreshToken(refreshToken: string) {
    try {
      const payload = this.jwtService.verify<JwtPayload>(refreshToken);

      if (payload.type !== 'refresh') {
        throw new UnauthorizedException('Invalid refresh token');
      }

      const user = await this.prisma.user.findUnique({
        where: { id: payload.sub },
      });

      if (!user) {
        throw new UnauthorizedException('User not found');
      }

      // Generate new access token
      const newPayload = { sub: user.id, email: user.email };
      const newToken = this.jwtService.sign(newPayload, { expiresIn: '15m' });

      return {
        token: newToken,
      };
    } catch {
      throw new UnauthorizedException('Invalid or expired refresh token');
    }
  }
}
