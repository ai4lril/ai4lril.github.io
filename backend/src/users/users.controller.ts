import {
  Controller,
  Get,
  Put,
  Patch,
  Post,
  Body,
  UseGuards,
  Request,
} from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { UsersService } from './users.service';
import { VerificationService } from '../verification.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

interface RequestWithUser {
  user: {
    id: string;
    email?: string;
    username?: string;
    display_name?: string;
    first_name?: string;
    last_name?: string;
  };
}

@ApiTags('users')
@Controller('users')
export class UsersController {
  constructor(
    private readonly usersService: UsersService,
    private readonly verificationService: VerificationService,
  ) { }

  @UseGuards(JwtAuthGuard)
  @Get('profile')
  async getProfile(@Request() req: RequestWithUser) {
    return this.usersService.getProfile(req.user.id);
  }

  @UseGuards(JwtAuthGuard)
  @Put('profile')
  async updateProfile(
    @Body()
    updateData: {
      occupation?: string;
      education?: string;
      birthplace_village_city?: string;
      birthplace_pincode?: string;
      current_residence_village_city?: string;
      current_residence_pincode?: string;
      workplace_college_village_city?: string;
      workplace_college_pincode?: string;
      phone_number?: string;
    },
    @Request() req: RequestWithUser,
  ) {
    return this.usersService.updateProfile(req.user.id, updateData);
  }

  @Post('verification/send')
  @UseGuards(JwtAuthGuard)
  async sendVerificationEmail(@Request() req: RequestWithUser) {
    await this.verificationService.sendVerificationEmail(req.user.id);
    return { message: 'Verification email sent' };
  }

  @Post('verification/verify')
  async verifyEmail(@Body() body: { token: string }) {
    const success = await this.verificationService.verifyEmail(body.token);
    if (!success) {
      return { success: false, message: 'Invalid or expired token' };
    }
    return { success: true, message: 'Email verified successfully' };
  }

  @Get('verification/status')
  @UseGuards(JwtAuthGuard)
  async getVerificationStatus(@Request() req: RequestWithUser) {
    const isVerified =
      await this.verificationService.checkVerificationStatus(req.user.id);
    return { isVerified };
  }

  @Patch('me/onboarding-complete')
  @UseGuards(JwtAuthGuard)
  async completeOnboarding(@Request() req: RequestWithUser) {
    return this.usersService.completeOnboarding(req.user.id);
  }
}
