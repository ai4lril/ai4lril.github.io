import { Module } from '@nestjs/common';
import { ScheduleModule } from '@nestjs/schedule';
import { SchedulerService } from './scheduler.service';
import { DatasetModule } from './dataset/dataset.module';
import { GamificationModule } from './gamification/gamification.module';
import { ExportModule } from './export/export.module';

@Module({
  imports: [
    ScheduleModule.forRoot(),
    DatasetModule,
    GamificationModule,
    ExportModule,
  ],
  providers: [SchedulerService],
  exports: [SchedulerService],
})
export class SchedulerModule {}
