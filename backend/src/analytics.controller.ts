import { Controller, Get, UseGuards } from '@nestjs/common';
import { AnalyticsService } from './analytics.service';
import { AdminAuthGuard } from './admin/admin-auth.guard';

@Controller('analytics')
export class AnalyticsController {
  constructor(private readonly analyticsService: AnalyticsService) {}

  @UseGuards(AdminAuthGuard)
  @Get('engagement')
  async getUserEngagementStats() {
    return this.analyticsService.getUserEngagementStats();
  }

  @UseGuards(AdminAuthGuard)
  @Get('contributions')
  async getContributionStats() {
    return this.analyticsService.getContributionStats();
  }

  @UseGuards(AdminAuthGuard)
  @Get('audio-seconds')
  async getAudioSecondsStats() {
    return this.analyticsService.getAudioSecondsStats();
  }
}
