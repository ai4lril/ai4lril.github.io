import { Module } from '@nestjs/common';
import { SpeechController } from './speech.controller';
import { SpeechService } from './speech.service';
import { PrismaModule } from './prisma/prisma.module';
import { StorageModule } from './storage/storage.module';
import { ProgressModule } from './progress/progress.module';

@Module({
  imports: [PrismaModule, StorageModule, ProgressModule],
  controllers: [SpeechController],
  providers: [SpeechService],
  exports: [SpeechService],
})
export class SpeechModule {}
