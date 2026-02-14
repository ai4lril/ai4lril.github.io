import { Controller, Get, Param, UseGuards, HttpCode, HttpStatus, Header } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { QueueService } from './queue.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard, Roles } from '../auth/rbac.guard';

/**
 * Controller for queue management and monitoring
 */
@ApiTags('queue')
@Controller('queue')
export class QueueController {
  constructor(private readonly queueService: QueueService) { }

  /**
   * Get job status by ID
   * Public endpoint - users can check their own job status
   */
  @Get('status/:jobId')
  @HttpCode(HttpStatus.OK)
  async getJobStatus(@Param('jobId') jobId: string) {
    return this.queueService.getJobStatus(jobId);
  }

  /**
   * Get queue statistics
   * Admin only - shows all queue metrics
   */
  @Get('stats')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN', 'SUPER_ADMIN')
  @HttpCode(HttpStatus.OK)
  async getQueueStats() {
    return this.queueService.getQueueStats();
  }

  /**
   * Get Prometheus metrics for queues
   * GET /queue/metrics/prometheus
   */
  @Get('metrics/prometheus')
  @HttpCode(HttpStatus.OK)
  @Header('Content-Type', 'text/plain')
  async getPrometheusMetrics() {
    return await this.queueService.getPrometheusMetrics();
  }

  /**
   * Get health check for queues
   * GET /queue/health
   */
  @Get('health')
  @HttpCode(HttpStatus.OK)
  async getHealth() {
    return await this.queueService.getHealth();
  }
}
