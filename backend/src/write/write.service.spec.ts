import { Test, TestingModule } from '@nestjs/testing';
import { BadRequestException } from '@nestjs/common';
import { WriteService } from './write.service';
import { PrismaService } from '../prisma/prisma.service';
import { CacheInvalidationService } from '../cache/cache-invalidation.service';
import { RealtimeGateway } from '../realtime/realtime.gateway';

const mockPrisma = {
  sentence: { create: jest.fn() },
  $transaction: jest.fn(),
};

const mockCacheInvalidation = {
  invalidateSentence: jest.fn().mockResolvedValue(undefined),
  invalidateSearch: jest.fn().mockResolvedValue(undefined),
};

const mockRealtimeGateway = {
  emitToRoom: jest.fn(),
};

describe('WriteService', () => {
  let service: WriteService;

  beforeEach(async () => {
    jest.clearAllMocks();
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        WriteService,
        { provide: PrismaService, useValue: mockPrisma },
        { provide: CacheInvalidationService, useValue: mockCacheInvalidation },
        { provide: RealtimeGateway, useValue: mockRealtimeGateway },
      ],
    }).compile();

    service = module.get<WriteService>(WriteService);
  });

  describe('submitSentences', () => {
    it('should throw BadRequestException when sentences text is empty', async () => {
      await expect(
        service.submitSentences('', 'hin_Deva', ''),
      ).rejects.toThrow(BadRequestException);

      await expect(
        service.submitSentences('   ', 'hin_Deva', ''),
      ).rejects.toThrow(BadRequestException);
    });

    it('should throw BadRequestException when language code is missing', async () => {
      await expect(
        service.submitSentences('Hello world', '', ''),
      ).rejects.toThrow(BadRequestException);
    });

    it('should throw BadRequestException for invalid language code', async () => {
      await expect(
        service.submitSentences('Hello', 'invalid_lang', ''),
      ).rejects.toThrow(BadRequestException);
    });

    it('should throw BadRequestException when no valid sentences', async () => {
      await expect(
        service.submitSentences('\n\n  \n', 'hin_Deva', ''),
      ).rejects.toThrow(BadRequestException);
    });

    it('should create sentences and return count', async () => {
      mockPrisma.sentence.create
        .mockResolvedValueOnce({ id: 's1', text: 'Hello world' })
        .mockResolvedValueOnce({ id: 's2', text: 'Second sentence' });
      mockPrisma.$transaction.mockImplementation(async (promises) => {
        return Promise.all(promises);
      });

      const result = await service.submitSentences(
        'Hello world\nSecond sentence',
        'hin_Deva',
        '',
      );

      expect(result).toMatchObject({
        success: true,
        submittedCount: 2,
      });
      expect(result.sentenceIds).toEqual(['s1', 's2']);
    });
  });
});
