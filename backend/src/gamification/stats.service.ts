import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CacheService } from '../cache/cache.service';

@Injectable()
export class StatsService {
  private readonly logger = new Logger(StatsService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly cacheService: CacheService,
  ) {}

  async updateUserStats(
    userId: string,
    type: string,
    metadata?: Record<string, any>,
  ): Promise<void> {
    try {
      const stats = await this.prisma.userStats.findUnique({
        where: { userId },
      });

      const updateData: any = {};

      switch (type) {
        case 'contribution':
          updateData.totalContributions = { increment: 1 };
          if (metadata?.language) {
            // Add language to languagesContributed array if not already present
            const currentLanguages = stats?.languagesContributed || [];
            if (!currentLanguages.includes(metadata.language)) {
              updateData.languagesContributed = {
                push: metadata.language,
              };
            }
          }
          break;
        case 'validation':
          updateData.totalValidations = { increment: 1 };
          break;
        case 'audio':
          if (metadata?.duration) {
            updateData.audioSeconds = { increment: metadata.duration };
          }
          break;
      }

      await this.prisma.userStats.upsert({
        where: { userId },
        create: {
          userId,
          totalContributions: type === 'contribution' ? 1 : 0,
          totalValidations: type === 'validation' ? 1 : 0,
          audioSeconds:
            type === 'audio' && metadata?.duration ? metadata.duration : 0,
          languagesContributed: metadata?.language ? [metadata.language] : [],
        },
        update: updateData,
      });

      // Update user level based on points
      await this.updateUserLevel(userId);

      // Invalidate cache
      await this.cacheService.del(`user_stats:${userId}`);
    } catch (error) {
      this.logger.error(
        `Error updating stats for user ${userId}: ${error.message}`,
      );
      throw error;
    }
  }

  private async updateUserLevel(userId: string): Promise<void> {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { points: true, level: true },
    });

    if (!user) {
      return;
    }

    // Calculate level based on points (exponential growth)
    // Level 1: 0-99 points
    // Level 2: 100-299 points
    // Level 3: 300-599 points
    // etc.
    const newLevel = Math.floor(Math.sqrt(user.points / 100)) + 1;

    if (newLevel !== user.level) {
      await this.prisma.user.update({
        where: { id: userId },
        data: { level: newLevel },
      });

      // Update tier based on level
      let tier = 'bronze';
      if (newLevel >= 20) {
        tier = 'platinum';
      } else if (newLevel >= 10) {
        tier = 'gold';
      } else if (newLevel >= 5) {
        tier = 'silver';
      }

      await this.prisma.user.update({
        where: { id: userId },
        data: { tier },
      });
    }
  }

  async getUserStats(userId: string) {
    const cacheKey = `user_stats:${userId}`;
    const cached = await this.cacheService.get<any>(cacheKey);

    if (cached) {
      return cached;
    }

    const stats = await this.prisma.userStats.findUnique({
      where: { userId },
    });

    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: {
        points: true,
        level: true,
        tier: true,
      },
    });

    const result = {
      ...stats,
      points: user?.points || 0,
      level: user?.level || 1,
      tier: user?.tier || 'bronze',
    };

    await this.cacheService.set(cacheKey, result, 300); // 5 min TTL
    return result;
  }
}
