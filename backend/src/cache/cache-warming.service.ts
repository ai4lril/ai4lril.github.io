import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { PrismaService } from '../prisma/prisma.service';
import { CacheService } from './cache.service';
import { SpeechService } from '../speech/speech.service';
import { QuestionService } from '../question/question.service';
import { SearchService } from '../search/search.service';
import { AudioBlogService } from '../community/audio-blog.service';
import { VideoBlogService } from '../community/video-blog.service';

/**
 * Service for warming cache with frequently accessed data
 * Runs scheduled jobs to pre-populate cache for better performance
 */
@Injectable()
export class CacheWarmingService {
  private readonly logger = new Logger(CacheWarmingService.name);
  private isWarming = false;

  constructor(
    private readonly prisma: PrismaService,
    private readonly cacheService: CacheService,
    private readonly speechService: SpeechService,
    private readonly questionService: QuestionService,
    private readonly searchService: SearchService,
    private readonly audioBlogService: AudioBlogService,
    private readonly videoBlogService: VideoBlogService,
  ) { }

  /**
   * Scheduled cache warming - runs every 6 hours
   * Warms cache for active languages and popular queries
   */
  @Cron(CronExpression.EVERY_6_HOURS, {
    name: 'cache-warming',
    timeZone: 'UTC',
  })
  async scheduledCacheWarming() {
    if (this.isWarming) {
      this.logger.warn('Cache warming already in progress, skipping...');
      return;
    }

    this.logger.log('Starting scheduled cache warming...');
    await this.warmCacheForActiveLanguages();
    this.logger.log('Scheduled cache warming completed');
  }

  /**
   * Manual cache warming - can be triggered by admins
   * @param languageCodes - Optional array of specific language codes to warm
   */
  async warmCache(languageCodes?: string[]): Promise<{
    success: boolean;
    languagesWarmed: number;
    itemsCached: number;
    duration: number;
  }> {
    if (this.isWarming) {
      throw new Error('Cache warming already in progress');
    }

    const startTime = Date.now();
    this.isWarming = true;

    try {
      let languagesWarmed = 0;
      let itemsCached = 0;

      if (languageCodes && languageCodes.length > 0) {
        // Warm specific languages
        for (const langCode of languageCodes) {
          const cached = await this.warmLanguageCache(langCode);
          itemsCached += cached;
          languagesWarmed++;
        }
      } else {
        // Warm all active languages
        languagesWarmed = await this.warmCacheForActiveLanguages();
      }

      const duration = Date.now() - startTime;

      this.logger.log(
        `Cache warming completed: ${languagesWarmed} languages, ${itemsCached} items cached in ${duration}ms`,
      );

      return {
        success: true,
        languagesWarmed,
        itemsCached,
        duration,
      };
    } catch (error) {
      this.logger.error('Cache warming failed:', error);
      throw error;
    } finally {
      this.isWarming = false;
    }
  }

  /**
   * Warm cache for all active languages
   */
  private async warmCacheForActiveLanguages(): Promise<number> {
    try {
      // Get active languages (languages with validated sentences)
      const activeLanguages = await this.prisma.sentence.groupBy({
        by: ['languageCode'],
        where: {
          valid: true,
          isActive: true,
        },
        _count: {
          id: true,
        },
        orderBy: {
          _count: {
            id: 'desc',
          },
        },
        take: 50, // Top 50 most active languages
      });

      this.logger.log(
        `Warming cache for ${activeLanguages.length} active languages`,
      );

      let totalItemsCached = 0;
      for (const lang of activeLanguages) {
        const itemsCached = await this.warmLanguageCache(lang.languageCode);
        totalItemsCached += itemsCached;
      }

      return activeLanguages.length;
    } catch (error) {
      this.logger.error('Error warming cache for active languages:', error);
      return 0;
    }
  }

