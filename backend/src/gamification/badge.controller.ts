import { Controller, Get, UseGuards, Request } from '@nestjs/common';
import { BadgeService } from './badge.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RequestUser } from '../common/request-user.types';

@Controller('gamification/badges')
@UseGuards(JwtAuthGuard)
export class BadgeController {
  constructor(private readonly badgeService: BadgeService) { }

  @Get()
  async getAllBadges() {
    return this.badgeService.getAllBadges();
  }

  @Get('my')
  async getMyBadges(@Request() req: { user: RequestUser }) {
    const userId = req.user.id;
    return this.badgeService.getUserBadges(userId);
  }
}
