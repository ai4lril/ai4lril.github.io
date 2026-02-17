import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { StorageService } from '../storage/storage.service';
import { CacheService } from '../cache/cache.service';
import { CacheInvalidationService } from '../cache/cache-invalidation.service';
import { getErrorMessage } from '../common/error-utils';

@Injectable()
export class VideoBlogService {
  private readonly logger = new Logger(VideoBlogService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly storageService: StorageService,
    private readonly cacheService: CacheService,
    private readonly cacheInvalidation: CacheInvalidationService,
  ) { }

  async createVideoBlog(
    userId: string,
    languageCode: string,
    title: string,
    description: string,
    videoFile: Buffer,
    videoFileName: string,
    thumbnailUrl?: string,
    duration?: number,
  ) {
    try {
      // Upload video to MinIO
      const videoUrl = await this.storageService.uploadMedia(
        videoFile,
        `video-blogs/${userId}/${Date.now()}_${videoFileName}`,
        'video',
      );

      const videoBlog = await this.prisma.videoBlog.create({
        data: {
          userId,
          languageCode,
          title,
          description,
          videoFile: videoUrl,
          thumbnailUrl,
          duration,
          published: false,
        },
      });

      // Invalidate cache using invalidation service
      await this.cacheInvalidation.invalidateVideoBlog(
        languageCode,
        videoBlog.id,
      );

      return videoBlog;
    } catch (error) {
      this.logger.error(`Failed to create video blog: ${getErrorMessage(error)}`);
      throw error;
    }
  }

  async getVideoBlog(blogId: string) {
    const cacheKey = `video_blog:${blogId}`;
    type CachedVideoBlog = Awaited<ReturnType<typeof this.prisma.videoBlog.findUnique>>;
    const cached = await this.cacheService.get<CachedVideoBlog>(cacheKey);

    if (cached) {
      return cached;
    }

    const videoBlog = await this.prisma.videoBlog.findUnique({
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

    if (videoBlog) {
      // Increment views
      await this.prisma.videoBlog.update({
        where: { id: blogId },
        data: {
          views: {
            increment: 1,
          },
        },
      });

      await this.cacheService.set(cacheKey, videoBlog, 300);
    }

    return videoBlog;
  }

  async getVideoBlogs(
    languageCode: string,
    published: boolean = true,
    limit: number = 20,
    offset: number = 0,
  ) {
    // Cache full list without pagination parameters to reduce key proliferation
    const cacheKey = `video_blogs:${languageCode}:${published}`;
    type CachedList = Awaited<ReturnType<typeof this.prisma.videoBlog.findMany>>;
    let cached = await this.cacheService.get<CachedList>(cacheKey);

    if (!cached) {
      // Fetch full list from database
      const videoBlogs = await this.prisma.videoBlog.findMany({
        where: {
          languageCode,
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
      });

      // Cache full list for 5 minutes
      await this.cacheService.set(cacheKey, videoBlogs, 300);
      cached = videoBlogs;
    }

    // Paginate in-memory from cached full list
    return cached.slice(offset, offset + limit);
  }
}