  /**
   * Warm cache for a specific language
   */
  private async warmLanguageCache(languageCode: string): Promise<number> {
    let itemsCached = 0;

    try {
      // 1. Warm speech sentences (first page, most common query)
      try {
        await this.speechService.getSpeechSentences(languageCode, undefined, 1, 50);
        itemsCached++;
      } catch (error) {
        this.logger.warn(
          `Failed to warm speech sentences for ${languageCode}:`,
          error,
        );
      }

      // 2. Warm validation recordings (for Listen feature)
      try {
        await this.speechService.getAudioForValidation(languageCode);
        itemsCached++;
      } catch (error) {
        this.logger.warn(
          `Failed to warm validation recordings for ${languageCode}:`,
          error,
        );
      }

      // 3. Warm validated questions
      try {
        await this.questionService.getValidatedQuestions(languageCode);
        itemsCached++;
      } catch (error) {
        this.logger.warn(
          `Failed to warm questions for ${languageCode}:`,
          error,
        );
      }

      // 4. Warm audio blogs
      try {
        await this.audioBlogService.getAudioBlogs(languageCode, true, 20, 0);
        itemsCached++;
      } catch (error) {
        this.logger.warn(
          `Failed to warm audio blogs for ${languageCode}:`,
          error,
        );
      }

      // 5. Warm video blogs
      try {
        await this.videoBlogService.getVideoBlogs(languageCode, true, 20, 0);
        itemsCached++;
      } catch (error) {
        this.logger.warn(
          `Failed to warm video blogs for ${languageCode}:`,
          error,
        );
      }

      // 6. Warm popular search queries
      try {
        const popularQueries = await this.getPopularSearchQueries(languageCode);
        for (const query of popularQueries.slice(0, 10)) {
          // Warm top 10 popular queries
          await this.searchService.fullTextSearch(
            query,
            ['sentence', 'blog'],
            undefined,
            20,
            0,
          );
          itemsCached++;
        }
      } catch (error) {
        this.logger.warn(
          `Failed to warm search queries for ${languageCode}:`,
          error,
        );
      }

      this.logger.debug(
        `Warmed cache for ${languageCode}: ${itemsCached} items`,
      );
    } catch (error) {
      this.logger.error(
        `Error warming cache for language ${languageCode}:`,
        error,
      );
    }

    return itemsCached;
  }

  /**
   * Get popular search queries for a language
   */
  private async getPopularSearchQueries(
    languageCode?: string,
  ): Promise<string[]> {
    try {
      const searchHistory = await this.prisma.searchHistory.findMany({
        where: languageCode
          ? {
            // Filter by language if we can determine it from results
            // For now, get all popular queries
          }
          : {},
        select: {
          query: true,
        },
        orderBy: {
          createdAt: 'desc',
        },
        take: 100,
      });

      // Count query frequency
      const queryCounts = new Map<string, number>();
      for (const entry of searchHistory) {
        const count = queryCounts.get(entry.query) || 0;
        queryCounts.set(entry.query, count + 1);
      }

      // Sort by frequency and return top queries
      return Array.from(queryCounts.entries())
        .sort((a, b) => b[1] - a[1])
        .map(([query]) => query)
        .slice(0, 20);
    } catch (error) {
      this.logger.warn('Failed to get popular search queries:', error);
      return [];
    }
  }

  /**
   * Warm cache for specific endpoints/data types
   */
  async warmSpecificCache(
    cacheType: 'recordings' | 'questions' | 'blogs' | 'search',
    languageCode?: string,
  ): Promise<number> {
    let itemsCached = 0;

    try {
      switch (cacheType) {
        case 'recordings':
          if (languageCode) {
            await this.speechService.getAudioForValidation(languageCode);
            itemsCached++;
          } else {
            // Warm for all active languages
            const languages = await this.prisma.sentence.groupBy({
              by: ['languageCode'],
              where: { valid: true, isActive: true },
            });
            for (const lang of languages) {
              await this.speechService.getAudioForValidation(lang.languageCode);
              itemsCached++;
            }
          }
          break;

        case 'questions':
          if (languageCode) {
            await this.questionService.getValidatedQuestions(languageCode);
            itemsCached++;
          } else {
            const languages = await this.prisma.questionSubmission.groupBy({
              by: ['languageCode'],
              where: { valid: true },
            });
            for (const lang of languages) {
              await this.questionService.getValidatedQuestions(lang.languageCode);
              itemsCached++;
            }
          }
          break;

        case 'blogs':
          if (languageCode) {
            await Promise.all([
              this.audioBlogService.getAudioBlogs(languageCode, true, 20, 0),
              this.videoBlogService.getVideoBlogs(languageCode, true, 20, 0),
            ]);
            itemsCached += 2;
          } else {
            const languages = await this.prisma.audioBlog.groupBy({
              by: ['languageCode'],
              where: { published: true },
            });
            for (const lang of languages) {
              await Promise.all([
                this.audioBlogService.getAudioBlogs(lang.languageCode, true, 20, 0),
                this.videoBlogService.getVideoBlogs(lang.languageCode, true, 20, 0),
              ]);
              itemsCached += 2;
            }
          }
          break;

        case 'search':
          const popularQueries = await this.getPopularSearchQueries(languageCode);
          for (const query of popularQueries.slice(0, 20)) {
            await this.searchService.fullTextSearch(
              query,
              ['sentence', 'blog'],
              undefined,
              20,
              0,
            );
            itemsCached++;
          }
          break;
      }

      this.logger.log(`Warmed ${cacheType} cache: ${itemsCached} items`);
    } catch (error) {
      this.logger.error(`Error warming ${cacheType} cache:`, error);
      throw error;
    }

    return itemsCached;
  }
}
