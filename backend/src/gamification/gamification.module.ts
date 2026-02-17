import { Module } from '@nestjs/common';
import { BadgeService } from './badge.service';
import { BadgeController } from './badge.controller';
import { LeaderboardService } from './leaderboard.service';
import { LeaderboardController } from './leaderboard.controller';
import { StreakService } from './streak.service';
import { StatsService } from './stats.service';
import { StatsController } from './stats.controller';
import { PrismaModule } from '../prisma/prisma.module';
import { CacheModule } from '../cache/cache.module';
import { LoggerModule } from '../logger/logger.module';

@Module({
  imports: [PrismaModule, CacheModule, LoggerModule],
  providers: [BadgeService, LeaderboardService, StreakService, StatsService],
  controllers: [BadgeController, LeaderboardController, StatsController],
  exports: [BadgeService, LeaderboardService, StreakService, StatsService],
})
export class GamificationModule { }
