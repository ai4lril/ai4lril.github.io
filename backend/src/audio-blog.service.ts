import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from './prisma/prisma.service';
import { StorageService } from './storage/storage.service';
import { CacheService } from './cache/cache.service';

@Injectable()
export class AudioBlogService {
  private readonly logger = new Logger(AudioBlogService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly storageService: StorageService,
    private readonly cacheService: CacheService,
  ) {}

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

      // Invalidate cache
      await this.cacheService.del(`audio_blogs:${languageCode}`);

      return audioBlog;
    } catch (error) {
      this.logger.error(`Failed to create audio blog: ${error.message}`);
      throw error;
    }
  }

  async getAudioBlog(blogId: string) {
    const cacheKey = `audio_blog:${blogId}`;
    const cached = await this.cacheService.get<any>(cacheKey);

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
    const cacheKey = `audio_blogs:${languageCode}:${published}:${limit}:${offset}`;
    const cached = await this.cacheService.get<any[]>(cacheKey);

    if (cached) {
      return cached;
    }

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
      take: limit,
      skip: offset,
    });

    await this.cacheService.set(cacheKey, audioBlogs, 300);
    return audioBlogs;
  }
}
