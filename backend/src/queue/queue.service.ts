import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { InjectQueue } from '@nestjs/bullmq';
import { Queue, Job } from 'bullmq';
import { MediaUploadJobData } from './interfaces/media-upload-job.interface';

@Injectable()
export class QueueService {
  private readonly logger = new Logger(QueueService.name);

  constructor(
    @InjectQueue('{media-upload-audio}') private audioQueue: Queue,
    @InjectQueue('{media-upload-video}') private videoQueue: Queue,
    @InjectQueue('{media-processing}') private processingQueue: Queue,
  ) { }

  /**
   * Add audio upload job to queue
   */
  async addAudioUploadJob(
    jobData: MediaUploadJobData,
    priority?: number,
  ): Promise<Job<MediaUploadJobData>> {
    const job = await this.audioQueue.add('upload-audio', jobData, {
      priority: priority || jobData.priority || 5,
      jobId: `audio-${Date.now()}-${Math.random().toString(36).substring(7)}`,
    });

    this.logger.log(`Added audio upload job ${job.id} to queue`);
    return job;
  }

  /**
   * Add video upload job to queue
   */
  async addVideoUploadJob(
    jobData: MediaUploadJobData,
    priority?: number,
  ): Promise<Job<MediaUploadJobData>> {
    const job = await this.videoQueue.add('upload-video', jobData, {
      priority: priority || jobData.priority || 5,
      jobId: `video-${Date.now()}-${Math.random().toString(36).substring(7)}`,
    });

    this.logger.log(`Added video upload job ${job.id} to queue`);
    return job;
  }

  /**
   * Get job status by ID
   */
  async getJobStatus(jobId: string): Promise<{
    id: string;
    status: string;
    progress?: number;
    result?: any;
    error?: string;
    createdAt: Date;
    processedAt?: Date;
    finishedAt?: Date;
  }> {
    // Try to find job in audio queue
    let job = await this.audioQueue.getJob(jobId);
    // let queue = this.audioQueue;

    // If not found, try video queue
    if (!job) {
      job = await this.videoQueue.getJob(jobId);
      // queue = this.videoQueue;
    }

    // If still not found, try processing queue
    if (!job) {
      job = await this.processingQueue.getJob(jobId);
      // queue = this.processingQueue;
    }

    if (!job) {
      throw new NotFoundException(`Job ${jobId} not found`);
    }

    const state = await job.getState();
    const jobData = job as { id?: string; progress?: number; returnvalue?: unknown; failedReason?: string; timestamp?: number; processedOn?: number; finishedOn?: number };

    return {
      id: jobData.id ?? jobId,
      status: state,
      progress: typeof jobData.progress === 'number' ? jobData.progress : undefined,
      result: jobData.returnvalue ?? undefined,
      error: jobData.failedReason ?? undefined,
      createdAt: new Date(jobData.timestamp ?? Date.now()),
      processedAt: jobData.processedOn ? new Date(jobData.processedOn) : undefined,
      finishedAt: jobData.finishedOn ? new Date(jobData.finishedOn) : undefined,
    };
  }

  /**
   * Get queue statistics
   * Note: getJobCounts() can fail with Dragonfly when queues are empty (Lua script undeclared key).
   * We catch and return zeros to avoid spamming logs.
   */
  async getQueueStats() {
    const emptyStats = { waiting: 0, active: 0, completed: 0, failed: 0, delayed: 0 };

    const getCounts = async (queue: Queue) => {
      try {
        return await queue.getJobCounts();
      } catch {
        return emptyStats;
      }
    };

    const [audioStats, videoStats, processingStats] = await Promise.all([
      getCounts(this.audioQueue),
      getCounts(this.videoQueue),
      getCounts(this.processingQueue),
    ]);

    return {
      'media-upload-audio': {
        waiting: audioStats.waiting,
        active: audioStats.active,
        completed: audioStats.completed,
        failed: audioStats.failed,
        delayed: audioStats.delayed,
        total: audioStats.waiting + audioStats.active + audioStats.completed + audioStats.failed + (audioStats.delayed || 0),
      },
      'media-upload-video': {
        waiting: videoStats.waiting,
        active: videoStats.active,
        completed: videoStats.completed,
        failed: videoStats.failed,
        delayed: videoStats.delayed,
        total: videoStats.waiting + videoStats.active + videoStats.completed + videoStats.failed + (videoStats.delayed || 0),
      },
      'media-processing': {
        waiting: processingStats.waiting,
        active: processingStats.active,
        completed: processingStats.completed,
        failed: processingStats.failed,
        delayed: processingStats.delayed,
        total: processingStats.waiting + processingStats.active + processingStats.completed + processingStats.failed + (processingStats.delayed || 0),
      },
    };
  }

