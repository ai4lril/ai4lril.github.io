import { Test, TestingModule } from '@nestjs/testing';
import { BadRequestException } from '@nestjs/common';
import { StorageService } from './storage.service';
import { PrismaService } from '../prisma/prisma.service';

const mockSend = jest.fn();
const mockGetSignedUrl = jest.fn().mockResolvedValue('https://presigned-url');

jest.mock('@aws-sdk/client-s3', () => ({
  S3Client: jest.fn().mockImplementation(() => ({
    send: mockSend,
  })),
  PutObjectCommand: jest.fn().mockImplementation((params) => ({ _params: params })),
  GetObjectCommand: jest.fn().mockImplementation((params) => ({ _params: params })),
  DeleteObjectCommand: jest.fn().mockImplementation((params) => ({ _params: params })),
  HeadBucketCommand: jest.fn().mockImplementation((params) => ({ _params: params })),
  CreateBucketCommand: jest.fn().mockImplementation((params) => ({ _params: params })),
}));

jest.mock('@aws-sdk/s3-request-presigner', () => ({
  getSignedUrl: (...args: unknown[]) => mockGetSignedUrl(...args),
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
    // HeadBucket succeeds (bucket exists) - no CreateBucket needed
    mockSend.mockResolvedValue(undefined);

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
      expect(mockSend).toHaveBeenCalledWith(
        expect.objectContaining({
          _params: expect.objectContaining({
            Bucket: 'voice-audio',
            Key: expect.stringContaining('audio/'),
            Body: webmBuffer,
            ContentType: 'audio/webm',
          }),
        }),
      );
    });
  });

  describe('getAudioUrl', () => {
    it('should return presigned URL', async () => {
      const result = await service.getAudioUrl('audio/test.webm');

      expect(result).toBe('https://presigned-url');
      expect(mockGetSignedUrl).toHaveBeenCalled();
    });
  });

  describe('deleteAudio', () => {
    it('should call DeleteObjectCommand via send', async () => {
      await service.deleteAudio('audio/test.webm');

      expect(mockSend).toHaveBeenCalledWith(
        expect.objectContaining({
          _params: expect.objectContaining({
            Bucket: 'voice-audio',
            Key: 'audio/test.webm',
          }),
        }),
      );
    });
  });
});
