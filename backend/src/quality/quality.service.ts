import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CacheService } from '../cache/cache.service';

@Injectable()
export class QualityService {
  private readonly logger = new Logger(QualityService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly cacheService: CacheService,
  ) {}

  async calculateQualityScore(
    userId: string,
    category: string = 'overall',
  ): Promise<number> {
    try {
      const cacheKey = `quality_score:${userId}:${category}`;
      const cached = await this.cacheService.get<number>(cacheKey);

      if (cached !== null) {
        return cached;
      }

      let score = 0;

      switch (category) {
        case 'overall':
          score = await this.calculateOverallScore(userId);
          break;
        case 'audio':
          score = await this.calculateAudioScore(userId);
          break;
        case 'transcription':
          score = await this.calculateTranscriptionScore(userId);
          break;
        case 'translation':
          score = await this.calculateTranslationScore(userId);
          break;
        default:
          score = await this.calculateOverallScore(userId);
      }

      // Store score
      await this.prisma.qualityScore.create({
        data: {
          userId,
          score,
          category,
        },
      });

      // Cache for 1 hour
      await this.cacheService.set(cacheKey, score, 3600);

      return score;
    } catch (error) {
      this.logger.error(
        `Error calculating quality score for user ${userId}: ${error.message}`,
      );
      return 0;
    }
  }

  private async calculateOverallScore(userId: string): Promise<number> {
    // Get user's validation history
    const validations = await this.prisma.validation.findMany({
      where: { userId },
    });

    if (validations.length === 0) {
      return 50; // Default score for new users
    }

    const positiveValidations = validations.filter((v) => v.isValid).length;
    const validationRate = positiveValidations / validations.length;

    // Get contribution acceptance rate
    const contributions = await this.prisma.contribution.findMany({
      where: { userId },
    });

    const acceptedContributions = contributions.filter(
      (c) => c.status === 'approved',
    ).length;
    const acceptanceRate =
      contributions.length > 0
        ? acceptedContributions / contributions.length
        : 0;

    // Calculate weighted score (70% validation rate, 30% acceptance rate)
    const score = Math.round(validationRate * 70 + acceptanceRate * 30);

    return Math.max(0, Math.min(100, score));
  }

  private async calculateAudioScore(userId: string): Promise<number> {
    const recordings = await this.prisma.speechRecording.findMany({
      where: { userId },
      include: {
        validations: true,
      },
    });

    if (recordings.length === 0) {
      return 50;
    }

    let totalScore = 0;
    for (const recording of recordings) {
      if (recording.validations.length === 0) {
        totalScore += 50;
        continue;
      }

      const positiveValidations = recording.validations.filter(
        (v) => v.isValid,
      ).length;
      const validationRate = positiveValidations / recording.validations.length;
      totalScore += validationRate * 100;
    }

    return Math.round(totalScore / recordings.length);
  }

  private async calculateTranscriptionScore(userId: string): Promise<number> {
    const reviews = await this.prisma.transcriptionReview.findMany({
      where: { userId },
    });

    if (reviews.length === 0) {
      return 50;
    }

    const approvedReviews = reviews.filter((r) => r.isApproved).length;
    const approvalRate = approvedReviews / reviews.length;

    return Math.round(approvalRate * 100);
  }

  private async calculateTranslationScore(userId: string): Promise<number> {
    const translations = await this.prisma.translationResult.findMany({
      where: { userId },
    });

    if (translations.length === 0) {
      return 50;
    }

    const validatedTranslations = translations.filter(
      (t) => t.isValidated,
    ).length;
    const validationRate = validatedTranslations / translations.length;

    return Math.round(validationRate * 100);
  }

  async calculateReliabilityScore(userId: string): Promise<number> {
    const cacheKey = `reliability_score:${userId}`;
    const cached = await this.cacheService.get<number>(cacheKey);

    if (cached !== null) {
      return cached;
    }

    // Get validation consistency
    const validations = await this.prisma.validation.findMany({
      where: { userId },
    });

    if (validations.length < 10) {
      return 50; // Not enough data
    }

    // Calculate consistency (how often user agrees with majority)
    const recordingIds = [
      ...new Set(validations.map((v) => v.speechRecordingId)),
    ];
    let consistentCount = 0;

    for (const recordingId of recordingIds.slice(0, 50)) {
      // Get all validations for this recording
      const allValidations = await this.prisma.validation.findMany({
        where: { speechRecordingId: recordingId },
      });

      if (allValidations.length < 3) {
        continue;
      }

      const userValidation = validations.find(
        (v) => v.speechRecordingId === recordingId,
      );
      if (!userValidation) {
        continue;
      }

      // Check if user's validation matches majority
      const positiveCount = allValidations.filter((v) => v.isValid).length;
      const majorityIsValid = positiveCount > allValidations.length / 2;

      if (userValidation.isValid === majorityIsValid) {
        consistentCount++;
      }
    }

    const reliabilityScore =
      recordingIds.length > 0
        ? Math.round(
            (consistentCount / Math.min(recordingIds.length, 50)) * 100,
          )
        : 50;

    // Update user stats
    await this.prisma.userStats.upsert({
      where: { userId },
      create: {
        userId,
        reliabilityScore,
      },
      update: {
        reliabilityScore,
      },
    });

    await this.cacheService.set(cacheKey, reliabilityScore, 3600);
    return reliabilityScore;
  }

  async getQualityTrends(userId: string, days: number = 30) {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    return this.prisma.qualityScore.findMany({
      where: {
        userId,
        calculatedAt: {
          gte: startDate,
        },
      },
      orderBy: {
        calculatedAt: 'asc',
      },
    });
  }
}
