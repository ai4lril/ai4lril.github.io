import { Test, TestingModule } from '@nestjs/testing';
import { ProgressService } from '../progress/progress.service';
import { PrismaService } from '../prisma/prisma.service';
import { CacheService } from '../cache/cache.service';
import { CacheInvalidationService } from '../cache/cache-invalidation.service';

const mockPrisma = {
  userProgress: {
    upsert: jest.fn().mockResolvedValue({}),
    findUnique: jest.fn(),
    findMany: jest.fn(),
  },
};

const mockCache = {
  get: jest.fn(),
  set: jest.fn().mockResolvedValue(undefined),
};

const mockCacheInvalidation = {
  invalidateUserProgress: jest.fn().mockResolvedValue(undefined),
};

describe('ProgressService', () => {
  let service: ProgressService;

  beforeEach(async () => {
    jest.clearAllMocks();
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ProgressService,
        { provide: PrismaService, useValue: mockPrisma },
        { provide: CacheService, useValue: mockCache },
        { provide: CacheInvalidationService, useValue: mockCacheInvalidation },
      ],
    }).compile();

    service = module.get<ProgressService>(ProgressService);
  });

  describe('markCompleted', () => {
    it('should upsert progress and cache', async () => {
      await service.markCompleted('user-1', 'sentence', 's1', 'speak');

      expect(mockPrisma.userProgress.upsert).toHaveBeenCalledWith({
        where: {
          userId_resourceType_resourceId_featureType: {
            userId: 'user-1',
            resourceType: 'sentence',
            resourceId: 's1',
            featureType: 'speak',
          },
        },
        create: {
          userId: 'user-1',
          resourceType: 'sentence',
          resourceId: 's1',
          featureType: 'speak',
        },
        update: {},
      });
      expect(mockCache.set).toHaveBeenCalledWith(
        'progress:user-1:sentence:s1:speak',
        '1',
        3600,
      );
      expect(mockCacheInvalidation.invalidateUserProgress).toHaveBeenCalledWith(
        'user-1',
        'sentence',
        'speak',
      );
    });
  });

  describe('isCompleted', () => {
    it('should return true when cached', async () => {
      mockCache.get.mockResolvedValue('1');

      const result = await service.isCompleted('user-1', 'sentence', 's1', 'speak');

      expect(result).toBe(true);
      expect(mockPrisma.userProgress.findUnique).not.toHaveBeenCalled();
    });

    it('should return true when found in database', async () => {
      mockCache.get.mockResolvedValue(null);
      mockPrisma.userProgress.findUnique.mockResolvedValue({
        userId: 'user-1',
        resourceType: 'sentence',
        resourceId: 's1',
        featureType: 'speak',
      });

      const result = await service.isCompleted('user-1', 'sentence', 's1', 'speak');

      expect(result).toBe(true);
      expect(mockCache.set).toHaveBeenCalledWith(
        'progress:user-1:sentence:s1:speak',
        '1',
        3600,
      );
    });

    it('should return false when not completed', async () => {
      mockCache.get.mockResolvedValue(null);
      mockPrisma.userProgress.findUnique.mockResolvedValue(null);

      const result = await service.isCompleted('user-1', 'sentence', 's1', 'speak');

      expect(result).toBe(false);
    });
  });
});
