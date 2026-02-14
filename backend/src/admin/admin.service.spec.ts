import { Test, TestingModule } from '@nestjs/testing';
import { JwtService } from '@nestjs/jwt';
import { UnauthorizedException } from '@nestjs/common';
import { AdminService } from './admin.service';
import { PrismaService } from '../prisma/prisma.service';
import { CacheInvalidationService } from '../cache/cache-invalidation.service';
import { RealtimeGateway } from '../realtime/realtime.gateway';
import * as bcrypt from 'bcryptjs';

const mockPrisma = {
  adminUser: {
    findUnique: jest.fn(),
    findMany: jest.fn(),
    update: jest.fn(),
    create: jest.fn(),
    delete: jest.fn(),
    count: jest.fn(),
  },
  sentence: {
    findUnique: jest.fn(),
    findMany: jest.fn(),
    update: jest.fn(),
    count: jest.fn(),
  },
  sentenceValidation: {
    create: jest.fn(),
  },
  questionSubmission: {
    findUnique: jest.fn(),
    findMany: jest.fn(),
    update: jest.fn(),
    count: jest.fn(),
  },
  questionValidation: {
    create: jest.fn(),
  },
  user: {
    count: jest.fn(),
  },
  validation: {
    count: jest.fn(),
  },
  speechRecording: {
    count: jest.fn(),
  },
};

const mockCacheInvalidation = {
  invalidateSentence: jest.fn().mockResolvedValue(undefined),
  invalidateQuestionAnswer: jest.fn().mockResolvedValue(undefined),
  invalidateSearch: jest.fn().mockResolvedValue(undefined),
};

const mockRealtimeGateway = {
  emitToRoom: jest.fn(),
  emitNotification: jest.fn(),
};

describe('AdminService', () => {
  let service: AdminService;

  beforeEach(async () => {
    jest.clearAllMocks();
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AdminService,
        {
          provide: JwtService,
          useValue: {
            sign: jest.fn().mockReturnValue('mock-jwt-token'),
          },
        },
        {
          provide: PrismaService,
          useValue: mockPrisma,
        },
        {
          provide: CacheInvalidationService,
          useValue: mockCacheInvalidation,
        },
        {
          provide: RealtimeGateway,
          useValue: mockRealtimeGateway,
        },
      ],
    }).compile();

    service = module.get<AdminService>(AdminService);
  });

  describe('login', () => {
    it('should throw UnauthorizedException when admin not found', async () => {
      mockPrisma.adminUser.findUnique.mockResolvedValue(null);

      await expect(
        service.login({ email: 'admin@test.com', password: 'password' }),
      ).rejects.toThrow(UnauthorizedException);
    });

    it('should throw UnauthorizedException when password is invalid', async () => {
      mockPrisma.adminUser.findUnique.mockResolvedValue({
        id: 'admin-1',
        email: 'admin@test.com',
        password: 'hashed',
        isActive: true,
      });
      jest.spyOn(bcrypt, 'compare').mockResolvedValue(false as never);

      await expect(
        service.login({ email: 'admin@test.com', password: 'wrong' }),
      ).rejects.toThrow(UnauthorizedException);
    });

    it('should return token and admin on valid login', async () => {
      mockPrisma.adminUser.findUnique.mockResolvedValue({
        id: 'admin-1',
        name: 'Admin',
        email: 'admin@test.com',
        password: 'hashed',
        role: 'admin',
        isActive: true,
      });
      mockPrisma.adminUser.update.mockResolvedValue({});
      jest.spyOn(bcrypt, 'compare').mockResolvedValue(true as never);

      const result = await service.login({
        email: 'admin@test.com',
        password: 'password',
      });

      expect(result).toHaveProperty('token', 'mock-jwt-token');
      expect(result.admin).toMatchObject({
        id: 'admin-1',
        name: 'Admin',
        email: 'admin@test.com',
        role: 'admin',
      });
    });
  });

  describe('getPendingSentences', () => {
    it('should return paginated sentences with default filters', async () => {
      mockPrisma.sentence.findMany.mockResolvedValue([
        {
          id: 's1',
          text: 'Test sentence',
          languageCode: 'eng_Latn',
          valid: null,
        },
      ]);
      mockPrisma.sentence.count.mockResolvedValue(1);

      const result = await service.getPendingSentences(1, 20);

      expect(result.sentences).toHaveLength(1);
      expect(result.pagination).toEqual({
        page: 1,
        limit: 20,
        total: 1,
        totalPages: 1,
      });
      expect(mockPrisma.sentence.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { valid: null },
          skip: 0,
          take: 20,
        }),
      );
    });
  });

  describe('getPendingQuestions', () => {
    it('should return paginated questions', async () => {
      mockPrisma.questionSubmission.findMany.mockResolvedValue([
        {
          id: 'q1',
          submittedText: 'Test question?',
          languageCode: 'eng_Latn',
          valid: null,
          sentence: { id: 's1', text: 'Question' },
        },
      ]);
      mockPrisma.questionSubmission.count.mockResolvedValue(1);

      const result = await service.getPendingQuestions(1, 20);

      expect(result.questions).toHaveLength(1);
      expect(result.pagination.total).toBe(1);
    });
  });

  describe('getDashboardStats', () => {
    it('should return dashboard statistics', async () => {
      mockPrisma.user.count.mockResolvedValue(100);
      mockPrisma.sentence.count.mockResolvedValue(500);
      mockPrisma.questionSubmission.count.mockResolvedValue(50);
      mockPrisma.speechRecording.count.mockResolvedValue(200);
      mockPrisma.validation.count.mockResolvedValue(150);

      const result = await service.getDashboardStats();

      expect(result).toMatchObject({
        totalUsers: 100,
        totalSentences: 500,
        totalQuestions: 50,
        totalRecordings: 200,
        totalValidations: 150,
      });
    });
  });
});
