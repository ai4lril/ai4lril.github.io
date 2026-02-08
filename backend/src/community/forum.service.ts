import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CacheService } from '../cache/cache.service';

@Injectable()
export class ForumService {
  private readonly logger = new Logger(ForumService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly cacheService: CacheService,
  ) {}

  async createPost(
    userId: string,
    categoryId: string,
    title: string,
    content: string,
  ) {
    try {
      const post = await this.prisma.forumPost.create({
        data: {
          userId,
          categoryId,
          title,
          content,
        },
      });

      // Invalidate cache
      await this.cacheService.del(`forum_posts:${categoryId}`);

      return post;
    } catch (error) {
      this.logger.error(`Failed to create forum post: ${error.message}`);
      throw error;
    }
  }

  async createReply(userId: string, postId: string, content: string) {
    try {
      const reply = await this.prisma.forumReply.create({
        data: {
          userId,
          postId,
          content,
        },
      });

      // Update post reply count and last reply time
      await this.prisma.forumPost.update({
        where: { id: postId },
        data: {
          replyCount: {
            increment: 1,
          },
          lastReplyAt: new Date(),
        },
      });

      // Invalidate cache
      await this.cacheService.del(`forum_post:${postId}`);
      await this.cacheService.del(`forum_replies:${postId}`);

      return reply;
    } catch (error) {
      this.logger.error(`Failed to create forum reply: ${error.message}`);
      throw error;
    }
  }

  async getPosts(categoryId?: string, limit: number = 20, offset: number = 0) {
    const cacheKey = `forum_posts:${categoryId || 'all'}:${limit}:${offset}`;
    const cached = await this.cacheService.get<any[]>(cacheKey);

    if (cached) {
      return cached;
    }

    const posts = await this.prisma.forumPost.findMany({
      where: categoryId ? { categoryId } : {},
      include: {
        user: {
          select: {
            id: true,
            username: true,
            display_name: true,
            profile_picture_url: true,
          },
        },
        category: {
          select: {
            id: true,
            name: true,
            slug: true,
          },
        },
      },
      orderBy: [
        { pinned: 'desc' },
        { lastReplyAt: 'desc' },
        { createdAt: 'desc' },
      ],
      take: limit,
      skip: offset,
    });

    await this.cacheService.set(cacheKey, posts, 300);
    return posts;
  }

  async getPost(postId: string) {
    const cacheKey = `forum_post:${postId}`;
    const cached = await this.cacheService.get<any>(cacheKey);

    if (cached) {
      return cached;
    }

    const post = await this.prisma.forumPost.findUnique({
      where: { id: postId },
      include: {
        user: {
          select: {
            id: true,
            username: true,
            display_name: true,
            profile_picture_url: true,
          },
        },
        category: true,
      },
    });

    if (post) {
      // Increment views
      await this.prisma.forumPost.update({
        where: { id: postId },
        data: {
          views: {
            increment: 1,
          },
        },
      });

      await this.cacheService.set(cacheKey, post, 300);
    }

    return post;
  }

  async getReplies(postId: string, limit: number = 50, offset: number = 0) {
    const cacheKey = `forum_replies:${postId}:${limit}:${offset}`;
    const cached = await this.cacheService.get<any[]>(cacheKey);

    if (cached) {
      return cached;
    }

    const replies = await this.prisma.forumReply.findMany({
      where: { postId },
      include: {
        user: {
          select: {
            id: true,
            username: true,
            display_name: true,
            profile_picture_url: true,
          },
        },
      },
      orderBy: {
        createdAt: 'asc',
      },
      take: limit,
      skip: offset,
    });

    await this.cacheService.set(cacheKey, replies, 300);
    return replies;
  }

  async getCategories() {
    const cacheKey = 'forum_categories';
    const cached = await this.cacheService.get<any[]>(cacheKey);

    if (cached) {
      return cached;
    }

    const categories = await this.prisma.forumCategory.findMany({
      orderBy: {
        order: 'asc',
      },
    });

    await this.cacheService.set(cacheKey, categories, 3600); // 1 hour TTL
    return categories;
  }
}
