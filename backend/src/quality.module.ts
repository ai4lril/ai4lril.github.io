import { Module } from '@nestjs/common';
import { QualityService } from './quality.service';
import { QualityController } from './quality.controller';
import { IAAService } from './iaa.service';
import { AnomalyDetectionService } from './anomaly-detection.service';
import { PrismaModule } from './prisma/prisma.module';
import { CacheModule } from './cache/cache.module';
import { LoggerModule } from './logger/logger.module';

@Module({
  imports: [PrismaModule, CacheModule, LoggerModule],
  providers: [QualityService, IAAService, AnomalyDetectionService],
  controllers: [QualityController],
  exports: [QualityService, IAAService, AnomalyDetectionService],
})
export class QualityModule {}
