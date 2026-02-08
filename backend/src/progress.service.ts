import { Injectable } from '@nestjs/common';
import { PrismaService } from './prisma/prisma.service';
import { CacheService } from './cache/cache.service';

@Injectable()
export class ProgressService {
  constructor(
    private prisma: PrismaService,
    private cache: CacheService,
  ) {}

  async markCompleted(
    userId: string,
    resourceType: string,
    resourceId: string,
    featureType: string,
  ): Promise<void> {
    // Store in database (persistent)
    await this.prisma.userProgress.upsert({
      where: {
        userId_resourceType_resourceId_featureType: {
          userId,
          resourceType,
          resourceId,
          featureType,
        },
      },
      create: {
        userId,
        resourceType,
        resourceId,
        featureType,
      },
      update: {},
    });

    // Also cache for quick lookup (session-based)
    const cacheKey = `progress:${userId}:${resourceType}:${resourceId}:${featureType}`;
    await this.cache.set(cacheKey, '1', 3600); // 1 hour TTL
  }

  async isCompleted(
    userId: string,
    resourceType: string,
    resourceId: string,
    featureType: string,
  ): Promise<boolean> {
    // Check cache first (faster)
    const cacheKey = `progress:${userId}:${resourceType}:${resourceId}:${featureType}`;
    const cached = await this.cache.get(cacheKey);
    if (cached) {
      return true;
    }

    // Check database
    const progress = await this.prisma.userProgress.findUnique({
      where: {
        userId_resourceType_resourceId_featureType: {
          userId,
          resourceType,
          resourceId,
          featureType,
        },
      },
    });

    if (progress) {
      // Cache it for future lookups
      await this.cache.set(cacheKey, '1', 3600);
      return true;
    }

    return false;
  }

  async getCompletedIds(
    userId: string,
    resourceType: string,
    featureType: string,
    resourceIds: string[],
  ): Promise<string[]> {
    const progressRecords = await this.prisma.userProgress.findMany({
      where: {
        userId,
        resourceType,
        featureType,
        resourceId: { in: resourceIds },
      },
      select: {
        resourceId: true,
      },
    });

    return progressRecords.map((p) => p.resourceId);
  }

  async excludeCompleted<T extends { id: string }>(
    userId: string,
    resourceType: string,
    featureType: string,
    items: T[],
  ): Promise<T[]> {
    if (items.length === 0) {
      return [];
    }

    const resourceIds = items.map((item) => item.id);
    const completedIds = await this.getCompletedIds(
      userId,
      resourceType,
      featureType,
      resourceIds,
    );

    const completedSet = new Set(completedIds);
    return items.filter((item) => !completedSet.has(item.id));
  }
}
