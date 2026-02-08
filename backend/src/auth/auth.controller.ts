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
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { FastifyReply } from 'fastify';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { SignupDto } from './dto/signup.dto';
import { RefreshTokenDto } from './dto/refresh-token.dto';
import { LinkOAuthDto, UnlinkOAuthDto } from './dto/link-oauth.dto';
import { JwtAuthGuard } from './jwt-auth.guard';
import { OAuthUser } from './auth.service';

interface RequestWithUser {
  user: {
    id?: string;
    googleId?: string;
    githubId?: string;
    email: string;
    firstName?: string;
    lastName?: string;
    displayName?: string;
    username?: string;
    picture?: string;
    accessToken?: string;
  };
}

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('signup')
  async signup(@Body(ValidationPipe) signupDto: SignupDto) {
    return this.authService.signup(signupDto);
  }

  @Post('login')
  @HttpCode(200)
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
      const result = await this.authService.googleLogin(user);
      const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5577';
      const redirectUrl = `${frontendUrl}/auth/callback?token=${result.token}&refreshToken=${result.refreshToken}&provider=google`;
      return res.redirect(redirectUrl);
    } catch {
      // Log error but don't expose details to user
      const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5577';
      return res.redirect(`${frontendUrl}/login?error=oauth_failed`);
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
      };
      const result = await this.authService.githubLogin(user);
      const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5577';
      const redirectUrl = `${frontendUrl}/auth/callback?token=${result.token}&refreshToken=${result.refreshToken}&provider=github`;
      return res.redirect(redirectUrl);
    } catch {
      // Log error but don't expose details to user
      const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5577';
      return res.redirect(`${frontendUrl}/login?error=oauth_failed`);
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
}
