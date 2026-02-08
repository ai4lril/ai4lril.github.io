import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { LeaderboardService } from './leaderboard.service';
import { JwtAuthGuard } from './auth/jwt-auth.guard';

@Controller('gamification/leaderboard')
export class LeaderboardController {
  constructor(private readonly leaderboardService: LeaderboardService) {}

  @Get()
  async getLeaderboard(
    @Query('category') category?: string,
    @Query('language') languageCode?: string,
    @Query('limit') limit?: string,
    @Query('offset') offset?: string,
  ) {
    return this.leaderboardService.getLeaderboard(
      category || 'global',
      languageCode,
      limit ? parseInt(limit, 10) : 50,
      offset ? parseInt(offset, 10) : 0,
    );
  }

  @Get('my-rank')
  @UseGuards(JwtAuthGuard)
  getMyRank(
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    @Query('category') _category?: string,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    @Query('language') _languageCode?: string,
  ) {
    // This will need to be updated to get userId from request
    // For now, returning placeholder
    return { rank: null, message: 'User ID needed from request' };
  }
}
