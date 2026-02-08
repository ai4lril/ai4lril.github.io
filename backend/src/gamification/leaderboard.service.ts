import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CacheService } from '../cache/cache.service';

@Injectable()
export class LeaderboardService {
  private readonly logger = new Logger(LeaderboardService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly cacheService: CacheService,
  ) {}

  async updateLeaderboard(
    category: string,
    languageCode?: string,
    periodStart?: Date,
    periodEnd?: Date,
  ): Promise<void> {
    try {
      const cacheKey = `leaderboard:${category}:${languageCode || 'global'}`;

      // Get top users by points
      const users = await this.prisma.user.findMany({
        where: languageCode
          ? {
              userStats: {
                languagesContributed: {
                  has: languageCode,
                },
              },
            }
          : {},
        select: {
          id: true,
          display_name: true,
          username: true,
          points: true,
          profile_picture_url: true,
          userStats: true,
        },
        orderBy: {
          points: 'desc',
        },
        take: 100,
      });

      // Update leaderboard entries
      const periodStartDate = periodStart || new Date();
      const periodEndDate = periodEnd || new Date();

      for (let i = 0; i < users.length; i++) {
        await this.prisma.leaderboard.upsert({
          where: {
            userId_category_languageCode_periodStart: languageCode
              ? {
                  userId: users[i].id,
                  category,
                  languageCode,
                  periodStart: periodStartDate,
                }
              : ({
                  userId: users[i].id,
                  category,
                  languageCode: null,
                  periodStart: periodStartDate,
                } as any),
          },
          create: {
            userId: users[i].id,
            category,
            languageCode: languageCode ?? null,
            points: users[i].points,
            rank: i + 1,
            periodStart: periodStartDate,
            periodEnd: periodEndDate,
          },
          update: {
            points: users[i].points,
            rank: i + 1,
            periodEnd: periodEndDate,
          },
        });
      }

      // Cache leaderboard
      await this.cacheService.set(cacheKey, users.slice(0, 50), 3600); // 1 hour TTL

      this.logger.log(
        `Leaderboard updated for category ${category}, language ${languageCode || 'global'}`,
      );
    } catch (error) {
      this.logger.error(`Error updating leaderboard: ${error.message}`);
      throw error;
    }
  }

  async getLeaderboard(
    category: string = 'global',
    languageCode?: string,
    limit: number = 50,
    offset: number = 0,
  ) {
    const cacheKey = `leaderboard:${category}:${languageCode || 'global'}`;
    const cached = await this.cacheService.get<any[]>(cacheKey);

    if (cached && offset === 0) {
      return cached.slice(0, limit);
    }

    const leaderboard = await this.prisma.leaderboard.findMany({
      where: {
        category,
        languageCode: languageCode ?? null,
      },
      orderBy: {
        rank: 'asc',
      },
      take: limit,
      skip: offset,
    });

    // Fetch user data separately
    const userIds = leaderboard.map((entry) => entry.userId);
    const users = await this.prisma.user.findMany({
      where: { id: { in: userIds } },
      select: {
        id: true,
        display_name: true,
        username: true,
        profile_picture_url: true,
        points: true,
      },
    });

    const userMap = new Map(users.map((u) => [u.id, u]));
    return leaderboard.map((entry) => ({
      ...entry,
      user: userMap.get(entry.userId),
    }));
  }

  async getUserRank(
    userId: string,
    category: string = 'global',
    languageCode?: string,
  ): Promise<number | null> {
    const entry = await this.prisma.leaderboard.findFirst({
      where: {
        userId,
        category,
        languageCode: languageCode ?? null,
      },
      select: {
        rank: true,
      },
    });

    return entry?.rank || null;
  }
}
