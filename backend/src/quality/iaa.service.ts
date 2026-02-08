import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class IAAService {
  private readonly logger = new Logger(IAAService.name);

  constructor(private readonly prisma: PrismaService) {}

  /**
   * Calculate Cohen's Kappa for inter-annotator agreement
   * Used when comparing agreement between 2 annotators
   */
  async calculateCohensKappa(
    resourceType: string,
    resourceId: string,
  ): Promise<number> {
    try {
      // Get all validations for this resource
      const validations = await this.prisma.validation.findMany({
        where: { speechRecordingId: resourceId },
      });

      if (validations.length < 2) {
        return 0; // Need at least 2 annotations
      }

      // For binary classification (valid/invalid)
      const positiveCount = validations.filter((v) => v.isValid).length;

      // Calculate observed agreement
      const pObserved = positiveCount / validations.length;

      // Calculate expected agreement (assuming random distribution)
      const pExpected = 0.5; // For binary classification

      // Cohen's Kappa
      const kappa = (pObserved - pExpected) / (1 - pExpected);

      // Store result
      await this.prisma.interAnnotatorAgreement.create({
        data: {
          resourceType,
          resourceId,
          kappaScore: kappa,
          agreementType: 'cohen',
          annotatorCount: validations.length,
        },
      });

      return Math.max(0, Math.min(1, kappa));
    } catch (error) {
      this.logger.error(`Error calculating Cohen's Kappa: ${error.message}`);
      return 0;
    }
  }

  /**
   * Calculate Fleiss' Kappa for inter-annotator agreement
   * Used when comparing agreement between multiple annotators
   */
  async calculateFleissKappa(
    resourceType: string,
    resourceId: string,
  ): Promise<number> {
    try {
      const validations = await this.prisma.validation.findMany({
        where: { speechRecordingId: resourceId },
      });

      if (validations.length < 3) {
        return 0; // Need at least 3 annotations for Fleiss' Kappa
      }

      const n = validations.length; // Number of annotators
      const positiveCount = validations.filter((v) => v.isValid).length;
      const negativeCount = n - positiveCount;

      // Calculate P (proportion of agreements)
      const p =
        (positiveCount * (positiveCount - 1) +
          negativeCount * (negativeCount - 1)) /
        (n * (n - 1));

      // Calculate Pe (expected proportion of agreements)
      const pe = 0.5; // For binary classification

      // Fleiss' Kappa
      const kappa = (p - pe) / (1 - pe);

      // Store result
      await this.prisma.interAnnotatorAgreement.create({
        data: {
          resourceType,
          resourceId,
          kappaScore: kappa,
          agreementType: 'fleiss',
          annotatorCount: n,
        },
      });

      return Math.max(0, Math.min(1, kappa));
    } catch (error) {
      this.logger.error(`Error calculating Fleiss' Kappa: ${error.message}`);
      return 0;
    }
  }
}
