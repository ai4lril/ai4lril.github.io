import { Module } from '@nestjs/common';
import { NlpService } from './nlp.service';
import { NlpController } from './nlp.controller';
import { PrismaModule } from '../prisma/prisma.module';
import { CacheModule } from '../cache/cache.module';
import { LoggerModule } from '../logger/logger.module';
import { ProgressModule } from '../progress/progress.module';

@Module({
  imports: [PrismaModule, CacheModule, LoggerModule, ProgressModule],
  providers: [NlpService],
  controllers: [NlpController],
})
export class NlpModule {}
