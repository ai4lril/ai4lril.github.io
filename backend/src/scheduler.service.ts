import { Injectable, Logger } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { DatasetService } from './dataset/dataset.service';
import { StreakService } from './gamification/streak.service';
import { LeaderboardService } from './gamification/leaderboard.service';
import { ExportService } from './export/export.service';

@Injectable()
export class SchedulerService {
  private readonly logger = new Logger(SchedulerService.name);

  constructor(
    private datasetService: DatasetService,
    private streakService: StreakService,
    private leaderboardService: LeaderboardService,
    private exportService: ExportService,
  ) {}

  // Run on last Sunday of each month at 2 AM
  @Cron('0 2 * * 0', {
    timeZone: 'UTC',
  })
  async handleDatasetCategorization() {
    // Check if it's the last Sunday of the month
    const now = new Date();
    const lastSunday = this.getLastSundayOfMonth(
      now.getFullYear(),
      now.getMonth(),
    );

    // Check if today is the last Sunday
    if (
      now.getDate() === lastSunday.getDate() &&
      now.getMonth() === lastSunday.getMonth() &&
      now.getFullYear() === lastSunday.getFullYear()
    ) {
      this.logger.log(
        'Running dataset categorization job (last Sunday of month)',
      );
      try {
        const result = await this.datasetService.categorizeValidatedData();
        this.logger.log(
          `Dataset categorization completed: ${JSON.stringify(result)}`,
        );
      } catch (error) {
        const errorMessage =
          error instanceof Error ? error.message : 'Unknown error';
        this.logger.error(`Error in dataset categorization: ${errorMessage}`);
      }
    }
  }

  private getLastSundayOfMonth(year: number, month: number): Date {
    const lastDay = new Date(year, month + 1, 0);
    const dayOfWeek = lastDay.getDay();
    const daysToSubtract = dayOfWeek === 0 ? 0 : dayOfWeek;
    const lastSunday = new Date(lastDay);
    lastSunday.setDate(lastDay.getDate() - daysToSubtract);
    return lastSunday;
  }

  // Daily streak reset at midnight UTC
  @Cron('0 0 * * *', {
    timeZone: 'UTC',
  })
  async handleDailyStreakReset() {
    this.logger.log('Running daily streak reset');
    try {
      await this.streakService.resetDailyProgress();
      this.logger.log('Daily streak reset completed');
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'Unknown error';
      this.logger.error(`Error in daily streak reset: ${errorMessage}`);
    }
  }

  // Update leaderboards every hour
  @Cron('0 * * * *', {
    timeZone: 'UTC',
  })
  async handleLeaderboardUpdate() {
    this.logger.log('Updating leaderboards');
    try {
      await this.leaderboardService.updateLeaderboard('global');
      await this.leaderboardService.updateLeaderboard('weekly');
      await this.leaderboardService.updateLeaderboard('monthly');
      this.logger.log('Leaderboard update completed');
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'Unknown error';
      this.logger.error(`Error updating leaderboards: ${errorMessage}`);
    }
  }

  // Scheduled exports on June 30 and December 31 at 11:30 PM
  @Cron('30 23 30 6 *', {
    timeZone: 'UTC',
  })
  async handleJuneExport() {
    this.logger.log('Running scheduled export for June 30');
    try {
      await this.exportService.createExportJob(
        null, // System export
        'analytics',
        'json',
        { period: 'first_half' },
      );
      this.logger.log('June export job created');
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'Unknown error';
      this.logger.error(`Error creating June export: ${errorMessage}`);
    }
  }

  @Cron('30 23 31 12 *', {
    timeZone: 'UTC',
  })
  async handleDecemberExport() {
    this.logger.log('Running scheduled export for December 31');
    try {
      await this.exportService.createExportJob(
        null, // System export
        'analytics',
        'json',
        { period: 'second_half' },
      );
      this.logger.log('December export job created');
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'Unknown error';
      this.logger.error(`Error creating December export: ${errorMessage}`);
    }
  }
}
