import { Injectable, Logger } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { DatasetService } from '../dataset/dataset.service';

@Injectable()
export class SchedulerService {
  private readonly logger = new Logger(SchedulerService.name);

  constructor(private datasetService: DatasetService) {}

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
}
