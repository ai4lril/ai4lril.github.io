import { Module, Global, forwardRef } from '@nestjs/common';
import { ScheduleModule } from '@nestjs/schedule';
import { CacheService } from './cache.service';
import { CacheInvalidationService } from './cache-invalidation.service';
import { CacheWarmingService } from './cache-warming.service';
import { CacheWarmingController } from './cache-warming.controller';
import { CacheStatsController } from './cache-stats.controller';
import { SpeechModule } from '../speech/speech.module';
import { QuestionModule } from '../question/question.module';
import { SearchModule } from '../search/search.module';
import { CommunityModule } from '../community/community.module';
import { PrismaModule } from '../prisma/prisma.module';

@Global()
@Module({
  imports: [
    ScheduleModule.forRoot(),
    PrismaModule,
    forwardRef(() => SpeechModule),
    forwardRef(() => QuestionModule),
    forwardRef(() => SearchModule),
    forwardRef(() => CommunityModule),
  ],
  providers: [
    CacheService,
    CacheInvalidationService,
    CacheWarmingService,
  ],
  controllers: [CacheWarmingController, CacheStatsController],
  exports: [CacheService, CacheInvalidationService, CacheWarmingService],
})
export class CacheModule { }
