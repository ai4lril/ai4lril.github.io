import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CacheService } from '../cache/cache.service';

@Injectable()
export class FAQService {
  private readonly logger = new Logger(FAQService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly cacheService: CacheService,
  ) {}

  async getFAQs(category?: string, search?: string) {
    const cacheKey = `faqs:${category || 'all'}:${search || ''}`;
    const cached = await this.cacheService.get<any[]>(cacheKey);

    if (cached) {
      return cached;
    }

    const where: any = {};
    if (category) {
      where.category = category;
    }
    if (search) {
      where.OR = [
        { question: { contains: search, mode: 'insensitive' } },
        { answer: { contains: search, mode: 'insensitive' } },
      ];
    }

    const faqs = await this.prisma.fAQ.findMany({
      where,
      orderBy: {
        order: 'asc',
      },
    });

    await this.cacheService.set(cacheKey, faqs, 3600); // 1 hour TTL
    return faqs;
  }

  async getFAQ(id: string) {
    const faq = await this.prisma.fAQ.findUnique({
      where: { id },
    });

    if (faq) {
      // Increment views
      await this.prisma.fAQ.update({
        where: { id },
        data: {
          views: {
            increment: 1,
          },
        },
      });
    }

    return faq;
  }

  async markHelpful(id: string, helpful: boolean) {
    if (helpful) {
      await this.prisma.fAQ.update({
        where: { id },
        data: {
          helpful: {
            increment: 1,
          },
        },
      });
    } else {
      await this.prisma.fAQ.update({
        where: { id },
        data: {
          notHelpful: {
            increment: 1,
          },
        },
      });
    }

    // Invalidate cache
    await this.cacheService.del(`faqs:*`);
  }
}
