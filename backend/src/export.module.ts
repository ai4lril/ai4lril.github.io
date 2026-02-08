import { Module } from '@nestjs/common';
import { ExportService } from './export.service';
import { ExportController } from './export.controller';
import { DatasetExportService } from './dataset-export.service';
import { PrismaModule } from './prisma/prisma.module';
import { StorageModule } from './storage/storage.module';
import { CacheModule } from './cache/cache.module';
import { LoggerModule } from './logger/logger.module';

@Module({
  imports: [PrismaModule, StorageModule, CacheModule, LoggerModule],
  providers: [ExportService, DatasetExportService],
  controllers: [ExportController],
  exports: [ExportService, DatasetExportService],
})
export class ExportModule {}
