import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from './prisma/prisma.service';
import { StorageService } from './storage/storage.service';
import { CacheService } from './cache/cache.service';
import { VideoBlog } from '@prisma/client';

@Injectable()
export class VideoBlogService {
  private readonly logger = new Logger(VideoBlogService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly storageService: StorageService,
    private readonly cacheService: CacheService,
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

      // Invalidate cache
      await this.cacheService.del(`video_blogs:${languageCode}`);

      return videoBlog;
    } catch (error) {
      this.logger.error(
        `Failed to create video blog: ${error instanceof Error ? error.message : 'Unknown error'}`,
      );
      throw error;
    }
  }

  async getVideoBlog(blogId: string) {
    const cacheKey = `video_blog:${blogId}`;
    const cached = await this.cacheService.get<VideoBlog>(cacheKey);

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
    const cacheKey = `video_blogs:${languageCode}:${published}:${limit}:${offset}`;
    const cached = await this.cacheService.get<VideoBlog[]>(cacheKey);

    if (cached) {
      return cached;
    }

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
      take: limit,
      skip: offset,
    });

    await this.cacheService.set(cacheKey, videoBlogs, 300);
    return videoBlogs;
  }
}
