import { Controller, Get, UseGuards, Request } from '@nestjs/common';
import { BadgeService } from './badge.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('gamification/badges')
@UseGuards(JwtAuthGuard)
export class BadgeController {
  constructor(private readonly badgeService: BadgeService) {}

  @Get()
  async getAllBadges() {
    return this.badgeService.getAllBadges();
  }

  @Get('my')
  async getMyBadges(@Request() req) {
    const userId = req.user.id;
    return this.badgeService.getUserBadges(userId);
  }
}
