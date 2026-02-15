import { Processor, WorkerHost, OnWorkerEvent } from '@nestjs/bullmq';
import { Job } from 'bullmq';
import { Injectable, Logger, BadRequestException } from '@nestjs/common';
import { MediaUploadJobData, MediaUploadJobResult } from './interfaces/media-upload-job.interface';
import { SpeechService } from '../speech/speech.service';
import { QuestionService } from '../question/question.service';
import { AudioBlogService } from '../community/audio-blog.service';
import { VideoBlogService } from '../community/video-blog.service';
import { StorageService } from '../storage/storage.service';

/**
 * Processor for audio upload jobs
 * Configured with concurrency for worker scaling
 */
@Processor('{media-upload-audio}', {
  concurrency: parseInt(process.env.AUDIO_UPLOAD_CONCURRENCY || '5', 10), // Process 5 jobs concurrently by default
})
@Injectable()
export class AudioUploadProcessor extends WorkerHost {
  private readonly logger = new Logger(AudioUploadProcessor.name);

  constructor(
    private readonly speechService: SpeechService,
    private readonly questionService: QuestionService,
    private readonly audioBlogService: AudioBlogService,
    private readonly storageService: StorageService,
  ) {
    super();
  }

  async process(job: Job<MediaUploadJobData>): Promise<MediaUploadJobResult> {
    const { data } = job;
    const startTime = Date.now();
    this.logger.log(`Processing audio upload job ${job.id} for user ${data.userId || 'anonymous'}`);

    // Update job progress
    await job.updateProgress(10);

    try {
      // Extract format from contentType or fileName
      const format = data.contentType
        ? data.contentType.split('/')[1]
        : data.fileName.split('.').pop() || 'webm';

      // Route to appropriate service based on job type
      if (data.sentenceId) {
        // Speech recording
        return await this.processSpeechRecording(job, format);
      } else if (data.questionSubmissionId) {
        // Question answer
        return await this.processQuestionAnswer(job, format);
      } else if (data.title && data.languageCode) {
        // Audio blog
        return await this.processAudioBlog(job, format);
      } else {
        throw new BadRequestException(
          'Invalid job data: missing sentenceId, questionSubmissionId, or blog metadata',
        );
      }

      // Update progress to 100% on success
      await job.updateProgress(100);
      const duration = Date.now() - startTime;
      this.logger.log(`Audio upload job ${job.id} completed in ${duration}ms`);
    } catch (error) {
      const duration = Date.now() - startTime;
      this.logger.error(
        `Failed to process audio upload job ${job.id} after ${duration}ms:`,
        error instanceof Error ? error.message : error,
      );
      throw error; // Re-throw to trigger retry logic
    }
  }

  private async processSpeechRecording(
    job: Job<MediaUploadJobData>,
    format: string,
  ): Promise<MediaUploadJobResult> {
    const { data } = job;

    if (!data.sentenceId) {
      throw new BadRequestException('sentenceId is required for speech recordings');
    }

    if (!data.duration) {
      throw new BadRequestException('duration is required for speech recordings');
    }

    const result = await this.speechService.saveSpeechRecording(
      data.sentenceId,
      data.mediaBuffer,
      format,
      data.duration,
      data.userId,
      data.mediaType || 'audio',
    );

    // saveSpeechRecording returns { success: true, recordingId: string }
    // We need to fetch the recording to get the blobStorageLink if needed
    return {
      success: true,
      recordingId: result.recordingId,
    };
  }

  private async processQuestionAnswer(
    job: Job<MediaUploadJobData>,
    format: string,
  ): Promise<MediaUploadJobResult> {
    const { data } = job;

    if (!data.questionSubmissionId) {
      throw new BadRequestException('questionSubmissionId is required for question answers');
    }

    if (!data.duration) {
      throw new BadRequestException('duration is required for question answers');
    }

    if (!data.userId) {
      throw new BadRequestException('userId is required for question answers');
    }

    const result = await this.questionService.saveAnswer(
      data.questionSubmissionId,
      data.mediaBuffer,
      format,
      data.duration,
      data.userId,
    );

    // The result from saveAnswer doesn't return the answer object directly
    // We need to fetch it or return what we have
    return {
      success: true,
      recordingId: result.answerId || result.id,
    };
  }

  private async processAudioBlog(
    job: Job<MediaUploadJobData>,
    format: string,
  ): Promise<MediaUploadJobResult> {
    const { data } = job;
    console.log('format', format);

    if (!data.userId) {
      throw new BadRequestException('userId is required for audio blogs');
    }

    if (!data.languageCode) {
      throw new BadRequestException('languageCode is required for audio blogs');
    }

    if (!data.title) {
      throw new BadRequestException('title is required for audio blogs');
    }

    // Note: audio-blog service has incorrect uploadMedia call signature
    // It passes 'audio' as contentType instead of proper MIME type
    // This will need to be fixed in the service, but for now we work with it
    const audioBlog = await this.audioBlogService.createAudioBlog(
      data.userId,
      data.languageCode,
      data.title,
      data.description || '',
      data.mediaBuffer,
      data.fileName,
      data.duration,
    );

    return {
      success: true,
      blobStorageLink: audioBlog.audioFile,
      recordingId: audioBlog.id,
    };
  }

  @OnWorkerEvent('completed')
  onCompleted(job: Job<MediaUploadJobData>) {
    this.logger.log(`Audio upload job ${job.id} completed successfully`);
  }

  @OnWorkerEvent('failed')
  onFailed(job: Job<MediaUploadJobData>, error: Error) {
    this.logger.error(
      `Audio upload job ${job.id} failed: ${error.message}`,
      error.stack,
    );
  }
}

