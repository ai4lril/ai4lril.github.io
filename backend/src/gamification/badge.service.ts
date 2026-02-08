import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CacheService } from '../cache/cache.service';

@Injectable()
export class BadgeService {
  private readonly logger = new Logger(BadgeService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly cacheService: CacheService,
  ) {}

  async checkAndAwardBadges(
    userId: string,
    action: string,
    metadata?: Record<string, any>,
  ): Promise<string[]> {
    const awardedBadges: string[] = [];

    try {
      // Get all badges
      const badges = await this.prisma.badge.findMany();

      for (const badge of badges) {
        // Check if user already has this badge
        const hasBadge = await this.prisma.userBadge.findUnique({
          where: {
            userId_badgeId: {
              userId,
              badgeId: badge.id,
            },
          },
        });

        if (hasBadge) {
          continue;
        }

        // Check if badge criteria is met
        if (await this.checkBadgeCriteria(badge, userId, action, metadata)) {
          // Award badge
          await this.prisma.userBadge.create({
            data: {
              userId,
              badgeId: badge.id,
            },
          });

          // Award points
          const points = badge.criteria?.['points'] || 10;
          await this.awardPoints(userId, points);

          awardedBadges.push(badge.id);

          this.logger.log(`Badge ${badge.name} awarded to user ${userId}`);
        }
      }

      return awardedBadges;
    } catch (error) {
      this.logger.error(
        `Error checking badges for user ${userId}: ${error.message}`,
      );
      return awardedBadges;
    }
  }

  private async checkBadgeCriteria(
    badge: any,
    userId: string,
    action: string,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    _metadata?: Record<string, any>,
  ): Promise<boolean> {
    const { criteria } = badge;
    if (!criteria) {
      return false;
    }

    // Check action-based badges
    if (criteria.action === action) {
      if (criteria.count) {
        const userStats = await this.getUserStats(userId);
        const actionCount = userStats[`${action}Count`] || 0;
        return actionCount >= criteria.count;
      }
      return true;
    }

    // Check contribution-based badges
    if (criteria.type === 'contribution') {
      const userStats = await this.getUserStats(userId);
      if (criteria.minContributions) {
        return userStats.totalContributions >= criteria.minContributions;
      }
    }

    // Check streak-based badges
    if (criteria.type === 'streak') {
      const streak = await this.prisma.streak.findUnique({
        where: { userId },
      });
      if (criteria.minStreak && streak) {
        return streak.currentStreak >= criteria.minStreak;
      }
    }

    // Check points-based badges
    if (criteria.type === 'points') {
      const user = await this.prisma.user.findUnique({
        where: { id: userId },
        select: { points: true },
      });
      if (criteria.minPoints && user) {
        return user.points >= criteria.minPoints;
      }
    }

    return false;
  }

  private async getUserStats(userId: string): Promise<any> {
    const cacheKey = `user_stats:${userId}`;
    const cached = await this.cacheService.get<any>(cacheKey);

    if (cached) {
      return cached;
    }

    const stats = await this.prisma.userStats.findUnique({
      where: { userId },
    });

    const result = stats || {
      totalContributions: 0,
      totalValidations: 0,
      totalPoints: 0,
    };

    await this.cacheService.set(cacheKey, result, 300); // 5 min TTL
    return result;
  }

  private async awardPoints(userId: string, points: number): Promise<void> {
    await this.prisma.user.update({
      where: { id: userId },
      data: {
        points: {
          increment: points,
        },
      },
    });

    // Update user stats
    await this.prisma.userStats.upsert({
      where: { userId },
      create: {
        userId,
        totalPoints: points,
      },
      update: {
        totalPoints: {
          increment: points,
        },
      },
    });

    // Invalidate cache
    await this.cacheService.del(`user_stats:${userId}`);
  }

  async getUserBadges(userId: string) {
    return this.prisma.userBadge.findMany({
      where: { userId },
      include: {
        badge: true,
      },
      orderBy: {
        earnedAt: 'desc',
      },
    });
  }

  async getAllBadges() {
    return this.prisma.badge.findMany({
      orderBy: {
        category: 'asc',
      },
    });
  }
}
