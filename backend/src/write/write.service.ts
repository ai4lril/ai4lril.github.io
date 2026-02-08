import { Injectable, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

// Valid language codes (ISO 639-3 + ISO 15924 format)
const VALID_LANGUAGE_CODES = [
  'asm_Beng',
  'asm_Latn',
  'ben_Beng',
  'ben_Latn',
  'brx_Deva',
  'brx_Latn',
  'doi_Deva',
  'doi_Latn',
  'eng_Latn',
  'guj_Gujr',
  'guj_Latn',
  'hin_Deva',
  'hin_Latn',
  'kan_Knda',
  'kok_Deva',
  'kok_Latn',
  'kok_Mlym',
  'mal_Mlym',
  'mar_Deva',
  'mar_Latn',
  'ori_Orya',
  'pan_Guru',
  'tam_Taml',
  'tel_Telu',
];

/**
 * Service for handling sentence submission (Write feature)
 * Validates, sanitizes, and stores user-submitted sentences for speech recording
 */
@Injectable()
export class WriteService {
  constructor(private prisma: PrismaService) {}

  /**
   * Submit sentences for speech recording
   *
   * @param sentencesText - Text containing sentences separated by newlines
   * @param languageCode - ISO 639-3 + ISO 15924 language code (e.g., 'hin_Deva')
   * @param citation - Optional citation source for the sentences
   * @param userId - Optional user ID who submitted the sentences
   * @returns Object with success status, submitted count, and sentence IDs
   * @throws BadRequestException if validation fails
   */
  async submitSentences(
    sentencesText: string,
    languageCode: string,
    citation: string,
  ) {
    // Validate input
    if (!sentencesText || !sentencesText.trim()) {
      throw new BadRequestException('Sentences text is required');
    }

    if (!languageCode) {
      throw new BadRequestException('Language code is required');
    }

    // Validate language code format
    if (!VALID_LANGUAGE_CODES.includes(languageCode)) {
      throw new BadRequestException(
        `Invalid language code: ${languageCode}. Must be in format {ISO_639-3}_{ISO_15924} (e.g., hin_Deva, kok_Latn)`,
      );
    }

    // Parse sentences by line breaks
    const sentences = sentencesText
      .split('\n')
      .map((s) => s.trim())
      .filter((s) => s.length > 0);

    if (sentences.length === 0) {
      throw new BadRequestException('No valid sentences provided');
    }

    // Use transaction to ensure all sentences are created atomically
    const createdSentences = await this.prisma.$transaction(
      sentences.map((text) =>
        this.prisma.sentence.create({
          data: {
            text,
            languageCode,
            taskType: 'speech',
            valid: null, // Pending admin validation
            ...(citation && citation.trim()
              ? { citation: citation.trim() }
              : {}),
          },
        }),
      ),
    );

    return {
      success: true,
      submittedCount: createdSentences.length,
      count: createdSentences.length,
      sentenceIds: createdSentences.map((s) => s.id),
    };
  }
}
