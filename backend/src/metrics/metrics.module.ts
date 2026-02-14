import { Module, forwardRef } from '@nestjs/common';
import { MetricsService } from './metrics.service';
import { MetricsController } from './metrics.controller';
import { QueueModule } from '../queue/queue.module';
import { CacheModule } from '../cache/cache.module';

@Module({
  imports: [
    forwardRef(() => QueueModule),
    forwardRef(() => CacheModule),
  ],
  controllers: [MetricsController],
  providers: [MetricsService],
  exports: [MetricsService],
})
export class MetricsModule { }
