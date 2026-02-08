import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class AnalyticsService {
  constructor(private prisma: PrismaService) {}

  async getUserEngagementStats() {
    const [
      totalUsers,
      activeUsers,
      totalContributions,
      totalRecordings,
      totalValidations,
    ] = await Promise.all([
      this.prisma.user.count({ where: { deleted_at: null } }),
      this.prisma.userActivity
        .findMany({
          where: {
            action: 'contribution',
            timestamp: {
              gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), // Last 30 days
            },
          },
          distinct: ['userId'],
        })
        .then((results) => results.length),
      this.prisma.userProgress.count(),
      this.prisma.speechRecording.count(),
      this.prisma.validation.count(),
    ]);

    return {
      totalUsers,
      activeUsers,
      totalContributions,
      totalRecordings,
      totalValidations,
    };
  }

  async getContributionStats() {
    // Gender-wise contributions
    const genderStats = await this.prisma.audioMetadata.groupBy({
      by: ['gender'],
      _count: { id: true },
      _sum: { audioDuration: true },
    });

    // Language-wise contributions
    const languageStats = await this.prisma.audioMetadata.groupBy({
      by: ['languageCode'],
      _count: { id: true },
      _sum: { audioDuration: true },
    });

    // Age group-wise contributions
    const ageGroupStats = await this.prisma.audioMetadata.groupBy({
      by: ['ageGroup'],
      _count: { id: true },
      _sum: { audioDuration: true },
    });

    // Region-wise contributions
    const regionStats = await this.prisma.audioMetadata.groupBy({
      by: ['region'],
      _count: { id: true },
      _sum: { audioDuration: true },
    });

    // State-wise contributions
    const stateStats = await this.prisma.audioMetadata.groupBy({
      by: ['state'],
      _count: { id: true },
      _sum: { audioDuration: true },
    });

    return {
      gender: genderStats,
      language: languageStats,
      ageGroup: ageGroupStats,
      region: regionStats,
      state: stateStats,
    };
  }

  async getAudioSecondsStats() {
    const [ageGroupAudio, regionAudio, stateAudio, languageAudio] =
      await Promise.all([
        this.prisma.audioMetadata.groupBy({
          by: ['ageGroup'],
          _sum: { audioDuration: true },
          _count: { id: true },
        }),
        this.prisma.audioMetadata.groupBy({
          by: ['region'],
          _sum: { audioDuration: true },
          _count: { id: true },
        }),
        this.prisma.audioMetadata.groupBy({
          by: ['state'],
          _sum: { audioDuration: true },
          _count: { id: true },
        }),
        this.prisma.audioMetadata.groupBy({
          by: ['languageCode'],
          _sum: { audioDuration: true },
          _count: { id: true },
        }),
      ]);

    return {
      ageGroup: ageGroupAudio,
      region: regionAudio,
      state: stateAudio,
      language: languageAudio,
    };
  }
}
