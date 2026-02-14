import { Injectable, Logger } from '@nestjs/common';
import { CacheService } from './cache.service';

/**
 * Service for managing cache invalidation strategies
 * Provides methods to invalidate related caches when data changes
 */
@Injectable()
export class CacheInvalidationService {
  private readonly logger = new Logger(CacheInvalidationService.name);

  constructor(private readonly cacheService: CacheService) { }

  /**
   * Invalidate caches related to a speech recording
   */
  async invalidateSpeechRecording(
    sentenceId: string,
    languageCode?: string,
    userId?: string,
  ): Promise<void> {
    const patterns: string[] = [
      `recordings:validation:*`, // All validation caches
      `progress:completed_ids:*`, // All progress caches
      `search:*`, // All search results
    ];

    // Language-specific caches
    if (languageCode) {
      patterns.push(`recordings:validation:${languageCode}:*`);
      patterns.push(`recordings:validation:*:${languageCode}:*`);
    }

    // User-specific caches
    if (userId) {
      patterns.push(`progress:completed_ids:${userId}:*`);
      patterns.push(`recordings:validation:*:${userId}`);
    }

    await this.invalidatePatterns(patterns);
  }

  /**
   * Invalidate caches related to a question answer
   */
  async invalidateQuestionAnswer(
    questionSubmissionId: string,
    userId?: string,
  ): Promise<void> {
    const patterns: string[] = [
      `progress:completed_ids:*`, // All progress caches
    ];

    // User-specific progress cache
    if (userId) {
      patterns.push(`progress:completed_ids:${userId}:*`);
    }

    await this.invalidatePatterns(patterns);
  }

  /**
   * Invalidate caches related to audio blog
   */
  async invalidateAudioBlog(languageCode: string, blogId?: string): Promise<void> {
    const patterns: string[] = [
      `audio_blogs:${languageCode}*`, // All audio blog caches for this language
      `audio_blogs:*`, // All audio blog caches (if language not specific)
    ];

    // Specific blog cache
    if (blogId) {
      patterns.push(`audio_blog:${blogId}`);
    }

    await this.invalidatePatterns(patterns);
  }

  /**
   * Invalidate caches related to video blog
   */
  async invalidateVideoBlog(languageCode: string, blogId?: string): Promise<void> {
    const patterns: string[] = [
      `video_blogs:${languageCode}*`, // All video blog caches for this language
      `video_blogs:*`, // All video blog caches (if language not specific)
    ];

    // Specific blog cache
    if (blogId) {
      patterns.push(`video_blog:${blogId}`);
    }

    await this.invalidatePatterns(patterns);
  }

  /**
   * Invalidate user progress caches
   */
  async invalidateUserProgress(
    userId: string,
    resourceType?: string,
    featureType?: string,
  ): Promise<void> {
    const patterns: string[] = [];

    if (resourceType && featureType) {
      patterns.push(`progress:completed_ids:${userId}:${resourceType}:${featureType}:*`);
    } else if (resourceType) {
      patterns.push(`progress:completed_ids:${userId}:${resourceType}:*`);
    } else {
      patterns.push(`progress:completed_ids:${userId}:*`);
    }

    await this.invalidatePatterns(patterns);
  }

  /**
   * Invalidate search caches
   */
  async invalidateSearch(query?: string): Promise<void> {
    const patterns: string[] = ['search:*'];

    if (query) {
      // Try to invalidate specific query cache
      // Note: This is approximate since cache keys include other params
      patterns.push(`search:${query}:*`);
    }

    await this.invalidatePatterns(patterns);
  }

  /**
   * Invalidate caches related to sentence creation/update
   */
  async invalidateSentence(
    sentenceId: string,
    languageCode?: string,
  ): Promise<void> {
    const patterns: string[] = [
      `recordings:validation:*`, // All validation caches
      `search:*`, // All search results
    ];

    // Language-specific caches
    if (languageCode) {
      patterns.push(`recordings:validation:${languageCode}:*`);
      patterns.push(`recordings:validation:*:${languageCode}:*`);
    }

    await this.invalidatePatterns(patterns);
  }

  /**
   * Invalidate all caches matching given patterns
   */
  private async invalidatePatterns(patterns: string[]): Promise<void> {
    const uniquePatterns = [...new Set(patterns)];
    let totalDeleted = 0;

    for (const pattern of uniquePatterns) {
      try {
        const deleted = await this.cacheService.delPattern(pattern);
        totalDeleted += deleted;
        if (deleted > 0) {
          this.logger.debug(`Invalidated ${deleted} cache keys matching pattern: ${pattern}`);
        }
      } catch (error) {
        this.logger.warn(`Failed to invalidate cache pattern ${pattern}:`, error);
      }
    }

    if (totalDeleted > 0) {
      this.logger.log(`Cache invalidation completed: ${totalDeleted} keys deleted`);
    }
  }

  /**
   * Invalidate cache by exact key
   */
  async invalidateKey(key: string): Promise<void> {
    try {
      await this.cacheService.del(key);
      this.logger.debug(`Invalidated cache key: ${key}`);
    } catch (error) {
      this.logger.warn(`Failed to invalidate cache key ${key}:`, error);
    }
  }

  /**
   * Invalidate multiple exact keys
   */
  async invalidateKeys(keys: string[]): Promise<void> {
    const uniqueKeys = [...new Set(keys)];
    let deleted = 0;

    for (const key of uniqueKeys) {
      try {
        await this.cacheService.del(key);
        deleted++;
      } catch (error) {
        this.logger.warn(`Failed to invalidate cache key ${key}:`, error);
      }
    }

    if (deleted > 0) {
      this.logger.debug(`Invalidated ${deleted} cache keys`);
    }
  }
}
