import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

export enum DatasetCategory {
  TRAINING = 'training',
  EVALUATION = 'evaluation',
  TESTING = 'testing',
  DISCARDED = 'discarded',
}

@Injectable()
export class DatasetService {
  constructor(private prisma: PrismaService) {}

  async categorizeValidatedData() {
    // Get all speech recordings that have been validated (isValidated=true)
    const recordings = await this.prisma.speechRecording.findMany({
      where: { isValidated: true },
      include: {
        validations: true,
      },
    });

    const categorized: Array<{
      id: string;
      createdAt: Date;
      resourceType: string;
      resourceId: string;
      category: DatasetCategory;
      voteCount: number;
      positiveVoteCount: number;
      votePercentage: number;
      categorizedAt: Date;
    }> = [];

    for (const recording of recordings) {
      const totalVotes = recording.validations.length;
      const positiveVotes = recording.validations.filter(
        (v) => v.isValid,
      ).length;
      const votePercentage =
        totalVotes > 0 ? (positiveVotes / totalVotes) * 100 : 0;

      let category: DatasetCategory;
      if (votePercentage >= 81) {
        category = DatasetCategory.TRAINING;
      } else if (votePercentage >= 61) {
        category = DatasetCategory.EVALUATION;
      } else if (votePercentage >= 41) {
        category = DatasetCategory.TESTING;
      } else {
        category = DatasetCategory.DISCARDED;
      }

      // Check if already categorized
      const existing = await this.prisma.datasetCategory.findFirst({
        where: {
          resourceType: 'speech_recording',
          resourceId: recording.id,
        },
      });

      if (!existing) {
        const datasetCategory = await this.prisma.datasetCategory.create({
          data: {
            resourceType: 'speech_recording',
            resourceId: recording.id,
            category,
            voteCount: totalVotes,
            positiveVoteCount: positiveVotes,
            votePercentage,
          },
        });

        categorized.push({
          ...datasetCategory,
          category: datasetCategory.category as DatasetCategory,
        });
      }
    }

    return {
      success: true,
      categorized: categorized.length,
      breakdown: {
        training: categorized.filter(
          (c) => c.category === DatasetCategory.TRAINING,
        ).length,
        evaluation: categorized.filter(
          (c) => c.category === DatasetCategory.EVALUATION,
        ).length,
        testing: categorized.filter(
          (c) => c.category === DatasetCategory.TESTING,
        ).length,
        discarded: categorized.filter(
          (c) => c.category === DatasetCategory.DISCARDED,
        ).length,
      },
    };
  }

  async getDatasetStats() {
    const [training, evaluation, testing, discarded] = await Promise.all([
      this.prisma.datasetCategory.count({
        where: { category: DatasetCategory.TRAINING },
      }),
      this.prisma.datasetCategory.count({
        where: { category: DatasetCategory.EVALUATION },
      }),
      this.prisma.datasetCategory.count({
        where: { category: DatasetCategory.TESTING },
      }),
      this.prisma.datasetCategory.count({
        where: { category: DatasetCategory.DISCARDED },
      }),
    ]);

    return {
      training,
      evaluation,
      testing,
      discarded,
      total: training + evaluation + testing + discarded,
    };
  }
}
