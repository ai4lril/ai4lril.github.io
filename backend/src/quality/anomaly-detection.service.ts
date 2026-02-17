import { Injectable, Logger } from '@nestjs/common';
import { getErrorMessage } from '../common/error-utils';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class AnomalyDetectionService {
  private readonly logger = new Logger(AnomalyDetectionService.name);

  constructor(private readonly prisma: PrismaService) { }

  async detectAnomalies(userId: string): Promise<void> {
    try {
      // Get user's recent activity
      const recentContributions = await this.prisma.contribution.findMany({
        where: {
          userId,
          createdAt: {
            gte: new Date(Date.now() - 24 * 60 * 60 * 1000), // Last 24 hours
          },
        },
      });

      // Check for spam patterns
      if (recentContributions.length > 100) {
        await this.recordAnomaly(userId, 'contribution', null, 'spam', 0.9, {
          contributionCount: recentContributions.length,
          timeWindow: '24h',
        });
      }

      // Check validation patterns
      const validations = await this.prisma.validation.findMany({
        where: {
          userId,
          createdAt: {
            gte: new Date(Date.now() - 24 * 60 * 60 * 1000),
          },
        },
      });

      // Check for suspicious validation patterns (all positive or all negative)
      if (validations.length > 20) {
        const allPositive = validations.every((v) => v.isValid);
        const allNegative = validations.every((v) => !v.isValid);

        if (allPositive || allNegative) {
          await this.recordAnomaly(
            userId,
            'validation',
            null,
            'behavior',
            0.7,
            {
              pattern: allPositive ? 'all_positive' : 'all_negative',
              count: validations.length,
            },
          );
        }
      }

      // Check quality anomalies
      const qualityScore = await this.prisma.qualityScore.findFirst({
        where: { userId },
        orderBy: { calculatedAt: 'desc' },
      });

      if (qualityScore && qualityScore.score < 30) {
        await this.recordAnomaly(userId, 'quality', null, 'quality', 0.8, {
          score: qualityScore.score,
        });
      }
    } catch (error) {
      this.logger.error(`Error detecting anomalies for user ${userId}: ${getErrorMessage(error)}`);
    }
  }

  private async recordAnomaly(
    userId: string,
    resourceType: string,
    resourceId: string | null,
    anomalyType: string,
    score: number,
    details: Record<string, any>,
  ): Promise<void> {
    await this.prisma.anomalyDetection.create({
      data: {
        userId,
        resourceType,
        resourceId,
        anomalyType,
        score,
        details,
      },
    });

    this.logger.warn(
      `Anomaly detected for user ${userId}: ${anomalyType} (score: ${score})`,
    );
  }

  async getAnomalies(userId?: string, resolved?: boolean) {
    return this.prisma.anomalyDetection.findMany({
      where: {
        userId: userId || undefined,
        resolved: resolved ?? false,
      },
      orderBy: {
        detectedAt: 'desc',
      },
      take: 100,
    });
  }

  async resolveAnomaly(anomalyId: string): Promise<void> {
    await this.prisma.anomalyDetection.update({
      where: { id: anomalyId },
      data: {
        resolved: true,
        resolvedAt: new Date(),
      },
    });
  }
}
