import {
  Get,
  Req,
  Res,
  Body,
  Post,
  UseGuards,
  Controller,
  ValidationPipe,
  HttpCode,
  ConflictException,
  BadRequestException,
} from '@nestjs/common';
import { Throttle } from '@nestjs/throttler';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { AuthGuard } from '@nestjs/passport';
import { FastifyReply } from 'fastify';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { SignupDto } from './dto/signup.dto';
import { RefreshTokenDto } from './dto/refresh-token.dto';
import { LinkOAuthDto, UnlinkOAuthDto } from './dto/link-oauth.dto';
import { RequestPasswordResetDto, ResetPasswordDto } from './dto/password-reset.dto';
import { JwtAuthGuard } from './jwt-auth.guard';
import { OAuthUser, AuthLoginResult } from './auth.service';
import { getErrorMessage } from '../common/error-utils';
import { RequestUser } from '../common/request-user.types';
import { RecoveryService } from './recovery.service';

interface RequestWithUser {
  user: RequestUser & {
    googleId?: string;
    githubId?: string;
    email?: string;
    firstName?: string;
    lastName?: string;
    displayName?: string;
    username?: string;
    picture?: string;
    accessToken?: string;
  };
}

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly recoveryService: RecoveryService,
  ) { }

  @Post('signup')
  @Throttle({ auth: { limit: 5, ttl: 60000 } })
  @ApiOperation({ summary: 'Register a new user' })
  @ApiResponse({ status: 201, description: 'User created successfully' })
  @ApiResponse({ status: 400, description: 'Invalid input' })
  @ApiResponse({ status: 409, description: 'Email or username already exists' })
  async signup(@Body(ValidationPipe) signupDto: SignupDto) {
    return this.authService.signup(signupDto);
  }

  @Post('login')
  @HttpCode(200)
  @Throttle({ auth: { limit: 5, ttl: 60000 } })
  @ApiOperation({ summary: 'Login with email and password' })
  @ApiResponse({ status: 200, description: 'Login successful' })
  @ApiResponse({ status: 401, description: 'Invalid credentials' })
  async login(@Body(ValidationPipe) loginDto: LoginDto) {
    return this.authService.login(loginDto);
  }

  @Get('google')
  @UseGuards(AuthGuard('google'))
  async googleAuth() {
    // Initiates Google OAuth flow
  }

  @Get('google/callback')
  @UseGuards(AuthGuard('google'))
  async googleAuthCallback(
    @Req() req: RequestWithUser,
    @Res() res: FastifyReply,
  ) {
    try {
      const user = req.user as OAuthUser & {
        googleId: string;
        email: string;
        firstName?: string;
        lastName?: string;
        picture?: string;
      };
      const result: AuthLoginResult = await this.authService.googleLogin(user);
      const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5577';
      const redirectUrl = `${frontendUrl}/auth/callback?token=${result.token}&refreshToken=${result.refreshToken}&provider=google`;
      return res.redirect(redirectUrl);
    } catch (error: unknown) {
      // Log error for debugging
      console.error('Google OAuth error:', getErrorMessage(error));

      const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5577';
      let errorParam = 'oauth_failed';

      // Map specific errors to user-friendly messages
      if (error instanceof ConflictException) {
        errorParam = 'account_linked';
      } else if (error instanceof BadRequestException) {
        errorParam = 'email_required';
      }

      return res.redirect(`${frontendUrl}/login?error=${errorParam}`);
    }
  }

  @Get('github')
  @UseGuards(AuthGuard('github'))
  async githubAuth() {
    // Initiates GitHub OAuth flow
  }

  @Get('github/callback')
  @UseGuards(AuthGuard('github'))
  async githubAuthCallback(
    @Req() req: RequestWithUser,
    @Res() res: FastifyReply,
  ) {
    try {
      const user = req.user as OAuthUser & {
        githubId: string;
        email?: string;
        firstName?: string;
        lastName?: string;
        username?: string;
        picture?: string;
        accessToken?: string;
      };
      const result: AuthLoginResult = await this.authService.githubLogin(user);
      const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5577';
      let redirectUrl = `${frontendUrl}/auth/callback?token=${result.token}&refreshToken=${result.refreshToken}&provider=github`;

      // Add email warning if present
      if (result.emailWarning) {
        redirectUrl += `&emailWarning=${encodeURIComponent(result.emailWarning)}`;
      }

      return res.redirect(redirectUrl);
    } catch (error: unknown) {
      // Log error for debugging
      console.error('GitHub OAuth error:', getErrorMessage(error));

      const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5577';
      let errorParam = 'oauth_failed';

      // Map specific errors to user-friendly messages
      if (error instanceof ConflictException) {
        errorParam = 'account_linked';
      } else if (error instanceof BadRequestException) {
        errorParam = 'email_required';
      }

      return res.redirect(`${frontendUrl}/login?error=${errorParam}`);
    }
  }

  @Post('link-oauth')
  @UseGuards(JwtAuthGuard)
  async linkOAuth(
    @Req() req: RequestWithUser,
    @Body(ValidationPipe) body: LinkOAuthDto,
  ) {
    const userId = req.user.id;
    if (!userId) {
      throw new Error('User ID is required');
    }
    return this.authService.linkOAuthProvider(
      userId,
      body.provider,
      body.providerId,
      body.email,
    );
  }

  @Post('unlink-oauth')
  @UseGuards(JwtAuthGuard)
  async unlinkOAuth(
    @Req() req: RequestWithUser,
    @Body(ValidationPipe) body: UnlinkOAuthDto,
  ) {
    const userId = req.user.id;
    if (!userId) {
      throw new Error('User ID is required');
    }
    return this.authService.unlinkOAuthProvider(userId, body.provider);
  }

  @Post('refresh')
  @HttpCode(200)
  async refresh(@Body(ValidationPipe) refreshTokenDto: RefreshTokenDto) {
    return this.authService.refreshToken(refreshTokenDto.refreshToken);
  }

  @Post('me')
  @UseGuards(JwtAuthGuard)
  @HttpCode(200)
  getProfile(@Req() req: RequestWithUser) {
    // The user object will be available from the JWT guard
    return { user: req.user, message: 'Profile retrieved successfully' };
  }

  @Post('password-reset/request')
  @HttpCode(200)
  @Throttle({ auth: { limit: 3, ttl: 60000 } })
  @ApiOperation({ summary: 'Request password reset email' })
  @ApiResponse({ status: 200, description: 'If email exists, reset link sent' })
  async requestPasswordReset(@Body(ValidationPipe) body: RequestPasswordResetDto) {
    await this.recoveryService.requestPasswordReset(body.email);
    return {
      message: 'If the email exists, a password reset link has been sent',
    };
  }

  @Post('password-reset/reset')
  @HttpCode(200)
  @Throttle({ auth: { limit: 5, ttl: 60000 } })
  @ApiOperation({ summary: 'Reset password with token' })
  @ApiResponse({ status: 200, description: 'Password reset' })
  @ApiResponse({ status: 200, description: 'Invalid or expired token', schema: { properties: { success: { type: 'boolean' }, message: { type: 'string' } } } })
  async resetPassword(@Body(ValidationPipe) body: ResetPasswordDto) {
    const success = await this.recoveryService.resetPassword(
      body.token,
      body.password,
    );
    if (!success) {
      return { success: false, message: 'Invalid or expired token' };
    }
    return { success: true, message: 'Password reset successfully' };
  }
}
