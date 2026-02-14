import { Module, ValidationPipe } from '@nestjs/common';
import { APP_PIPE, APP_GUARD, APP_FILTER } from '@nestjs/core';
import { AllExceptionsFilter } from './common/filters/http-exception.filter';
import { ThrottlerModule, ThrottlerGuard } from '@nestjs/throttler';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { NlpModule } from './nlp/nlp.module';
import { PrismaModule } from './prisma/prisma.module';
import { CacheModule } from './cache/cache.module';
import { LoggerModule } from './logger/logger.module';
import { AdminModule } from './admin/admin.module';
import { StorageModule } from './storage/storage.module';
import { ProgressModule } from './progress/progress.module';
import { SpeechModule } from './speech/speech.module';
import { QuestionModule } from './question/question.module';
import { WriteModule } from './write/write.module';
import { TranscriptionModule } from './transcription/transcription.module';
import { DatasetModule } from './dataset/dataset.module';
import { SchedulerModule } from './scheduler/scheduler.module';
import { UsersModule } from './users/users.module';
import { AnalyticsModule } from './analytics/analytics.module';
import { MetricsModule } from './metrics/metrics.module';
import { NotificationsModule } from './notifications/notifications.module';
import { RealtimeModule } from './realtime/realtime.module';
import { GamificationModule } from './gamification/gamification.module';
import { ExportModule } from './export/export.module';
import { QualityModule } from './quality/quality.module';
import { CommunityModule } from './community/community.module';
import { SearchModule } from './search/search.module';
import { QueueModule } from './queue/queue.module';
import { LanguagesModule } from './languages/languages.module';

@Module({
  imports: [
    ThrottlerModule.forRoot([
      {
        ttl: 60000, // 1 minute
        limit: 60, // 60 requests per minute for authenticated users
      },
      {
        name: 'short',
        ttl: 1000, // 1 second
        limit: 10, // 10 requests per second
      },
    ]),
    PrismaModule,
    AuthModule,
    NlpModule,
    CacheModule,
    LoggerModule,
    AdminModule,
    StorageModule,
    ProgressModule,
    SpeechModule,
    QuestionModule,
    WriteModule,
    TranscriptionModule,
    DatasetModule,
    SchedulerModule,
    UsersModule,
    AnalyticsModule,
    MetricsModule,
    NotificationsModule,
    RealtimeModule,
    GamificationModule,
    ExportModule,
    QualityModule,
    CommunityModule,
    SearchModule,
    QueueModule,
    LanguagesModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    {
      provide: APP_PIPE,
      useClass: ValidationPipe,
    },
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard,
    },
    {
      provide: APP_FILTER,
      useClass: AllExceptionsFilter,
    },
  ],
})
export class AppModule { }
