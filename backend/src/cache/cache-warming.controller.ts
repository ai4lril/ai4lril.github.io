import { Controller, Post, Body, Param, UseGuards, HttpCode, HttpStatus } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { CacheWarmingService } from './cache-warming.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard, Roles } from '../auth/rbac.guard';

@ApiTags('cache')
@Controller('cache/warm')
export class CacheWarmingController {
  constructor(private readonly cacheWarmingService: CacheWarmingService) { }

  /**
   * Manually trigger cache warming
   * POST /cache/warm
   * Admin only
   */
  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN', 'SUPER_ADMIN')
  @HttpCode(HttpStatus.OK)
  async warmCache(@Body() body?: { languageCodes?: string[] }) {
    return await this.cacheWarmingService.warmCache(body?.languageCodes);
  }

  /**
   * Warm specific cache type
   * POST /cache/warm/:type
   * Admin only
   */
  @Post(':type')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN', 'SUPER_ADMIN')
  @HttpCode(HttpStatus.OK)
  async warmSpecificCache(
    @Param('type') type: 'recordings' | 'questions' | 'blogs' | 'search',
    @Body() body?: { languageCode?: string },
  ) {
    const itemsCached = await this.cacheWarmingService.warmSpecificCache(
      type,
      body?.languageCode,
    );
    return {
      success: true,
      cacheType: type,
      itemsCached,
      languageCode: body?.languageCode || 'all',
    };
  }
}
