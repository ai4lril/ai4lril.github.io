import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException, BadRequestException } from '@nestjs/common';
import { SpeechService } from './speech.service';
import { PrismaService } from '../prisma/prisma.service';
import { StorageService } from '../storage/storage.service';
import { ProgressService } from '../progress/progress.service';
import { CacheService } from '../cache/cache.service';
import { CacheInvalidationService } from '../cache/cache-invalidation.service';
import { RealtimeGateway } from '../realtime/realtime.gateway';
import { TaskAssignmentService } from '../task-assignment/task-assignment.service';

const mockPrisma = {
  sentence: { findUnique: jest.fn(), findMany: jest.fn() },
  speechRecording: {
    create: jest.fn(),
    groupBy: jest.fn().mockResolvedValue([]),
  },
};

const mockStorage = {
  validateDuration: jest.fn(),
  uploadMedia: jest.fn().mockResolvedValue('https://minio/bucket/audio.webm'),
  extractMediaDuration: jest.fn().mockResolvedValue(null),
  saveAudioMetadata: jest.fn().mockResolvedValue({}),
};

const mockProgress = {
  isCompleted: jest.fn().mockResolvedValue(false),
  markCompleted: jest.fn().mockResolvedValue(undefined),
  excludeCompleted: jest.fn().mockImplementation((_, __, ___, sentences) => Promise.resolve(sentences)),
};

const mockCacheInvalidation = {
  invalidateSpeechRecording: jest.fn().mockResolvedValue(undefined),
};

const mockRealtimeGateway = {
  emitToUser: jest.fn(),
};

const mockTaskAssignment = {
  getUserContext: jest.fn().mockResolvedValue({ level: 1, languagesContributed: [] }),
  rankSpeechSentences: jest.fn().mockImplementation((sentences: unknown[]) => sentences),
};

describe('SpeechService', () => {
  let service: SpeechService;

  beforeEach(async () => {
    jest.clearAllMocks();
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        SpeechService,
        { provide: PrismaService, useValue: mockPrisma },
        { provide: StorageService, useValue: mockStorage },
        { provide: ProgressService, useValue: mockProgress },
        { provide: CacheService, useValue: { get: jest.fn(), set: jest.fn() } },
        { provide: CacheInvalidationService, useValue: mockCacheInvalidation },
        { provide: RealtimeGateway, useValue: mockRealtimeGateway },
        { provide: TaskAssignmentService, useValue: mockTaskAssignment },
      ],
    }).compile();

    service = module.get<SpeechService>(SpeechService);
  });

  describe('getSpeechSentences', () => {
    it('should return validated sentences for speech task', async () => {
      mockPrisma.sentence.findMany.mockResolvedValue([
        { id: 's1', text: 'Hello', languageCode: 'eng_Latn', valid: true },
      ]);

      const result = await service.getSpeechSentences(undefined, undefined, 1, 50);

      expect(result).toHaveLength(1);
      expect(mockPrisma.sentence.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { isActive: true, valid: true, taskType: 'speech' },
          take: 250,
        }),
      );
    });

    it('should filter by languageCode when provided', async () => {
      mockPrisma.sentence.findMany.mockResolvedValue([]);

      await service.getSpeechSentences('hin_Deva', undefined, 1, 20);

      expect(mockPrisma.sentence.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({ languageCode: 'hin_Deva' }),
        }),
      );
    });
  });

  describe('saveSpeechRecording', () => {
    it('should throw BadRequestException for unsupported format', async () => {
      await expect(
        service.saveSpeechRecording(
          'sentence-1',
          Buffer.from('audio'),
          'flac',
          5,
          'user-1',
          'audio',
        ),
      ).rejects.toThrow(BadRequestException);
    });

    it('should throw NotFoundException when sentence not found', async () => {
      mockPrisma.sentence.findUnique.mockResolvedValue(null);

      await expect(
        service.saveSpeechRecording(
          'missing-sentence',
          Buffer.from('audio'),
          'webm',
          5,
          'user-1',
        ),
      ).rejects.toThrow(NotFoundException);
    });

    it('should throw BadRequestException when sentence not validated', async () => {
      mockPrisma.sentence.findUnique.mockResolvedValue({
        id: 's1',
        valid: false,
        languageCode: 'eng_Latn',
      });

      await expect(
        service.saveSpeechRecording('s1', Buffer.from('audio'), 'webm', 5, 'user-1'),
      ).rejects.toThrow(BadRequestException);
    });

    it('should throw BadRequestException when user already recorded', async () => {
      mockPrisma.sentence.findUnique.mockResolvedValue({
        id: 's1',
        valid: true,
        languageCode: 'eng_Latn',
      });
      mockProgress.isCompleted.mockResolvedValue(true);

      await expect(
        service.saveSpeechRecording('s1', Buffer.from('audio'), 'webm', 5, 'user-1'),
      ).rejects.toThrow(BadRequestException);
    });

    it('should save recording and return success', async () => {
      mockProgress.isCompleted.mockResolvedValue(false);
      mockPrisma.sentence.findUnique.mockResolvedValue({
        id: 's1',
        valid: true,
        languageCode: 'eng_Latn',
      });
      mockPrisma.speechRecording.create.mockResolvedValue({
        id: 'rec-1',
        sentenceId: 's1',
        userId: 'user-1',
      });

      const result = await service.saveSpeechRecording(
        's1',
        Buffer.from('audio'),
        'webm',
        5,
        'user-1',
      );

      expect(result).toEqual({ success: true, recordingId: 'rec-1' });
      expect(mockStorage.uploadMedia).toHaveBeenCalled();
      expect(mockProgress.markCompleted).toHaveBeenCalledWith(
        'user-1',
        'sentence',
        's1',
        'speak',
      );
    });
  });
});
