import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from './prisma/prisma.service';
import { StorageService } from './storage/storage.service';
import { ProgressService } from './progress/progress.service';

/**
 * Service for handling speech recording (Scripted Speech feature)
 * Manages sentence retrieval, audio recording storage, and validation
 */
@Injectable()
export class SpeechService {
  constructor(
    private prisma: PrismaService,
    private storage: StorageService,
    private progress: ProgressService,
  ) {}

  /**
   * Get validated sentences available for speech recording
   *
   * @param languageCode - Optional ISO 639-3 + ISO 15924 language code filter
   * @param userId - Optional user ID to exclude already completed sentences
   * @param page - Page number for pagination (default: 1)
   * @param limit - Number of sentences per page (default: 50)
   * @returns Array of sentence objects ready for recording
   */
  async getSpeechSentences(
    languageCode?: string,
    userId?: string,
    page: number = 1,
    limit: number = 50,
  ) {
    const where: {
      isActive: boolean;
      valid: boolean;
      taskType: string;
      languageCode?: string;
    } = {
      isActive: true,
      valid: true, // Only show validated sentences
      taskType: 'speech',
    };

    if (languageCode) {
      where.languageCode = languageCode;
    }

    const skip = (page - 1) * limit;

    let sentences = await this.prisma.sentence.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      take: limit,
      skip,
    });

    // Exclude sentences already completed by user
    if (userId) {
      sentences = await this.progress.excludeCompleted(
        userId,
        'sentence',
        'speak',
        sentences,
      );
    }

    return sentences;
  }

  /**
   * Save a speech recording for a sentence (audio or video)
   *
   * @param sentenceId - ID of the sentence being recorded
   * @param mediaBuffer - Media file buffer (audio or video)
   * @param audioFormat - Media format (webm, wav, mp3, mp4, etc.)
   * @param duration - Recording duration in seconds
   * @param userId - User ID who submitted the recording
   * @param mediaType - 'audio' or 'video' (defaults to 'audio')
   * @returns Object with success status and recording ID
   * @throws NotFoundException if sentence not found
   * @throws BadRequestException if sentence not validated, already recorded, or file validation fails
   */
  async saveSpeechRecording(
    sentenceId: string,
    mediaBuffer: Buffer,
    audioFormat: string,
    duration: number,
    userId?: string,
    mediaType: string = 'audio',
  ) {
    // Validate media format
    const allowedAudioFormats = ['webm', 'wav', 'mp3', 'ogg', 'mpeg'];
    const allowedVideoFormats = ['webm', 'mp4'];
    const allowedFormats =
      mediaType === 'video'
        ? [...allowedVideoFormats, ...allowedAudioFormats]
        : allowedAudioFormats;

    if (!allowedFormats.includes(audioFormat.toLowerCase())) {
      throw new BadRequestException(
        `Unsupported ${mediaType} format: ${audioFormat}. Supported formats: ${allowedFormats.join(', ')}`,
      );
    }

    // Verify sentence exists and is valid
    const sentence = await this.prisma.sentence.findUnique({
      where: { id: sentenceId },
    });

    if (!sentence) {
      throw new NotFoundException('Sentence not found');
    }

    if (sentence.valid !== true) {
      throw new BadRequestException('Sentence is not validated yet');
    }

    // Check if user already recorded this sentence
    if (userId) {
      const isCompleted = await this.progress.isCompleted(
        userId,
        'sentence',
        sentenceId,
        'speak',
      );

      if (isCompleted) {
        throw new BadRequestException(
          'You have already recorded this sentence',
        );
      }
    }

    // Upload to MinIO using the generic uploadMedia method
    const contentTypePrefix = mediaType === 'video' ? 'video' : 'audio';
    const fileName = `speech-${sentenceId}-${Date.now()}.${audioFormat}`;
    const blobStorageLink = await this.storage.uploadMedia(
      mediaBuffer,
      fileName,
      `${contentTypePrefix}/${audioFormat}`,
      mediaType,
    );

    // Save recording
    const recording = await this.prisma.speechRecording.create({
      data: {
        sentenceId,
        userId,
        audioFile: blobStorageLink,
        audioFormat,
        mediaType,
        duration,
        fileSize: mediaBuffer.length,
      },
    });

    // Save audio metadata
    if (userId && sentence.languageCode) {
      await this.storage.saveAudioMetadata(
        recording.id,
        userId,
        blobStorageLink,
        duration,
        sentence.languageCode,
      );
    }

    // Mark as completed
    if (userId) {
      await this.progress.markCompleted(
        userId,
        'sentence',
        sentenceId,
        'speak',
      );
    }

    return { success: true, recordingId: recording.id };
  }

  /**
   * Get audio recordings available for validation (Listen feature)
   * Returns recordings with less than 25 validations
   *
   * @param languageCode - Optional ISO 639-3 + ISO 15924 language code filter
   * @param userId - Optional user ID to exclude already validated recordings
   * @returns Array of recording objects with validation count
   */
  async getAudioForValidation(languageCode?: string, userId?: string) {
    const where: {
      isValidated: boolean;
    } = {
      isValidated: false,
    };

    // Get recordings with their sentences
    let recordings = await this.prisma.speechRecording.findMany({
      where,
      include: {
        sentence: true,
      },
      orderBy: { createdAt: 'desc' },
    });

    // Filter by language if specified
    if (languageCode) {
      recordings = recordings.filter(
        (r) => r.sentence.languageCode === languageCode,
      );
    }

    // Exclude recordings already validated by user
    if (userId) {
      const validatedIds = await this.getValidatedRecordingIds(userId);
      recordings = recordings.filter((r) => !validatedIds.has(r.id));
    }

    // Exclude recordings that already have 25 validations
    // Use batch query to avoid N+1 problem
    const recordingIds = recordings.map((r) => r.id);
    const validationCounts = await this.prisma.validation.groupBy({
      by: ['speechRecordingId'],
      where: {
        speechRecordingId: { in: recordingIds },
      },
      _count: {
        id: true,
      },
    });

    // Create a map of recordingId -> count
    const countMap = new Map(
      validationCounts.map((vc) => [vc.speechRecordingId, vc._count.id]),
    );

    // Filter recordings with less than 25 validations
    const availableRecordings = recordings.filter(
      (recording) => (countMap.get(recording.id) || 0) < 25,
    );

    if (availableRecordings.length === 0) {
      return null;
    }

    // Return first available recording
    const selected = availableRecordings[0];
    return {
      id: selected.id,
      audioFile: selected.audioFile,
      audioFormat: selected.audioFormat,
      mediaType: selected.mediaType,
      duration: selected.duration,
      sentence: {
        id: selected.sentence.id,
        text: selected.sentence.text,
        languageCode: selected.sentence.languageCode,
      },
    };
  }

  /**
   * Save a validation for a speech recording (Listen feature)
   * Automatically marks recording as validated when reaching 25 validations
   *
   * @param speechRecordingId - ID of the recording being validated
   * @param isValid - Whether the audio matches the text (true) or not (false)
   * @param userId - User ID who submitted the validation
   * @returns Object with success status
   * @throws NotFoundException if recording not found
   * @throws BadRequestException if already has 25 validations
   */
  async saveValidation(
    speechRecordingId: string,
    isValid: boolean,
    userId?: string,
  ) {
    // Check if recording exists
    const recording = await this.prisma.speechRecording.findUnique({
      where: { id: speechRecordingId },
    });

    if (!recording) {
      throw new NotFoundException('Speech recording not found');
    }

    // Check validation count
    const validationCount = await this.prisma.validation.count({
      where: { speechRecordingId },
    });

    if (validationCount >= 25) {
      throw new BadRequestException('Maximum validation count (25) reached');
    }

    // Check if user already validated this recording
    if (userId) {
      const existingValidation = await this.prisma.validation.findUnique({
        where: {
          speechRecordingId_userId: {
            speechRecordingId,
            userId,
          },
        },
      });

      if (existingValidation) {
        throw new BadRequestException(
          'You have already validated this recording',
        );
      }
    }

    // Create validation
    if (!userId) {
      throw new BadRequestException('User ID is required to create validation');
    }

    await this.prisma.validation.create({
      data: {
        speechRecordingId,
        userId,
        isValid,
      },
    });

    // Mark as completed for user
    if (userId) {
      await this.progress.markCompleted(
        userId,
        'audio',
        speechRecordingId,
        'listen',
      );
    }

    // Check if we've reached 25 validations
    const newCount = await this.prisma.validation.count({
      where: { speechRecordingId },
    });

    if (newCount >= 25) {
      // Mark recording as validated
      await this.prisma.speechRecording.update({
        where: { id: speechRecordingId },
        data: { isValidated: true },
      });
    }

    return { success: true, validationCount: newCount };
  }

  private async getValidatedRecordingIds(userId: string): Promise<Set<string>> {
    const validations = await this.prisma.validation.findMany({
      where: { userId },
      select: { speechRecordingId: true },
    });

    return new Set(validations.map((v) => v.speechRecordingId));
  }
}
