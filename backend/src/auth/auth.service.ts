import {
  Injectable,
  UnauthorizedException,
  ConflictException,
  BadRequestException,
  Logger,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../prisma/prisma.service';
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
  ) {}

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
    const hashedPassword = await bcrypt.hash(password, 10);

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

    // Send verification email (non-blocking)
    // Note: EmailService will be injected if needed, but for now we'll skip to avoid circular dependency
    // Verification email can be sent via a separate endpoint call

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

    // Check if user exists by Google ID
    let user = await this.prisma.user.findUnique({
      where: { googleId },
    });

    // If not found, check by email
    if (!user) {
      user = await this.prisma.user.findUnique({
        where: { email },
      });
    }

    if (user) {
      // Update Google ID if not set
      if (!user.googleId) {
        user = await this.prisma.user.update({
          where: { id: user.id },
          data: {
            googleId,
            oauthProvider: 'GOOGLE',
            profile_picture_url: picture || user.profile_picture_url,
          },
        });

        // Create OAuth account link
        await this.prisma.oAuthAccount.upsert({
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
      }
    } else {
      // Create new user with minimal profile
      const username = `user_${Date.now()}_${Math.random().toString(36).substring(7)}`;
      if (!email) {
        throw new BadRequestException('Email is required for Google OAuth');
      }
      user = await this.prisma.user.create({
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
      });

      // Create OAuth account link
      await this.prisma.oAuthAccount.create({
        data: {
          userId: user.id,
          provider: 'GOOGLE',
          providerId: googleId,
          email,
        },
      });
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
  }

  async githubLogin(
    profile: OAuthUser & {
      githubId: string;
      email?: string;
      firstName?: string;
      lastName?: string;
      username?: string;
      picture?: string;
    },
  ) {
    const {
      githubId,
      email,
      firstName,
      lastName,
      displayName,
      username,
      picture,
    } = profile;

    // Check if user exists by GitHub ID
    let user = await this.prisma.user.findUnique({
      where: { githubId },
    });

    // If not found, check by email
    if (!user && email) {
      user = await this.prisma.user.findUnique({
        where: { email },
      });
    }

    if (user) {
      // Update GitHub ID if not set
      if (!user.githubId) {
        user = await this.prisma.user.update({
          where: { id: user.id },
          data: {
            githubId,
            oauthProvider: user.oauthProvider || 'GITHUB',
            profile_picture_url: picture || user.profile_picture_url,
          },
        });

        // Create OAuth account link
        await this.prisma.oAuthAccount.upsert({
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
            email,
          },
          update: {
            email,
          },
        });
      }
    } else {
      // Create new user with minimal profile
      const uniqueUsername =
        username ||
        `github_${Date.now()}_${Math.random().toString(36).substring(7)}`;
      const userEmail = email || `${uniqueUsername}@github`;
      user = await this.prisma.user.create({
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
      });

      // Create OAuth account link
      await this.prisma.oAuthAccount.create({
        data: {
          userId: user.id,
          provider: 'GITHUB',
          providerId: githubId,
          email,
        },
      });
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
