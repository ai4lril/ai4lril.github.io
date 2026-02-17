import { Test, TestingModule } from '@nestjs/testing';
import { JwtService } from '@nestjs/jwt';
import {
  UnauthorizedException,
  ConflictException,
  BadRequestException,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { PrismaService } from '../prisma/prisma.service';
import { VerificationService } from '../verification.service';
import * as bcrypt from 'bcryptjs';

const mockPrisma = {
  user: {
    findFirst: jest.fn(),
    findUnique: jest.fn(),
    create: jest.fn(),
  },
};

const mockVerificationService = {
  sendVerificationEmail: jest.fn().mockResolvedValue(undefined),
};

describe('AuthService', () => {
  let service: AuthService;

  beforeEach(async () => {
    jest.clearAllMocks();
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
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
          provide: VerificationService,
          useValue: mockVerificationService,
        },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
  });

  describe('signup', () => {
    it('should throw BadRequestException when password is empty', async () => {
      await expect(
        service.signup({
          email: 'test@example.com',
          username: 'testuser',
          password: '',
          first_name: 'Test',
          last_name: 'User',
          display_name: 'Test User',
        }),
      ).rejects.toThrow(BadRequestException);
      expect(mockPrisma.user.findFirst).not.toHaveBeenCalled();
    });

    it('should throw ConflictException when user already exists', async () => {
      mockPrisma.user.findFirst.mockResolvedValue({
        id: 'existing-id',
        email: 'test@example.com',
      });

      await expect(
        service.signup({
          email: 'test@example.com',
          username: 'testuser',
          password: 'Password1',
          first_name: 'Test',
          last_name: 'User',
          display_name: 'Test User',
        }),
      ).rejects.toThrow(ConflictException);
    });

    it('should create user and return token on valid signup', async () => {
      mockPrisma.user.findFirst.mockResolvedValue(null);
      mockPrisma.user.create.mockResolvedValue({
        id: 'user-1',
        email: 'test@example.com',
        username: 'testuser',
        first_name: 'Test',
        last_name: 'User',
        display_name: 'Test User',
      });
      jest.spyOn(bcrypt, 'hash').mockResolvedValue('hashed-password' as never);

      const result = await service.signup({
        email: 'test@example.com',
        username: 'testuser',
        password: 'Password1',
        first_name: 'Test',
        last_name: 'User',
        display_name: 'Test User',
      });

      expect(result).toHaveProperty('token', 'mock-jwt-token');
      expect(result).toHaveProperty('refreshToken', 'mock-jwt-token');
      expect(result.user).toMatchObject({
        id: 'user-1',
        email: 'test@example.com',
        username: 'testuser',
      });
      expect(mockVerificationService.sendVerificationEmail).toHaveBeenCalledWith(
        'user-1',
      );
    });
  });

  describe('login', () => {
    it('should throw UnauthorizedException when user not found', async () => {
      mockPrisma.user.findUnique.mockResolvedValue(null);

      await expect(
        service.login({ email: 'unknown@example.com', password: 'Password1' }),
      ).rejects.toThrow(UnauthorizedException);
    });

    it('should throw UnauthorizedException when user has no password (OAuth)', async () => {
      mockPrisma.user.findUnique.mockResolvedValue({
        id: 'user-1',
        email: 'oauth@example.com',
        password: null,
      });

      await expect(
        service.login({ email: 'oauth@example.com', password: 'any' }),
      ).rejects.toThrow(UnauthorizedException);
    });

    it('should throw UnauthorizedException when password is invalid', async () => {
      mockPrisma.user.findUnique.mockResolvedValue({
        id: 'user-1',
        email: 'test@example.com',
        password: 'hashed',
        first_name: 'Test',
        last_name: 'User',
        display_name: 'Test',
        username: 'testuser',
        phone_number: null,
        current_residence_pincode: null,
        birth_place_pincode: null,
        birth_date: null,
        gender: null,
        religion: null,
        mother: null,
        first_language: null,
        second_language: null,
        third_language: null,
        fourth_language: null,
        fifth_language: null,
        profile_picture_url: null,
        created_at: new Date(),
      });
      jest.spyOn(bcrypt, 'compare').mockResolvedValue(false as never);

      await expect(
        service.login({ email: 'test@example.com', password: 'wrong' }),
      ).rejects.toThrow(UnauthorizedException);
    });

    it('should return user and token on valid login', async () => {
      mockPrisma.user.findUnique.mockResolvedValue({
        id: 'user-1',
        email: 'test@example.com',
        password: 'hashed',
        first_name: 'Test',
        last_name: 'User',
        display_name: 'Test',
        username: 'testuser',
        phone_number: null,
        current_residence_pincode: null,
        birth_place_pincode: null,
        birth_date: null,
        gender: null,
        religion: null,
        mother: null,
        first_language: null,
        second_language: null,
        third_language: null,
        fourth_language: null,
        fifth_language: null,
        profile_picture_url: null,
        created_at: new Date(),
      });
      jest.spyOn(bcrypt, 'compare').mockResolvedValue(true as never);

      const result = await service.login({
        email: 'test@example.com',
        password: 'Password1',
      });

      expect(result).toHaveProperty('token', 'mock-jwt-token');
      expect(result.user).toMatchObject({
        id: 'user-1',
        email: 'test@example.com',
        username: 'testuser',
      });
    });
  });
});
