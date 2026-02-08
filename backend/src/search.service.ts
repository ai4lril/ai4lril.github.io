import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from './prisma/prisma.service';
import { CacheService } from './cache/cache.service';

@Injectable()
export class SearchService {
  private readonly logger = new Logger(SearchService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly cacheService: CacheService,
  ) {}

  async fullTextSearch(
    query: string,
    resourceTypes: string[],
    userId?: string,
    limit: number = 50,
    offset: number = 0,
  ) {
    try {
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
        const sentences = await this.prisma.sentence.findMany({
          where: {
            text: {
              contains: query,
              mode: 'insensitive',
            },
          },
          take: limit,
          skip: offset,
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
        const blogPosts = await this.prisma.blogPost.findMany({
          where: {
            OR: [
              { title: { contains: query, mode: 'insensitive' } },
              { content: { contains: query, mode: 'insensitive' } },
            ],
            published: true,
          },
          take: limit,
          skip: offset,
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
        const forumPosts = await this.prisma.forumPost.findMany({
          where: {
            OR: [
              { title: { contains: query, mode: 'insensitive' } },
              { content: { contains: query, mode: 'insensitive' } },
            ],
          },
          take: limit,
          skip: offset,
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

      return {
        query,
        results,
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
    filters?: Record<string, any>,
  ) {
    return this.prisma.savedSearch.create({
      data: {
        userId,
        name,
        query,
        filters: filters || {},
      },
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
