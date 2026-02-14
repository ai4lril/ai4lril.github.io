import { Test, TestingModule } from '@nestjs/testing';
import { SearchService } from './search.service';
import { PrismaService } from '../prisma/prisma.service';
import { CacheService } from '../cache/cache.service';

const mockPrisma = {
  sentence: {
    findMany: jest.fn(),
  },
  blogPost: {
    findMany: jest.fn(),
  },
  forumPost: {
    findMany: jest.fn(),
  },
  searchHistory: {
    create: jest.fn(),
    updateMany: jest.fn(),
    findMany: jest.fn(),
  },
  savedSearch: {
    create: jest.fn(),
    findMany: jest.fn(),
    deleteMany: jest.fn(),
  },
};

const mockCacheService = {
  get: jest.fn(),
  set: jest.fn().mockResolvedValue(undefined),
};

describe('SearchService', () => {
  let service: SearchService;

  beforeEach(async () => {
    jest.clearAllMocks();
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        SearchService,
        { provide: PrismaService, useValue: mockPrisma },
        { provide: CacheService, useValue: mockCacheService },
      ],
    }).compile();

    service = module.get<SearchService>(SearchService);
  });

  describe('fullTextSearch', () => {
    it('should return cached results when available', async () => {
      const cached = {
        results: [{ type: 'sentence', id: '1', text: 'Hello' }],
        total: 1,
      };
      mockCacheService.get.mockResolvedValue(cached);

      const result = await service.fullTextSearch('hello', [], undefined, 50, 0);

      expect(result.query).toBe('hello');
      expect(result.results).toEqual(cached.results);
      expect(result.total).toBe(1);
      expect(mockPrisma.sentence.findMany).not.toHaveBeenCalled();
    });

    it('should search sentences when not cached', async () => {
      mockCacheService.get.mockResolvedValue(null);
      mockPrisma.sentence.findMany.mockResolvedValue([
        {
          id: 's1',
          text: 'Hello world',
          languageCode: 'eng_Latn',
          user: { username: 'u1', display_name: 'User' },
          createdAt: new Date(),
        },
      ]);
      mockPrisma.blogPost.findMany.mockResolvedValue([]);
      mockPrisma.forumPost.findMany.mockResolvedValue([]);

      const result = await service.fullTextSearch('hello', ['sentence'], undefined, 50, 0);

      expect(result.query).toBe('hello');
      expect(result.results).toHaveLength(1);
      expect(result.results[0]).toMatchObject({
        type: 'sentence',
        id: 's1',
        text: 'Hello world',
      });
    });
  });

  describe('getSearchHistory', () => {
    it('should return search history for user', async () => {
      mockPrisma.searchHistory.findMany.mockResolvedValue([
        { id: 'h1', query: 'test', createdAt: new Date() },
      ]);

      const result = await service.getSearchHistory('user-1', 10);

      expect(result).toHaveLength(1);
      expect(result[0].query).toBe('test');
    });
  });

  describe('saveSearch', () => {
    it('should save a search', async () => {
      mockPrisma.savedSearch.create.mockResolvedValue({
        id: 'saved-1',
        name: 'My search',
        query: 'test',
      });

      const result = await service.saveSearch('user-1', 'My search', 'test');

      expect(result).toMatchObject({ name: 'My search', query: 'test' });
    });
  });
});
