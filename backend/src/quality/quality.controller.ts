import { Controller, Get, Post, Param, Query, UseGuards } from '@nestjs/common';
import { QualityService } from './quality.service';
import { IAAService } from './iaa.service';
import { AnomalyDetectionService } from './anomaly-detection.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard, Roles } from '../auth/rbac.guard';

@Controller('quality')
export class QualityController {
  constructor(
    private readonly qualityService: QualityService,
    private readonly iaaService: IAAService,
    private readonly anomalyService: AnomalyDetectionService,
  ) { }

  @Get('score/:userId')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN', 'SUPER_ADMIN')
  async getQualityScore(
    @Param('userId') userId: string,
    @Query('category') category?: string,
  ) {
    const score = await this.qualityService.calculateQualityScore(
      userId,
      category || 'overall',
    );
    return { userId, category: category || 'overall', score };
  }

  @Get('reliability/:userId')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN', 'SUPER_ADMIN')
  async getReliabilityScore(@Param('userId') userId: string) {
    const score = await this.qualityService.calculateReliabilityScore(userId);
    return { userId, score };
  }

  @Get('trends/:userId')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN', 'SUPER_ADMIN')
  async getQualityTrends(
    @Param('userId') userId: string,
    @Query('days') days?: string,
  ) {
    return this.qualityService.getQualityTrends(
      userId,
      days ? parseInt(days, 10) : 30,
    );
  }

  @Post('iaa/cohen/:resourceId')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN', 'SUPER_ADMIN')
  async calculateCohensKappa(@Param('resourceId') resourceId: string) {
    const kappa = await this.iaaService.calculateCohensKappa(
      'speech_recording',
      resourceId,
    );
    return { resourceId, kappa };
  }

  @Post('iaa/fleiss/:resourceId')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN', 'SUPER_ADMIN')
  async calculateFleissKappa(@Param('resourceId') resourceId: string) {
    const kappa = await this.iaaService.calculateFleissKappa(
      'speech_recording',
      resourceId,
    );
    return { resourceId, kappa };
  }

  @Get('anomalies')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN', 'SUPER_ADMIN')
  async getAnomalies(
    @Query('userId') userId?: string,
    @Query('resolved') resolved?: string,
  ) {
    return this.anomalyService.getAnomalies(userId, resolved === 'true');
  }

  @Post('anomalies/:id/resolve')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN', 'SUPER_ADMIN')
  async resolveAnomaly(@Param('id') id: string) {
    await this.anomalyService.resolveAnomaly(id);
    return { success: true };
  }
}
