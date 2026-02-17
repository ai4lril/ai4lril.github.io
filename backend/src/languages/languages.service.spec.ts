import { Test, TestingModule } from '@nestjs/testing';
import { LanguagesService } from './languages.service';
import { CacheService } from '../cache/cache.service';

const mockCacheService = {
  get: jest.fn(),
  set: jest.fn().mockResolvedValue(undefined),
};

describe('LanguagesService', () => {
  let service: LanguagesService;

  beforeEach(async () => {
    jest.clearAllMocks();
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        LanguagesService,
        { provide: CacheService, useValue: mockCacheService },
      ],
    }).compile();

    service = module.get<LanguagesService>(LanguagesService);
  });

  describe('getLanguages', () => {
    it('should return cached languages when available', async () => {
      const cached = [{ code: 'eng_Latn', name: 'English', script: 'Latin', status: 'supported' }];
      mockCacheService.get.mockResolvedValue(cached);

      const result = await service.getLanguages();

      expect(result).toEqual(cached);
      expect(mockCacheService.set).not.toHaveBeenCalled();
    });

    it('should return and cache languages when cache miss', async () => {
      mockCacheService.get.mockResolvedValue(null);

      const result = await service.getLanguages();

      expect(result.length).toBeGreaterThan(0);
      expect(result[0]).toHaveProperty('code');
      expect(result[0]).toHaveProperty('name');
      expect(result[0]).toHaveProperty('script');
      expect(result[0]).toHaveProperty('status');
      expect(mockCacheService.set).toHaveBeenCalledWith(
        'languages:all',
        expect.any(Array),
        86400,
      );
    });
  });

  describe('warmCache', () => {
    it('should populate cache', async () => {
      await service.warmCache();

      expect(mockCacheService.set).toHaveBeenCalledWith(
        'languages:all',
        expect.any(Array),
        86400,
      );
    });
  });
});
