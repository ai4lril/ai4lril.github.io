import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CacheService } from '../cache/cache.service';
import { CacheInvalidationService } from '../cache/cache-invalidation.service';

@Injectable()
export class ProgressService {
  constructor(
    private prisma: PrismaService,
    private cache: CacheService,
    private cacheInvalidation: CacheInvalidationService,
  ) { }

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

    // Invalidate related progress caches (completed_ids caches)
    await this.cacheInvalidation.invalidateUserProgress(
      userId,
      resourceType,
      featureType,
    );
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
    // Generate cache key from sorted resource IDs for consistency
    const resourceIdsKey = resourceIds.sort().join(',');
    const cacheKey = `progress:completed_ids:${userId}:${resourceType}:${featureType}:${resourceIdsKey}`;

    // Check cache first
    const cached = await this.cache.get<string[]>(cacheKey);
    if (cached) {
      return cached;
    }

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

    const completedIds = progressRecords.map((p) => p.resourceId);

    // Cache for 5 minutes
    await this.cache.set(cacheKey, completedIds, 300);
    return completedIds;
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
