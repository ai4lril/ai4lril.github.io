import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';
import { getQueueToken } from '@nestjs/bullmq';
import { QueueService } from './queue.service';
import { MediaUploadJobData } from './interfaces/media-upload-job.interface';

const mockJob = {
  id: 'job-1',
  getState: jest.fn().mockResolvedValue('completed'),
  progress: 100,
  returnvalue: { success: true },
  failedReason: undefined,
  timestamp: Date.now(),
  processedOn: Date.now(),
  finishedOn: Date.now(),
};

const mockAudioQueue = {
  add: jest.fn().mockResolvedValue(mockJob),
  getJob: jest.fn().mockResolvedValue(mockJob),
  getJobCounts: jest.fn().mockResolvedValue({
    waiting: 0,
    active: 1,
    completed: 10,
    failed: 0,
    delayed: 0,
  }),
};

const mockVideoQueue = {
  add: jest.fn().mockResolvedValue(mockJob),
  getJob: jest.fn().mockResolvedValue(null),
  getJobCounts: jest.fn().mockResolvedValue({
    waiting: 0,
    active: 0,
    completed: 5,
    failed: 0,
    delayed: 0,
  }),
};

const mockProcessingQueue = {
  getJob: jest.fn().mockResolvedValue(null),
  getJobCounts: jest.fn().mockResolvedValue({
    waiting: 0,
    active: 0,
    completed: 0,
    failed: 0,
    delayed: 0,
  }),
};

describe('QueueService', () => {
  let service: QueueService;

  beforeEach(async () => {
    jest.clearAllMocks();
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        QueueService,
        {
          provide: getQueueToken('{media-upload-audio}'),
          useValue: mockAudioQueue,
        },
        {
          provide: getQueueToken('{media-upload-video}'),
          useValue: mockVideoQueue,
        },
        {
          provide: getQueueToken('{media-processing}'),
          useValue: mockProcessingQueue,
        },
      ],
    }).compile();

    service = module.get<QueueService>(QueueService);
  });

  describe('addAudioUploadJob', () => {
    it('should add job to audio queue and return job', async () => {
      const jobData: MediaUploadJobData = {
        mediaBuffer: Buffer.from('audio'),
        fileName: 'test.webm',
        contentType: 'audio/webm',
        mediaType: 'audio',
        userId: 'user-1',
        sentenceId: 's1',
      };

      const result = await service.addAudioUploadJob(jobData);

      expect(result).toEqual(mockJob);
      expect(mockAudioQueue.add).toHaveBeenCalledWith(
        'upload-audio',
        jobData,
        expect.objectContaining({
          priority: 5,
          jobId: expect.stringMatching(/^audio-/),
        }),
      );
    });
  });

  describe('addVideoUploadJob', () => {
    it('should add job to video queue', async () => {
      const jobData: MediaUploadJobData = {
        mediaBuffer: Buffer.from('video'),
        fileName: 'test.mp4',
        contentType: 'video/mp4',
        mediaType: 'video',
      };

      const result = await service.addVideoUploadJob(jobData);

      expect(result).toEqual(mockJob);
      expect(mockVideoQueue.add).toHaveBeenCalledWith(
        'upload-video',
        jobData,
        expect.any(Object),
      );
    });
  });

  describe('getJobStatus', () => {
    it('should return job status when found in audio queue', async () => {
      const result = await service.getJobStatus('job-1');

      expect(result).toMatchObject({
        id: 'job-1',
        status: 'completed',
        progress: 100,
        result: { success: true },
      });
    });

    it('should throw NotFoundException when job not found', async () => {
      mockAudioQueue.getJob.mockResolvedValue(null);
      mockVideoQueue.getJob.mockResolvedValue(null);
      mockProcessingQueue.getJob.mockResolvedValue(null);

      await expect(service.getJobStatus('missing-job')).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('getQueueStats', () => {
    it('should return stats for all queues', async () => {
      const result = await service.getQueueStats();

      expect(result['media-upload-audio']).toMatchObject({
        waiting: 0,
        active: 1,
        completed: 10,
      });
      expect(result['media-upload-video']).toBeDefined();
      expect(result['media-processing']).toBeDefined();
    });
  });
});
