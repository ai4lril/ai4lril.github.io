import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CacheService } from '../cache/cache.service';
import { Streak } from '@prisma/client';

@Injectable()
export class StreakService {
  private readonly logger = new Logger(StreakService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly cacheService: CacheService,
  ) {}

  async recordActivity(userId: string): Promise<void> {
    try {
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      const streak = await this.prisma.streak.findUnique({
        where: { userId },
      });

      if (!streak) {
        // Create new streak
        await this.prisma.streak.create({
          data: {
            userId,
            currentStreak: 1,
            longestStreak: 1,
            lastActivityDate: today,
            dailyProgress: 1,
          },
        });
        return;
      }

      const lastActivity = streak.lastActivityDate
        ? new Date(streak.lastActivityDate)
        : null;
      lastActivity?.setHours(0, 0, 0, 0);

      const daysDiff = lastActivity
        ? Math.floor(
            (today.getTime() - lastActivity.getTime()) / (1000 * 60 * 60 * 24),
          )
        : 999;

      let newCurrentStreak = streak.currentStreak;
      let newLongestStreak = streak.longestStreak;
      let newDailyProgress = streak.dailyProgress;

      if (daysDiff === 0) {
        // Same day - increment progress
        newDailyProgress = Math.min(streak.dailyProgress + 1, streak.dailyGoal);
      } else if (daysDiff === 1) {
        // Consecutive day - increment streak
        newCurrentStreak = streak.currentStreak + 1;
        newLongestStreak = Math.max(newCurrentStreak, streak.longestStreak);
        newDailyProgress = 1;
      } else {
        // Streak broken - reset
        newCurrentStreak = 1;
        newDailyProgress = 1;
      }

      await this.prisma.streak.update({
        where: { userId },
        data: {
          currentStreak: newCurrentStreak,
          longestStreak: newLongestStreak,
          lastActivityDate: today,
          dailyProgress: newDailyProgress,
        },
      });

      // Invalidate cache
      await this.cacheService.del(`streak:${userId}`);
    } catch (error) {
      this.logger.error(
        `Error recording activity for user ${userId}: ${error instanceof Error ? error.message : 'Unknown error'}`,
      );
      throw error;
    }
  }

  async getUserStreak(userId: string) {
    const cacheKey = `streak:${userId}`;
    const cached = await this.cacheService.get<Streak>(cacheKey);

    if (cached) {
      return cached;
    }

    let streak = await this.prisma.streak.findUnique({
      where: { userId },
    });

    if (!streak) {
      // Create default streak
      streak = await this.prisma.streak.create({
        data: {
          userId,
          currentStreak: 0,
          longestStreak: 0,
          dailyProgress: 0,
        },
      });
    }

    await this.cacheService.set(cacheKey, streak, 300); // 5 min TTL
    return streak;
  }

  async resetDailyProgress(): Promise<void> {
    // This should be called by a cron job daily
    await this.prisma.streak.updateMany({
      data: {
        dailyProgress: 0,
      },
    });

    this.logger.log('Daily progress reset for all users');
  }
}
