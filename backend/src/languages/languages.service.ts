import { Injectable, OnModuleInit } from '@nestjs/common';
import { CacheService } from '../cache/cache.service';

export interface Language {
  code: string;
  name: string;
  script: string;
  status: 'supported' | 'coming-soon';
}

const LANGUAGES: Language[] = [
  { code: 'asm_Beng', name: 'Assamese - Assamese', script: 'Bengali-Assamese', status: 'supported' },
  { code: 'asm_Latn', name: 'Assamese - Roman', script: 'Latin/Roman', status: 'supported' },
  { code: 'ben_Beng', name: 'Bengali - Bengali', script: 'Bengali-Assamese', status: 'supported' },
  { code: 'ben_Latn', name: 'Bengali - Roman', script: 'Latin/Roman', status: 'supported' },
  { code: 'brx_Deva', name: 'Bodo - Devanagari', script: 'Devanagari', status: 'supported' },
  { code: 'brx_Latn', name: 'Bodo - Roman', script: 'Latin/Roman', status: 'supported' },
  { code: 'doi_Deva', name: 'Dogri - Devanagari', script: 'Devanagari', status: 'supported' },
  { code: 'doi_Latn', name: 'Dogri - Roman', script: 'Latin/Roman', status: 'supported' },
  { code: 'eng_Latn', name: 'English', script: 'Latin', status: 'supported' },
  { code: 'guj_Gujr', name: 'Gujarati - Gujarati', script: 'Gujarati', status: 'supported' },
  { code: 'guj_Latn', name: 'Gujarati - Roman', script: 'Latin/Roman', status: 'supported' },
  { code: 'hin_Deva', name: 'Hindi - Devanagari', script: 'Devanagari', status: 'supported' },
  { code: 'hin_Latn', name: 'Hindi - Roman', script: 'Latin/Roman', status: 'supported' },
  { code: 'kan_Knda', name: 'Kannada - Kannada', script: 'Kannada', status: 'supported' },
  { code: 'kan_Latn', name: 'Kannada - Roman', script: 'Latin/Roman', status: 'supported' },
  { code: 'kok_Deva', name: 'Konkani - Devanagari', script: 'Devanagari', status: 'supported' },
  { code: 'kok_Latn', name: 'Konkani - Roman', script: 'Latin/Roman', status: 'supported' },
  { code: 'kok_Mlym', name: 'Konkani - Malayalam', script: 'Malayalam', status: 'supported' },
  { code: 'mal_Mlym', name: 'Malayalam - Malayalam', script: 'Malayalam', status: 'supported' },
  { code: 'mal_Latn', name: 'Malayalam - Roman', script: 'Latin/Roman', status: 'supported' },
  { code: 'mar_Deva', name: 'Marathi - Devanagari', script: 'Devanagari', status: 'supported' },
  { code: 'mar_Latn', name: 'Marathi - Roman', script: 'Latin/Roman', status: 'supported' },
  { code: 'ori_Orya', name: 'Odia - Odia', script: 'Odia', status: 'supported' },
  { code: 'ori_Latn', name: 'Odia - Roman', script: 'Latin/Roman', status: 'supported' },
  { code: 'pan_Guru', name: 'Punjabi - Gurmukhi', script: 'Gurmukhi', status: 'supported' },
  { code: 'pan_Deva', name: 'Punjabi - Devanagari', script: 'Devanagari', status: 'supported' },
  { code: 'pan_Latn', name: 'Punjabi - Roman', script: 'Latin/Roman', status: 'supported' },
  { code: 'tam_Taml', name: 'Tamil - Tamil', script: 'Tamil', status: 'supported' },
  { code: 'tam_Latn', name: 'Tamil - Roman', script: 'Latin/Roman', status: 'supported' },
  { code: 'tel_Telu', name: 'Telugu - Telugu', script: 'Telugu', status: 'supported' },
  { code: 'tel_Latn', name: 'Telugu - Roman', script: 'Latin/Roman', status: 'supported' },
];

const CACHE_KEY = 'languages:all';
const CACHE_TTL = 86400; // 24 hours - static data, cache forever (24h for safety)

@Injectable()
export class LanguagesService implements OnModuleInit {
  constructor(private readonly cacheService: CacheService) { }

  async onModuleInit() {
    await this.warmCache();
  }

  async getLanguages(): Promise<Language[]> {
    const cached = await this.cacheService.get<Language[]>(CACHE_KEY);
    if (cached) {
      return cached;
    }
    await this.cacheService.set(CACHE_KEY, LANGUAGES, CACHE_TTL);
    return LANGUAGES;
  }

  async warmCache(): Promise<void> {
    await this.cacheService.set(CACHE_KEY, LANGUAGES, CACHE_TTL);
  }
}
