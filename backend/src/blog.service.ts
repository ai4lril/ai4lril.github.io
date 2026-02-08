import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from './prisma/prisma.service';
import { CacheService } from './cache/cache.service';

@Injectable()
export class BlogService {
  private readonly logger = new Logger(BlogService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly cacheService: CacheService,
  ) {}

  async createBlogPost(
    userId: string,
    languageCode: string,
    script: string,
    title: string,
    content: string,
    excerpt?: string,
  ) {
    try {
      const blogPost = await this.prisma.blogPost.create({
        data: {
          userId,
          languageCode,
          script,
          title,
          content,
          excerpt,
          published: false,
        },
      });

      // Invalidate cache
      await this.cacheService.del(`blog_posts:${languageCode}:${script}`);

      return blogPost;
    } catch (error) {
      this.logger.error(`Failed to create blog post: ${error.message}`);
      throw error;
    }
  }

  async updateBlogPost(
    blogId: string,
    userId: string,
    updates: {
      title?: string;
      content?: string;
      excerpt?: string;
      published?: boolean;
    },
  ) {
    // Verify ownership
    const blogPost = await this.prisma.blogPost.findUnique({
      where: { id: blogId },
    });

    if (!blogPost || blogPost.userId !== userId) {
      throw new Error('Blog post not found or unauthorized');
    }

    const updated = await this.prisma.blogPost.update({
      where: { id: blogId },
      data: {
        ...updates,
        publishedAt:
          updates.published && !blogPost.published
            ? new Date()
            : blogPost.publishedAt,
      },
    });

    // Invalidate cache
    await this.cacheService.del(`blog_post:${blogId}`);
    await this.cacheService.del(
      `blog_posts:${blogPost.languageCode}:${blogPost.script}`,
    );

    return updated;
  }

  async getBlogPost(blogId: string) {
    const cacheKey = `blog_post:${blogId}`;
    const cached = await this.cacheService.get<any>(cacheKey);

    if (cached) {
      return cached;
    }

    const blogPost = await this.prisma.blogPost.findUnique({
      where: { id: blogId },
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
    });

    if (blogPost) {
      // Increment views
      await this.prisma.blogPost.update({
        where: { id: blogId },
        data: {
          views: {
            increment: 1,
          },
        },
      });

      await this.cacheService.set(cacheKey, blogPost, 300); // 5 min TTL
    }

    return blogPost;
  }

  async getBlogPosts(
    languageCode: string,
    script: string,
    published: boolean = true,
    limit: number = 20,
    offset: number = 0,
  ) {
    const cacheKey = `blog_posts:${languageCode}:${script}:${published}:${limit}:${offset}`;
    const cached = await this.cacheService.get<any[]>(cacheKey);

    if (cached) {
      return cached;
    }

    const blogPosts = await this.prisma.blogPost.findMany({
      where: {
        languageCode,
        script,
        published,
      },
      include: {
        user: {
          select: {
            id: true,
            username: true,
            display_name: true,
          },
        },
      },
      orderBy: {
        publishedAt: 'desc',
      },
      take: limit,
      skip: offset,
    });

    await this.cacheService.set(cacheKey, blogPosts, 300); // 5 min TTL
    return blogPosts;
  }

  async deleteBlogPost(blogId: string, userId: string) {
    const blogPost = await this.prisma.blogPost.findUnique({
      where: { id: blogId },
    });

    if (!blogPost || blogPost.userId !== userId) {
      throw new Error('Blog post not found or unauthorized');
    }

    await this.prisma.blogPost.delete({
      where: { id: blogId },
    });

    // Invalidate cache
    await this.cacheService.del(`blog_post:${blogId}`);
    await this.cacheService.del(
      `blog_posts:${blogPost.languageCode}:${blogPost.script}`,
    );
  }
}
