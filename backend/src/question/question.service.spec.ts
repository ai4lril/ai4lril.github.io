import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException, BadRequestException } from '@nestjs/common';
import { QuestionService } from './question.service';

jest.mock('../common/utils/sanitize', () => ({
  sanitizeInput: (input: string) => (input && typeof input === 'string' ? input : ''),
  sanitizeForDisplay: (input: string) => (input && typeof input === 'string' ? input : ''),
}));
import { PrismaService } from '../prisma/prisma.service';
import { ProgressService } from '../progress/progress.service';
import { StorageService } from '../storage/storage.service';
import { CacheInvalidationService } from '../cache/cache-invalidation.service';

const mockPrisma = {
  sentence: { create: jest.fn() },
  questionSubmission: {
    create: jest.fn(),
    findMany: jest.fn(),
    findUnique: jest.fn(),
  },
  answerRecording: { create: jest.fn(), findFirst: jest.fn() },
  userProgress: { findUnique: jest.fn(), findMany: jest.fn() },
};

const mockProgress = {
  markCompleted: jest.fn().mockResolvedValue(undefined),
};

const mockStorage = {
  validateDuration: jest.fn(),
  uploadMedia: jest.fn().mockResolvedValue('https://seaweedfs/bucket/audio.webm'),
  uploadAudio: jest.fn().mockResolvedValue('https://seaweedfs/bucket/audio.webm'),
  saveAudioMetadata: jest.fn().mockResolvedValue({}),
};

const mockCacheInvalidation = {
  invalidateQuestionAnswer: jest.fn().mockResolvedValue(undefined),
};

describe('QuestionService', () => {
  let service: QuestionService;

  beforeEach(async () => {
    jest.clearAllMocks();
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        QuestionService,
        { provide: PrismaService, useValue: mockPrisma },
        { provide: ProgressService, useValue: mockProgress },
        { provide: StorageService, useValue: mockStorage },
        { provide: CacheInvalidationService, useValue: mockCacheInvalidation },
      ],
    }).compile();

    service = module.get<QuestionService>(QuestionService);
  });

  describe('submitQuestion', () => {
    it('should create sentence and question submission', async () => {
      mockPrisma.sentence.create.mockResolvedValue({
        id: 'sentence-1',
        text: 'What is your name?',
        languageCode: 'eng_Latn',
      });
      mockPrisma.questionSubmission.create.mockResolvedValue({
        id: 'sub-1',
        sentenceId: 'sentence-1',
        submittedText: 'What is your name?',
        languageCode: 'eng_Latn',
      });

      const result = await service.submitQuestion(
        'What is your name?',
        'eng_Latn',
        'user-1',
      );

      expect(result).toMatchObject({
        success: true,
        id: 'sub-1',
        submissionId: 'sub-1',
        questionText: 'What is your name?',
        languageCode: 'eng_Latn',
      });
      expect(mockPrisma.sentence.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            text: 'What is your name?',
            languageCode: 'eng_Latn',
            taskType: 'question',
            valid: null,
          }),
        }),
      );
    });
  });

  describe('saveAnswer', () => {
    it('should throw NotFoundException when question not found', async () => {
      mockPrisma.questionSubmission.findUnique.mockResolvedValue(null);

      await expect(
        service.saveAnswer(
          'missing-id',
          Buffer.from('audio'),
          'webm',
          5,
          'user-1',
        ),
      ).rejects.toThrow(NotFoundException);
    });

    it('should throw BadRequestException when user already answered', async () => {
      mockPrisma.questionSubmission.findUnique.mockResolvedValue({
        id: 'q1',
        valid: true,
        sentenceId: 's1',
      });
      mockPrisma.answerRecording.findFirst.mockResolvedValue({
        id: 'existing-ans',
        questionSubmissionId: 'q1',
        userId: 'user-1',
      });

      await expect(
        service.saveAnswer('q1', Buffer.from('audio'), 'webm', 5, 'user-1'),
      ).rejects.toThrow(BadRequestException);
    });

    it('should save answer and return success', async () => {
      mockPrisma.questionSubmission.findUnique.mockResolvedValue({
        id: 'q1',
        valid: true,
        sentenceId: 's1',
        languageCode: 'eng_Latn',
      });
      mockPrisma.answerRecording.findFirst.mockResolvedValue(null);
      mockPrisma.answerRecording.create.mockResolvedValue({
        id: 'ans-1',
        questionSubmissionId: 'q1',
      });

      const result = await service.saveAnswer(
        'q1',
        Buffer.from('audio'),
        'webm',
        5,
        'user-1',
      );

      expect(result).toHaveProperty('answerId', 'ans-1');
      expect(mockStorage.uploadAudio).toHaveBeenCalled();
      expect(mockProgress.markCompleted).toHaveBeenCalled();
    });
  });
});
