import { Injectable, Inject } from '@nestjs/common';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Cache } from 'cache-manager';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class ApiKeyRateLimitService {
  constructor(
    @Inject(CACHE_MANAGER) private cacheManager: Cache,
    private prisma: PrismaService,
  ) {}

  async checkRateLimit(
    apiKeyId: string,
    limit = 60,
    ttl = 60,
  ): Promise<{ allowed: boolean; remaining: number; resetTime: number }> {
    const key = `api_key_rate_limit:${apiKeyId}`;
    const current = (await this.cacheManager.get<number>(key)) || 0;
    const resetTime = Math.ceil((Date.now() + ttl * 1000) / 1000);

    if (current >= limit) {
      await this.logAbuseAttempt(apiKeyId);
      return { allowed: false, remaining: 0, resetTime };
    }

    await this.cacheManager.set(key, current + 1, ttl);

    return { allowed: true, remaining: limit - current - 1, resetTime };
  }

  // Remove async if no await; but keep if future-proof
  getKeyLimit(): number {
    return 60; // Or whatever default; no async needed
  }

  private async logAbuseAttempt(apiKeyId: string) {
    await this.prisma.securityEvent.create({
      data: {
        eventType: 'rate_limit_exceeded',
        severity: 'medium',
        description: `API key ${apiKeyId} exceeded rate limit`,
        metadata: { apiKeyId },
      },
    });
  }
}

// In checkRateLimit catch if any, but no catch here – assume fixed by typing elsewhere.
