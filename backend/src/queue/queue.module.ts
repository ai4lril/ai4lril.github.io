import { Module, forwardRef } from '@nestjs/common';
import { WebhookModule } from '../webhook/webhook.module';
import { BullModule } from '@nestjs/bullmq';
import { AudioUploadProcessor } from './media-upload.processor';
import { VideoUploadProcessor } from './media-upload.processor';
import { MediaProcessingProcessor } from './media-upload.processor';
import { QueueService } from './queue.service';
import { QueueController } from './queue.controller';
import { SpeechModule } from '../speech/speech.module';
import { QuestionModule } from '../question/question.module';
import { CommunityModule } from '../community/community.module';
import { StorageModule } from '../storage/storage.module';

// Parse Redis URL or use individual settings
const getRedisConnection = () => {
  const redisUrl = process.env.REDIS_URL || process.env.CACHE_URL;

  if (redisUrl) {
    // Parse URL format: redis://host:port or redis://:password@host:port
    const url = new URL(redisUrl);
    return {
      host: url.hostname,
      port: parseInt(url.port || '6379', 10),
      password: url.password || undefined,
    };
  }

  // Fallback to individual environment variables or defaults
  // Use internal Docker network hostname if in Docker, otherwise localhost
  const isDocker = process.env.NODE_ENV === 'production' || process.env.DOCKER_ENV === 'true';
  return {
    host: process.env.REDIS_HOST || (isDocker ? 'dragonfly' : 'localhost'),
    port: parseInt(process.env.REDIS_PORT || (isDocker ? '6379' : '6378'), 10),
    password: process.env.REDIS_PASSWORD,
  };
};

@Module({
  imports: [
    BullModule.forRoot({
      connection: getRedisConnection(),
      defaultJobOptions: {
        attempts: 3,
        backoff: {
          type: 'exponential',
          delay: 2000, // Start with 2 seconds
        },
        removeOnComplete: {
          age: 24 * 3600, // Keep completed jobs for 24 hours
          count: 1000, // Keep max 1000 completed jobs
        },
        removeOnFail: {
          age: 7 * 24 * 3600, // Keep failed jobs for 7 days
        },
      },
    }),
    // Register queues - use hashtags {name} for Dragonfly compatibility
    // (requires Dragonfly --cluster_mode=emulated --lock_on_hashtags)
    BullModule.registerQueue(
      {
        name: '{media-upload-audio}',
        defaultJobOptions: {
          priority: 5, // Default priority
          attempts: 3,
        },
      },
      {
        name: '{media-upload-video}',
        defaultJobOptions: {
          priority: 5, // Default priority
          attempts: 3,
        },
      },
      {
        name: '{media-processing}',
        defaultJobOptions: {
          priority: 3, // Lower priority for processing tasks
          attempts: 5, // More attempts for processing
        },
      },
      {
        name: '{webhook-delivery}',
        defaultJobOptions: {
          priority: 4,
          attempts: 5,
          backoff: { type: 'exponential', delay: 2000 },
        },
      },
    ),
    forwardRef(() => SpeechModule),
    forwardRef(() => QuestionModule),
    forwardRef(() => CommunityModule),
    forwardRef(() => WebhookModule),
    StorageModule,
  ],
  controllers: [QueueController],
  providers: [
    AudioUploadProcessor,
    VideoUploadProcessor,
    MediaProcessingProcessor,
    QueueService,
  ],
  exports: [BullModule, QueueService],
})
export class QueueModule { }
