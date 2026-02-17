import { Test, TestingModule } from '@nestjs/testing';
import { BadRequestException } from '@nestjs/common';
import { StorageService } from './storage.service';
import { PrismaService } from '../prisma/prisma.service';

const mockPutObject = jest.fn().mockResolvedValue(undefined);
const mockPresignedGetObject = jest.fn().mockResolvedValue('https://presigned-url');
const mockRemoveObject = jest.fn().mockResolvedValue(undefined);
const mockBucketExists = jest.fn().mockResolvedValue(true);

jest.mock('minio', () => ({
  Client: jest.fn().mockImplementation(() => ({
    putObject: mockPutObject,
    presignedGetObject: mockPresignedGetObject,
    removeObject: mockRemoveObject,
    bucketExists: mockBucketExists,
    makeBucket: jest.fn(),
  })),
}));

// WebM magic bytes: 0x1a, 0x45, 0xdf, 0xa3 (EBML header)
const createWebmBuffer = (): Buffer => {
  const buf = Buffer.alloc(32);
  buf[0] = 0x1a;
  buf[1] = 0x45;
  buf[2] = 0xdf;
  buf[3] = 0xa3;
  return buf;
};

describe('StorageService', () => {
  let service: StorageService;

  beforeEach(async () => {
    jest.clearAllMocks();
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        StorageService,
        { provide: PrismaService, useValue: {} },
      ],
    }).compile();

    service = module.get<StorageService>(StorageService);
  });

  describe('validateDuration', () => {
    it('should throw for non-finite or zero duration', () => {
      expect(() => service.validateDuration(0, 'audio')).toThrow(BadRequestException);
      expect(() => service.validateDuration(-1, 'audio')).toThrow(BadRequestException);
      expect(() => service.validateDuration(NaN, 'audio')).toThrow(BadRequestException);
    });

    it('should throw for duration below minimum (0.5s)', () => {
      expect(() => service.validateDuration(0.3, 'audio')).toThrow(BadRequestException);
    });

    it('should throw for duration above max (audio 300s, video 600s)', () => {
      expect(() => service.validateDuration(301, 'audio')).toThrow(BadRequestException);
      expect(() => service.validateDuration(601, 'video')).toThrow(BadRequestException);
    });

    it('should not throw for valid duration', () => {
      expect(() => service.validateDuration(1, 'audio')).not.toThrow();
      expect(() => service.validateDuration(300, 'audio')).not.toThrow();
      expect(() => service.validateDuration(600, 'video')).not.toThrow();
    });
  });

  describe('uploadMedia', () => {
    it('should throw for invalid buffer (no magic bytes)', async () => {
      const invalidBuffer = Buffer.from('not-audio');

      await expect(
        service.uploadMedia(invalidBuffer, 'test.webm', 'audio/webm', 'audio'),
      ).rejects.toThrow(BadRequestException);
    });

    it('should upload valid webm and return URL', async () => {
      const webmBuffer = createWebmBuffer();

      const result = await service.uploadMedia(
        webmBuffer,
        'test.webm',
        'audio/webm',
        'audio',
      );

      expect(result).toContain('voice-audio');
      expect(result).toContain('audio/');
      expect(mockPutObject).toHaveBeenCalledWith(
        'voice-audio',
        expect.stringContaining('audio/'),
        webmBuffer,
        webmBuffer.length,
        expect.objectContaining({ 'Content-Type': 'audio/webm' }),
      );
    });
  });

  describe('getAudioUrl', () => {
    it('should return presigned URL', async () => {
      const result = await service.getAudioUrl('audio/test.webm');

      expect(result).toBe('https://presigned-url');
      expect(mockPresignedGetObject).toHaveBeenCalledWith(
        'voice-audio',
        'audio/test.webm',
        86400,
      );
    });
  });

  describe('deleteAudio', () => {
    it('should call removeObject', async () => {
      await service.deleteAudio('audio/test.webm');

      expect(mockRemoveObject).toHaveBeenCalledWith('voice-audio', 'audio/test.webm');
    });
  });
});