/**
 * Processor for video upload jobs
 * Configured with concurrency for worker scaling
 * Lower concurrency for video due to larger file sizes
 */
@Processor('{media-upload-video}', {
  concurrency: parseInt(process.env.VIDEO_UPLOAD_CONCURRENCY || '3', 10), // Process 3 jobs concurrently by default
})
@Injectable()
export class VideoUploadProcessor extends WorkerHost {
  private readonly logger = new Logger(VideoUploadProcessor.name);

  constructor(
    private readonly speechService: SpeechService,
    private readonly videoBlogService: VideoBlogService,
  ) {
    super();
  }

  async process(job: Job<MediaUploadJobData>): Promise<MediaUploadJobResult> {
    const { data } = job;
    const startTime = Date.now();
    this.logger.log(`Processing video upload job ${job.id} for user ${data.userId || 'anonymous'}`);

    // Update job progress
    await job.updateProgress(10);

    try {
      // Extract format from contentType or fileName
      const format = data.contentType
        ? data.contentType.split('/')[1]
        : data.fileName.split('.').pop() || 'webm';

      // Route to appropriate service based on job type
      if (data.sentenceId) {
        // Speech recording (video)
        return await this.processSpeechRecording(job, format);
      } else if (data.title && data.languageCode) {
        // Video blog
        return await this.processVideoBlog(job, format);
      } else {
        throw new BadRequestException(
          'Invalid job data: missing sentenceId or blog metadata',
        );
      }

      // Update progress to 100% on success
      await job.updateProgress(100);
      const duration = Date.now() - startTime;
      this.logger.log(`Video upload job ${job.id} completed in ${duration}ms`);
    } catch (error) {
      const duration = Date.now() - startTime;
      this.logger.error(
        `Failed to process video upload job ${job.id} after ${duration}ms:`,
        error instanceof Error ? error.message : error,
      );
      throw error; // Re-throw to trigger retry logic
    }
  }

  private async processSpeechRecording(
    job: Job<MediaUploadJobData>,
    format: string,
  ): Promise<MediaUploadJobResult> {
    const { data } = job;

    if (!data.sentenceId) {
      throw new BadRequestException('sentenceId is required for speech recordings');
    }

    if (!data.duration) {
      throw new BadRequestException('duration is required for speech recordings');
    }

    const result = await this.speechService.saveSpeechRecording(
      data.sentenceId,
      data.mediaBuffer,
      format,
      data.duration,
      data.userId,
      'video',
    );

    return {
      success: true,
      recordingId: result.recordingId,
    };
  }

  private async processVideoBlog(
    job: Job<MediaUploadJobData>,
    format: string,
  ): Promise<MediaUploadJobResult> {
    const { data } = job;
    console.log('format', format);

    if (!data.userId) {
      throw new BadRequestException('userId is required for video blogs');
    }

    if (!data.languageCode) {
      throw new BadRequestException('languageCode is required for video blogs');
    }

    if (!data.title) {
      throw new BadRequestException('title is required for video blogs');
    }

    const videoBlog = await this.videoBlogService.createVideoBlog(
      data.userId,
      data.languageCode,
      data.title,
      data.description || '',
      data.mediaBuffer,
      data.fileName,
      data.thumbnailUrl,
      data.duration,
    );

    return {
      success: true,
      blobStorageLink: videoBlog.videoFile,
      recordingId: videoBlog.id,
    };
  }

  @OnWorkerEvent('completed')
  onCompleted(job: Job<MediaUploadJobData>) {
    this.logger.log(`Video upload job ${job.id} completed successfully`);
  }

  @OnWorkerEvent('failed')
  onFailed(job: Job<MediaUploadJobData>, error: Error) {
    this.logger.error(
      `Video upload job ${job.id} failed: ${error.message}`,
      error.stack,
    );
  }
}

/**
 * Processor for media processing jobs (e.g., transcoding, thumbnail generation)
 * Configured with lower concurrency for CPU-intensive tasks
 */
@Processor('{media-processing}', {
  concurrency: parseInt(process.env.MEDIA_PROCESSING_CONCURRENCY || '2', 10), // Process 2 jobs concurrently by default
})
@Injectable()
export class MediaProcessingProcessor extends WorkerHost {
  private readonly logger = new Logger(MediaProcessingProcessor.name);

  constructor(private readonly storageService: StorageService) {
    super();
  }

  async process(job: Job<MediaUploadJobData>): Promise<MediaUploadJobResult> {
    const { data } = job;
    this.logger.log(`Processing media processing job ${job.id}`);

    try {
      await Promise.resolve(); // Placeholder for future async processing
      // For now, this is a placeholder for future processing tasks
      // Examples: video transcoding, thumbnail generation, audio normalization
      // This can be extended based on requirements

      this.logger.warn('Media processing processor not yet implemented');

      return {
        success: true,
        blobStorageLink: data.mediaBuffer ? 'processed' : undefined,
      };
    } catch (error) {
      this.logger.error(
        `Failed to process media processing job ${job.id}:`,
        error instanceof Error ? error.message : error,
      );
      throw error;
    }
  }

  @OnWorkerEvent('completed')
  onCompleted(job: Job<MediaUploadJobData>) {
    this.logger.log(`Media processing job ${job.id} completed successfully`);
  }

  @OnWorkerEvent('failed')
  onFailed(job: Job<MediaUploadJobData>, error: Error) {
    this.logger.error(
      `Media processing job ${job.id} failed: ${error.message}`,
      error.stack,
    );
  }
}
