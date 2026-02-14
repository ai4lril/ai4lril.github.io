import { Test, TestingModule } from '@nestjs/testing';
import { CacheService } from './cache.service';

const mockRedisClient = {
  get: jest.fn(),
  set: jest.fn(),
  setEx: jest.fn(),
  del: jest.fn(),
  exists: jest.fn(),
  dbSize: jest.fn(),
  info: jest.fn(),
  connect: jest.fn().mockResolvedValue(undefined),
  disconnect: jest.fn().mockResolvedValue(undefined),
  on: jest.fn(),
  scanIterator: jest.fn(),
};

jest.mock('redis', () => ({
  createClient: () => mockRedisClient,
}));

describe('CacheService', () => {
  let service: CacheService;

  beforeEach(async () => {
    jest.clearAllMocks();
    mockRedisClient.connect.mockResolvedValue(undefined);
    mockRedisClient.dbSize.mockResolvedValue(0);
    mockRedisClient.info.mockResolvedValue('used_memory:1024\nused_memory_peak:2048');

    const module: TestingModule = await Test.createTestingModule({
      providers: [CacheService],
    }).compile();

    service = module.get<CacheService>(CacheService);
    await service.onModuleInit();
  });

  afterEach(async () => {
    await service.onModuleDestroy();
  });

  describe('get', () => {
    it('should return parsed value on hit', async () => {
      mockRedisClient.get.mockResolvedValue(JSON.stringify({ foo: 'bar' }));

      const result = await service.get<{ foo: string }>('test-key');

      expect(result).toEqual({ foo: 'bar' });
      expect(mockRedisClient.get).toHaveBeenCalledWith('test-key');
    });

    it('should return null on miss', async () => {
      mockRedisClient.get.mockResolvedValue(null);

      const result = await service.get('test-key');

      expect(result).toBeNull();
    });

    it('should return null and log error on Redis error', async () => {
      mockRedisClient.get.mockRejectedValue(new Error('Redis error'));

      const result = await service.get('test-key');

      expect(result).toBeNull();
    });
  });

  describe('set', () => {
    it('should set value without TTL', async () => {
      mockRedisClient.set.mockResolvedValue('OK');

      await service.set('key', { data: 1 });

      expect(mockRedisClient.set).toHaveBeenCalledWith(
        'key',
        JSON.stringify({ data: 1 }),
      );
      expect(mockRedisClient.setEx).not.toHaveBeenCalled();
    });

    it('should set value with TTL', async () => {
      mockRedisClient.setEx.mockResolvedValue('OK');

      await service.set('key', { data: 1 }, 300);

      expect(mockRedisClient.setEx).toHaveBeenCalledWith(
        'key',
        300,
        JSON.stringify({ data: 1 }),
      );
    });
  });

  describe('del', () => {
    it('should delete key', async () => {
      mockRedisClient.del.mockResolvedValue(1);

      await service.del('key');

      expect(mockRedisClient.del).toHaveBeenCalledWith('key');
    });
  });

  describe('delPattern', () => {
    it('should delete keys matching pattern', async () => {
      async function* asyncGen() {
        yield 'key1';
        yield 'key2';
      }
      mockRedisClient.scanIterator.mockReturnValue(asyncGen());
      mockRedisClient.del.mockResolvedValue(1);

      const count = await service.delPattern('key:*');

      expect(count).toBe(2);
    });

    it('should return 0 on error', async () => {
      mockRedisClient.scanIterator.mockImplementation(() => {
        throw new Error('Scan error');
      });

      const count = await service.delPattern('key:*');

      expect(count).toBe(0);
    });
  });

  describe('exists', () => {
    it('should return true when key exists', async () => {
      mockRedisClient.exists.mockResolvedValue(1);

      const result = await service.exists('key');

      expect(result).toBe(true);
    });

    it('should return false when key does not exist', async () => {
      mockRedisClient.exists.mockResolvedValue(0);

      const result = await service.exists('key');

      expect(result).toBe(false);
    });
  });

  describe('generateCacheKey', () => {
    it('should generate consistent key from params', () => {
      const key1 = service.generateCacheKey('endpoint', { a: 1, b: 2 });
      const key2 = service.generateCacheKey('endpoint', { b: 2, a: 1 });

      expect(key1).toBe(key2);
      expect(key1).toContain('endpoint');
    });

    it('should sanitize special characters', () => {
      const key = service.generateCacheKey('ep', { lang: 'eng_Latn' });

      expect(key).not.toContain(':');
    });
  });

  describe('getStats', () => {
    it('should return cache statistics', async () => {
      mockRedisClient.get.mockResolvedValueOnce('{}');
      mockRedisClient.get.mockResolvedValueOnce(null);
      await service.get('h1');
      await service.get('m1');

      const stats = await service.getStats();

      expect(stats.hits).toBe(1);
      expect(stats.misses).toBe(1);
      expect(stats.hitRate).toBe(50);
      expect(stats.totalKeys).toBe(0);
    });
  });

  describe('getPrometheusMetrics', () => {
    it('should return Prometheus format metrics', async () => {
      const metrics = await service.getPrometheusMetrics();

      expect(metrics).toContain('cache_hits_total');
      expect(metrics).toContain('cache_misses_total');
      expect(metrics).toContain('cache_hit_rate');
    });
  });

  describe('resetStats', () => {
    it('should reset counters', async () => {
      mockRedisClient.get.mockResolvedValue('{}');
      await service.get('key');
      service.resetStats();
      const stats = await service.getStats();

      expect(stats.hits).toBe(0);
      expect(stats.misses).toBe(0);
    });
  });
});