  /**
   * Get Prometheus metrics for queues
   */
  async getPrometheusMetrics(): Promise<string> {
    const stats = await this.getQueueStats();
    // const timestamp = Date.now();

    let metrics = '# Queue Metrics\n';
    metrics += '# TYPE queue_jobs_waiting gauge\n';
    metrics += `queue_jobs_waiting{queue="media-upload-audio"} ${stats['media-upload-audio'].waiting}\n`;
    metrics += `queue_jobs_waiting{queue="media-upload-video"} ${stats['media-upload-video'].waiting}\n`;
    metrics += `queue_jobs_waiting{queue="media-processing"} ${stats['media-processing'].waiting}\n\n`;

    metrics += '# TYPE queue_jobs_active gauge\n';
    metrics += `queue_jobs_active{queue="media-upload-audio"} ${stats['media-upload-audio'].active}\n`;
    metrics += `queue_jobs_active{queue="media-upload-video"} ${stats['media-upload-video'].active}\n`;
    metrics += `queue_jobs_active{queue="media-processing"} ${stats['media-processing'].active}\n\n`;

    metrics += '# TYPE queue_jobs_completed counter\n';
    metrics += `queue_jobs_completed{queue="media-upload-audio"} ${stats['media-upload-audio'].completed}\n`;
    metrics += `queue_jobs_completed{queue="media-upload-video"} ${stats['media-upload-video'].completed}\n`;
    metrics += `queue_jobs_completed{queue="media-processing"} ${stats['media-processing'].completed}\n\n`;

    metrics += '# TYPE queue_jobs_failed counter\n';
    metrics += `queue_jobs_failed{queue="media-upload-audio"} ${stats['media-upload-audio'].failed}\n`;
    metrics += `queue_jobs_failed{queue="media-upload-video"} ${stats['media-upload-video'].failed}\n`;
    metrics += `queue_jobs_failed{queue="media-processing"} ${stats['media-processing'].failed}\n\n`;

    metrics += '# TYPE queue_jobs_total gauge\n';
    metrics += `queue_jobs_total{queue="media-upload-audio"} ${stats['media-upload-audio'].total}\n`;
    metrics += `queue_jobs_total{queue="media-upload-video"} ${stats['media-upload-video'].total}\n`;
    metrics += `queue_jobs_total{queue="media-processing"} ${stats['media-processing'].total}\n`;

    return metrics;
  }

  /**
   * Get health check for queues
   */
  async getHealth() {
    const stats = await this.getQueueStats();

    // Check if queues are healthy
    const audioHealthy = stats['media-upload-audio'].failed < 100; // Less than 100 failed jobs
    const videoHealthy = stats['media-upload-video'].failed < 100;
    const processingHealthy = stats['media-processing'].failed < 100;

    const isHealthy = audioHealthy && videoHealthy && processingHealthy;

    return {
      status: isHealthy ? 'healthy' : 'degraded',
      queues: {
        'media-upload-audio': {
          healthy: audioHealthy,
          ...stats['media-upload-audio'],
        },
        'media-upload-video': {
          healthy: videoHealthy,
          ...stats['media-upload-video'],
        },
        'media-processing': {
          healthy: processingHealthy,
          ...stats['media-processing'],
        },
      },
      timestamp: new Date().toISOString(),
    };
  }
}
