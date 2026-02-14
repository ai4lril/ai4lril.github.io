import { Module, forwardRef } from '@nestjs/common';
import { SpeechController } from './speech.controller';
import { SpeechService } from './speech.service';
import { PrismaModule } from '../prisma/prisma.module';
import { StorageModule } from '../storage/storage.module';
import { ProgressModule } from '../progress/progress.module';
import { CacheModule } from '../cache/cache.module';
import { QueueModule } from '../queue/queue.module';
import { RealtimeModule } from '../realtime/realtime.module';

@Module({
  imports: [
    PrismaModule,
    StorageModule,
    forwardRef(() => ProgressModule),
    forwardRef(() => CacheModule),
    forwardRef(() => QueueModule),
    RealtimeModule,
  ],
  controllers: [SpeechController],
  providers: [SpeechService],
  exports: [SpeechService],
})
export class SpeechModule { }
