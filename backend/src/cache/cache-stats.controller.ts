import { Controller, Get, UseGuards, HttpCode, HttpStatus } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { CacheService } from './cache.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard, Roles } from '../auth/rbac.guard';

@ApiTags('cache')
@Controller('cache/stats')
export class CacheStatsController {
  constructor(private readonly cacheService: CacheService) { }

  /**
   * Get cache statistics
   * GET /cache/stats
   * Admin only
   */
  @Get()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN', 'SUPER_ADMIN')
  @HttpCode(HttpStatus.OK)
  async getCacheStats() {
    return await this.cacheService.getStats();
  }

  /**
   * Get Prometheus metrics for cache
   * GET /cache/stats/prometheus
   */
  @Get('prometheus')
  @HttpCode(HttpStatus.OK)
  async getPrometheusMetrics() {
    return await this.cacheService.getPrometheusMetrics();
  }
}
