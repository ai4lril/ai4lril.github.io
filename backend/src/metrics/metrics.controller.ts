import { Controller, Get, Header } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { MetricsService } from './metrics.service';

@ApiTags('metrics')
@Controller('metrics')
export class MetricsController {
  constructor(private readonly metricsService: MetricsService) { }

  @Get()
  getMetrics() {
    return this.metricsService.getMetrics();
  }

  @Get('prometheus')
  @Header('Content-Type', 'text/plain')
  async getPrometheusMetrics() {
    return await this.metricsService.getPrometheusMetrics();
  }
}
