import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { StorageService } from '../storage/storage.service';
import { CacheService } from '../cache/cache.service';
import { CacheInvalidationService } from '../cache/cache-invalidation.service';
import { getErrorMessage } from '../common/error-utils';

@Injectable()
export class AudioBlogService {
  private readonly logger = new Logger(AudioBlogService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly storageService: StorageService,
    private readonly cacheService: CacheService,
    private readonly cacheInvalidation: CacheInvalidationService,
  ) { }

  async createAudioBlog(
    userId: string,
    languageCode: string,
    title: string,
    description: string,
    audioFile: Buffer,
    audioFileName: string,
    duration?: number,
  ) {
    try {
      // Upload audio to MinIO
      const audioUrl = await this.storageService.uploadMedia(
        audioFile,
        `audio-blogs/${userId}/${Date.now()}_${audioFileName}`,
        'audio',
      );

      const audioBlog = await this.prisma.audioBlog.create({
        data: {
          userId,
          languageCode,
          title,
          description,
          audioFile: audioUrl,
          duration,
          published: false,
        },
      });

      // Invalidate cache using invalidation service
      await this.cacheInvalidation.invalidateAudioBlog(
        languageCode,
        audioBlog.id,
      );

      return audioBlog;
    } catch (error) {
      this.logger.error(`Failed to create audio blog: ${getErrorMessage(error)}`);
      throw error;
    }
  }

  async getAudioBlog(blogId: string) {
    const cacheKey = `audio_blog:${blogId}`;
    type CachedAudioBlog = Awaited<ReturnType<typeof this.prisma.audioBlog.findUnique>>;
    const cached = await this.cacheService.get<CachedAudioBlog>(cacheKey);

    if (cached) {
      return cached;
    }

    const audioBlog = await this.prisma.audioBlog.findUnique({
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

    if (audioBlog) {
      // Increment views
      await this.prisma.audioBlog.update({
        where: { id: blogId },
        data: {
          views: {
            increment: 1,
          },
        },
      });

      await this.cacheService.set(cacheKey, audioBlog, 300);
    }

    return audioBlog;
  }

  async getAudioBlogs(
    languageCode: string,
    published: boolean = true,
    limit: number = 20,
    offset: number = 0,
  ) {
    // Cache full list without pagination parameters to reduce key proliferation
    const cacheKey = `audio_blogs:${languageCode}:${published}`;
    type CachedList = Awaited<ReturnType<typeof this.prisma.audioBlog.findMany>>;
    let cached = await this.cacheService.get<CachedList>(cacheKey);

    if (!cached) {
      // Fetch full list from database
      const audioBlogs = await this.prisma.audioBlog.findMany({
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
      await this.cacheService.set(cacheKey, audioBlogs, 300);
      cached = audioBlogs;
    }

    // Paginate in-memory from cached full list
    return cached.slice(offset, offset + limit);
  }
}
