import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CacheService } from '../cache/cache.service';
import { Prisma } from '@prisma/client';

@Injectable()
export class SearchService {
  private readonly logger = new Logger(SearchService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly cacheService: CacheService,
  ) { }

  async fullTextSearch(
    query: string,
    resourceTypes: string[],
    userId?: string,
    limit: number = 50,
    offset: number = 0,
    filters?: {
      languageCode?: string;
      dateFrom?: Date;
      dateTo?: Date;
      orderBy?: 'relevance' | 'date';
    },
  ) {
    try {
      // Cache full results without pagination parameters to reduce key proliferation
      const resourceTypesKey = resourceTypes.sort().join(',') || 'all';
      const filtersKey = filters
        ? `${filters.languageCode || ''}:${filters.dateFrom?.toISOString() || ''}:${filters.dateTo?.toISOString() || ''}:${filters.orderBy || ''}`
        : '';
      const cacheKey = `search:${query}:${resourceTypesKey}:${filtersKey}`;

      // Check cache first
      const cached = await this.cacheService.get<{ results: any[]; total: number }>(cacheKey);
      if (cached) {
        // Still track search history even for cached results
        if (userId) {
          await this.prisma.searchHistory.create({
            data: {
              userId,
              query,
              resultCount: cached.total || 0,
            },
          }).catch(() => {
            // Ignore errors in history tracking
          });
        }
        // Paginate in-memory from cached full results
        return {
          query,
          results: cached.results.slice(offset, offset + limit),
          total: cached.total,
        };
      }

      // Track search history
      if (userId) {
        await this.prisma.searchHistory.create({
          data: {
            userId,
            query,
            resultCount: 0, // Will be updated after search
          },
        });
      }

      const results: any[] = [];

      // Search sentences
      if (resourceTypes.includes('sentence') || resourceTypes.length === 0) {
        const sentenceWhere: Record<string, unknown> = {
          text: {
            contains: query,
            mode: 'insensitive',
          },
        };
        if (filters?.languageCode) {
          sentenceWhere.languageCode = filters.languageCode;
        }
        if (filters?.dateFrom || filters?.dateTo) {
          sentenceWhere.createdAt = {};
          if (filters.dateFrom) {
            (sentenceWhere.createdAt as Record<string, Date>).gte = filters.dateFrom;
          }
          if (filters.dateTo) {
            (sentenceWhere.createdAt as Record<string, Date>).lte = filters.dateTo;
          }
        }

        const sentences = await this.prisma.sentence.findMany({
          where: sentenceWhere,
          take: limit * 2, // Fetch more for merging with other types
          skip: offset,
          orderBy: filters?.orderBy === 'date' ? { createdAt: 'desc' } : undefined,
          include: {
            user: {
              select: {
                username: true,
                display_name: true,
              },
            },
          },
        });

        results.push(
          ...sentences.map((s) => ({
            type: 'sentence',
            id: s.id,
            text: s.text,
            languageCode: s.languageCode,
            user: s.user,
            createdAt: s.createdAt,
          })),
        );
      }

      // Search blog posts
      if (resourceTypes.includes('blog') || resourceTypes.length === 0) {
        const blogWhere: Record<string, unknown> = {
          OR: [
            { title: { contains: query, mode: 'insensitive' } },
            { content: { contains: query, mode: 'insensitive' } },
          ],
          published: true,
        };
        if (filters?.languageCode) {
          blogWhere.languageCode = filters.languageCode;
        }
        if (filters?.dateFrom || filters?.dateTo) {
          blogWhere.createdAt = {};
          if (filters.dateFrom) {
            (blogWhere.createdAt as Record<string, Date>).gte = filters.dateFrom;
          }
          if (filters.dateTo) {
            (blogWhere.createdAt as Record<string, Date>).lte = filters.dateTo;
          }
        }

        const blogPosts = await this.prisma.blogPost.findMany({
          where: blogWhere,
          take: limit * 2,
          skip: offset,
          orderBy: filters?.orderBy === 'date' ? { createdAt: 'desc' } : undefined,
          include: {
            user: {
              select: {
                username: true,
                display_name: true,
              },
            },
          },
        });

        results.push(
          ...blogPosts.map((b) => ({
            type: 'blog',
            id: b.id,
            title: b.title,
            excerpt: b.excerpt,
            languageCode: b.languageCode,
            script: b.script,
            user: b.user,
            createdAt: b.createdAt,
          })),
        );
      }

      // Search forum posts
      if (resourceTypes.includes('forum') || resourceTypes.length === 0) {
        const forumWhere: Record<string, unknown> = {
          OR: [
            { title: { contains: query, mode: 'insensitive' } },
            { content: { contains: query, mode: 'insensitive' } },
          ],
        };
        if (filters?.dateFrom || filters?.dateTo) {
          forumWhere.createdAt = {};
          if (filters.dateFrom) {
            (forumWhere.createdAt as Record<string, Date>).gte = filters.dateFrom;
          }
          if (filters.dateTo) {
            (forumWhere.createdAt as Record<string, Date>).lte = filters.dateTo;
          }
        }

        const forumPosts = await this.prisma.forumPost.findMany({
          where: forumWhere,
          take: limit * 2,
          skip: offset,
          orderBy: filters?.orderBy === 'date' ? { createdAt: 'desc' } : undefined,
          include: {
            user: {
              select: {
                username: true,
                display_name: true,
              },
            },
          },
        });

        results.push(
          ...forumPosts.map((f) => ({
            type: 'forum',
            id: f.id,
            title: f.title,
            content: f.content.substring(0, 200),
            user: f.user,
            createdAt: f.createdAt,
          })),
        );
      }

      // Update search history with result count
      if (userId) {
        await this.prisma.searchHistory.updateMany({
          where: {
            userId,
            query,
            createdAt: {
              gte: new Date(Date.now() - 60000), // Last minute
            },
          },
          data: {
            resultCount: results.length,
          },
        });
      }

      const searchResult = {
        query,
        results,
        total: results.length,
      };

      // Cache full search results (without pagination) for 5 minutes
      await this.cacheService.set(cacheKey, searchResult, 300);

      // Return paginated results
      return {
        query,
        results: results.slice(offset, offset + limit),
        total: results.length,
      };
    } catch (error) {
      this.logger.error(`Search failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
      throw error;
    }
  }

  async saveSearch(
    userId: string,
    name: string,
    query: string,
    filters?: Prisma.InputJsonValue,
  ) {
    return this.prisma.savedSearch.create({
      data: { userId, name, query, filters: filters ?? undefined },
    });
  }

  async getSavedSearches(userId: string) {
    return this.prisma.savedSearch.findMany({
      where: { userId },
      orderBy: {
        createdAt: 'desc',
      },
    });
  }

  async deleteSavedSearch(userId: string, searchId: string) {
    await this.prisma.savedSearch.deleteMany({
      where: {
        id: searchId,
        userId,
      },
    });
  }

  async getSearchHistory(userId: string, limit: number = 20) {
    return this.prisma.searchHistory.findMany({
      where: { userId },
      orderBy: {
        createdAt: 'desc',
      },
      take: limit,
    });
  }
}
