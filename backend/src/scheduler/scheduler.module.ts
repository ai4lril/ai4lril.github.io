import { Module } from '@nestjs/common';
import { ScheduleModule } from '@nestjs/schedule';
import { SchedulerService } from './scheduler.service';
import { DatasetModule } from '../dataset/dataset.module';

@Module({
  imports: [ScheduleModule.forRoot(), DatasetModule],
  providers: [SchedulerService],
})
export class SchedulerModule {}
