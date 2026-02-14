import { Injectable, OnModuleInit, OnModuleDestroy, Logger } from '@nestjs/common';
import { createClient, RedisClientType } from 'redis';
import { gzipSync, gunzipSync } from 'zlib';

interface L1Entry {
  value: unknown;
  expiresAt: number;
}

@Injectable()
export class CacheService implements OnModuleInit, OnModuleDestroy {
  private client: RedisClientType;
  private l1Cache = new Map<string, L1Entry>();
  private l1Keys: string[] = [];
  private readonly l1MaxSize: number;
  private readonly l1TtlMs: number;
  private readonly compressionThreshold: number;
  private compressedBytesSaved = 0;
  private readonly logger = new Logger(CacheService.name);

  private static readonly COMPRESSED_PREFIX = 'C:';

  // Statistics tracking
  private hits = 0;
  private misses = 0;
  private l1Hits = 0;
  private l1Misses = 0;
  private sets = 0;
  private deletes = 0;
  private errors = 0;

  constructor() {
    this.l1MaxSize = parseInt(process.env.CACHE_L1_MAX_SIZE || '1000', 10);
    this.l1TtlMs = parseInt(process.env.CACHE_L1_TTL_SECONDS || '60', 10) * 1000;
    this.compressionThreshold = parseInt(
      process.env.CACHE_COMPRESSION_THRESHOLD || '1024',
      10,
    );
  }

  private l1EvictIfNeeded(): void {
    const now = Date.now();
    while (this.l1Keys.length >= this.l1MaxSize && this.l1Keys.length > 0) {
      const oldest = this.l1Keys.shift();
      if (oldest) this.l1Cache.delete(oldest);
    }
    for (const key of this.l1Cache.keys()) {
      const entry = this.l1Cache.get(key);
      if (entry && entry.expiresAt < now) {
        this.l1Cache.delete(key);
        this.l1Keys = this.l1Keys.filter((k) => k !== key);
      }
    }
  }

  async onModuleInit() {
    this.client = createClient({
      url: process.env.CACHE_URL || 'redis://dragonfly:6379',
    });

    this.client.on('error', (err) => {
      console.error('Redis Client Error', err);
    });

    try {
      await this.client.connect();
      console.log('Connected to Dragonfly cache server');
    } catch (error) {
      console.error('Failed to connect to Dragonfly:', error);
    }
  }

  async onModuleDestroy() {
    if (this.client) {
      await this.client.disconnect();
    }
  }

  async get<T>(key: string): Promise<T | null> {
    try {
      this.l1EvictIfNeeded();
      const l1Entry = this.l1Cache.get(key);
      if (l1Entry && l1Entry.expiresAt >= Date.now()) {
        this.l1Hits++;
        this.hits++;
        return l1Entry.value as T;
      }
      if (l1Entry) {
        this.l1Cache.delete(key);
        this.l1Keys = this.l1Keys.filter((k) => k !== key);
      }
      this.l1Misses++;

      const data = await this.client.get(key);
      if (data) {
        this.hits++;
        const decompressed = this.decompressIfNeeded(data);
        const parsed = JSON.parse(decompressed) as T;
        this.l1Cache.set(key, { value: parsed, expiresAt: Date.now() + this.l1TtlMs });
        this.l1Keys.push(key);
        return parsed;
      } else {
        this.misses++;
        return null;
      }
    } catch (error) {
      this.errors++;
      this.logger.error('Cache get error:', error);
      return null;
    }
  }

  async set<T>(key: string, value: T, ttlSeconds?: number): Promise<void> {
    try {
      const ttlMs = ttlSeconds ? ttlSeconds * 1000 : this.l1TtlMs;
      this.l1Cache.set(key, { value, expiresAt: Date.now() + ttlMs });
      this.l1Keys.push(key);
      this.l1EvictIfNeeded();
      const serializedValue = JSON.stringify(value);
      const toStore = this.compressIfNeeded(serializedValue);
      if (ttlSeconds) {
        await this.client.setEx(key, ttlSeconds, toStore);
      } else {
        await this.client.set(key, toStore);
      }
      this.sets++;
    } catch (error) {
      this.errors++;
      this.logger.error('Cache set error:', error);
    }
  }

  async del(key: string): Promise<void> {
    try {
      this.l1Cache.delete(key);
      this.l1Keys = this.l1Keys.filter((k) => k !== key);
      await this.client.del(key);
      this.deletes++;
    } catch (error) {
      this.errors++;
      this.logger.error('Cache del error:', error);
    }
  }

  /**
   * Delete all keys matching a pattern using SCAN iterator
   * This is the correct way to delete wildcard patterns in Redis
   *
   * @param pattern - Pattern to match (e.g., 'faqs:*')
   * @returns Number of keys deleted
   */
  async delPattern(pattern: string): Promise<number> {
    try {
      const regex = this.patternToRegex(pattern);
      for (const key of [...this.l1Cache.keys()]) {
        if (regex.test(key)) {
          this.l1Cache.delete(key);
          this.l1Keys = this.l1Keys.filter((k) => k !== key);
        }
      }

      const stream = this.client.scanIterator({ MATCH: pattern });
      const keys: string[] = [];
      let deletedCount = 0;

      for await (const key of stream) {
        keys.push(String(key));
        if (keys.length >= 1000) {
          const deletePromises = keys.map(k => this.client.del(k));
          const results = await Promise.all(deletePromises);
          deletedCount += results.reduce((sum, count) => sum + count, 0);
          keys.length = 0;
        }
      }

      if (keys.length > 0) {
        const deletePromises = keys.map(k => this.client.del(k));
        const results = await Promise.all(deletePromises);
        deletedCount += results.reduce((sum, count) => sum + count, 0);
      }

      return deletedCount;
    } catch (error) {
      console.error('Cache delPattern error:', error);
      return 0;
    }
  }

  private compressIfNeeded(data: string): string {
    if (Buffer.byteLength(data, 'utf8') < this.compressionThreshold) {
      return data;
    }
    const compressed = gzipSync(Buffer.from(data, 'utf8'));
    this.compressedBytesSaved += data.length - compressed.length;
    return CacheService.COMPRESSED_PREFIX + compressed.toString('base64');
  }

  private decompressIfNeeded(data: string): string {
    if (!data.startsWith(CacheService.COMPRESSED_PREFIX)) {
      return data;
    }
    const base64 = data.slice(CacheService.COMPRESSED_PREFIX.length);
    return gunzipSync(Buffer.from(base64, 'base64')).toString('utf8');
  }

  private patternToRegex(pattern: string): RegExp {
    const regexStr = pattern
      .split('*')
      .map((s) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'))
      .join('.*');
    return new RegExp(`^${regexStr}$`);
  }

  async exists(key: string): Promise<boolean> {
    try {
      const result = await this.client.exists(key);
      return result === 1;
    } catch (error) {
      console.error('Cache exists error:', error);
      return false;
    }
  }

  generateCacheKey(endpoint: string, params: Record<string, any>): string {
    const sortedParams = Object.keys(params)
      .sort()
      .map((key) => `${key}:${params[key]}`)
      .join('_');

    return `${endpoint}_${sortedParams}`.replace(/[^a-zA-Z0-9_]/g, '_');
  }

  /**
   * Get cache statistics
   */
  async getStats(): Promise<{
    hits: number;
    misses: number;
    l1Hits: number;
    l1Misses: number;
    l1HitRate: number;
    sets: number;
    deletes: number;
    errors: number;
    hitRate: number;
    totalKeys: number;
    memoryUsage?: {
      used: number;
      peak: number;
    };
  }> {
    const totalRequests = this.hits + this.misses;
    const hitRate = totalRequests > 0 ? (this.hits / totalRequests) * 100 : 0;
    const l1Total = this.l1Hits + this.l1Misses;
    const l1HitRate = l1Total > 0 ? (this.l1Hits / l1Total) * 100 : 0;

    let totalKeys = 0;
    let memoryUsage: { used: number; peak: number } | undefined;

    try {
      // Get total number of keys
      const dbSize = await this.client.dbSize();
      totalKeys = dbSize;

      // Get memory usage (Dragonfly/Redis INFO command)
      try {
        const info = await this.client.info('memory');
        const usedMatch = info.match(/used_memory:(\d+)/);
        const peakMatch = info.match(/used_memory_peak:(\d+)/);

        if (usedMatch && peakMatch) {
          memoryUsage = {
            used: parseInt(usedMatch[1], 10),
            peak: parseInt(peakMatch[1], 10),
          };
        }
      } catch (error) {
        // Memory info might not be available, skip it
        this.logger.debug('Could not fetch memory usage:', error);
      }
    } catch (error) {
      this.logger.warn('Failed to get cache stats:', error);
    }

    return {
      hits: this.hits,
      misses: this.misses,
      l1Hits: this.l1Hits,
      l1Misses: this.l1Misses,
      l1HitRate: Math.round(l1HitRate * 100) / 100,
      sets: this.sets,
      deletes: this.deletes,
      errors: this.errors,
      hitRate: Math.round(hitRate * 100) / 100,
      totalKeys,
      memoryUsage,
    };
  }

  /**
   * Get Prometheus metrics for cache
   */
  async getPrometheusMetrics(): Promise<string> {
    const stats = await this.getStats();

    let metrics = `# Cache Metrics
# TYPE cache_hits_total counter
cache_hits_total ${stats.hits}

# TYPE cache_misses_total counter
cache_misses_total ${stats.misses}

# TYPE cache_l1_hits_total counter
cache_l1_hits_total ${stats.l1Hits}

# TYPE cache_l1_misses_total counter
cache_l1_misses_total ${stats.l1Misses}

# TYPE cache_l1_hit_rate gauge
cache_l1_hit_rate ${stats.l1HitRate}

# TYPE cache_sets_total counter
cache_sets_total ${stats.sets}

# TYPE cache_deletes_total counter
cache_deletes_total ${stats.deletes}

# TYPE cache_errors_total counter
cache_errors_total ${stats.errors}

# TYPE cache_hit_rate gauge
cache_hit_rate ${stats.hitRate}

# TYPE cache_keys_total gauge
cache_keys_total ${stats.totalKeys}
`;

    if (stats.memoryUsage) {
      metrics += `# TYPE cache_memory_used_bytes gauge
cache_memory_used_bytes ${stats.memoryUsage.used}

# TYPE cache_memory_peak_bytes gauge
cache_memory_peak_bytes ${stats.memoryUsage.peak}
`;
    }
    metrics += `# TYPE cache_compressed_bytes_saved gauge
cache_compressed_bytes_saved ${this.compressedBytesSaved}
`;

    return metrics;
  }

  /**
   * Reset statistics (useful for testing or periodic resets)
   */
  resetStats(): void {
    this.hits = 0;
    this.misses = 0;
    this.l1Hits = 0;
    this.l1Misses = 0;
    this.compressedBytesSaved = 0;
    this.sets = 0;
    this.deletes = 0;
    this.errors = 0;
    this.logger.log('Cache statistics reset');
  }
}
