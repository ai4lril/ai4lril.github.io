import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { StorageService } from '../storage/storage.service';
import { ProgressService } from '../progress/progress.service';
import { CacheService } from '../cache/cache.service';
import { CacheInvalidationService } from '../cache/cache-invalidation.service';
import { RealtimeGateway } from '../realtime/realtime.gateway';
import { TaskAssignmentService } from '../task-assignment/task-assignment.service';

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
    private cache: CacheService,
    private cacheInvalidation: CacheInvalidationService,
    private realtimeGateway: RealtimeGateway,
    private taskAssignment: TaskAssignmentService,
  ) { }

  /**
   * Get validated sentences available for speech recording.
   * Uses intelligent task assignment: difficulty matching, language preference,
   * and prioritization of under-collected sentences.
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

    // Fetch larger pool for intelligent ranking (up to 5x limit, max 250)
    const poolSize = Math.min(limit * 5, 250);

    let sentences = await this.prisma.sentence.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      take: poolSize,
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

    // Get recording counts per sentence for under-collection prioritization
    const sentenceIds = sentences.map((s) => s.id);
    const recordingCounts = await this.prisma.speechRecording.groupBy({
      by: ['sentenceId'],
      where: { sentenceId: { in: sentenceIds } },
      _count: { id: true },
    });
    const countMap = new Map(
      recordingCounts.map((rc) => [rc.sentenceId, rc._count.id]),
    );

    const sentencesWithCounts = sentences.map((s) => ({
      ...s,
      _recordingCount: countMap.get(s.id) ?? 0,
    }));

    // Rank by intelligent task assignment
    const ctx = await this.taskAssignment.getUserContext(userId);
    const ranked = this.taskAssignment.rankSpeechSentences(
      sentencesWithCounts,
      ctx,
    );

    // Apply pagination and strip internal fields
    const skip = (page - 1) * limit;
    return ranked.slice(skip, skip + limit).map(({ _recordingCount, ...s }) => {
      void _recordingCount; // Strip internal field from response
      return s;
    });
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

    // Validate duration
    this.storage.validateDuration(duration, mediaType);

    // Optionally extract and verify duration from buffer (if ffprobe available)
    // This provides additional validation but is optional
    let verifiedDuration = duration;
    try {
      const extractedDuration = await this.storage.extractMediaDuration(
        mediaBuffer,
        audioFormat,
        mediaType,
      );
      if (extractedDuration !== null) {
        // Verify extracted duration is within 10% of provided duration
        const durationDiff = Math.abs(extractedDuration - duration);
        const durationPercentDiff = (durationDiff / duration) * 100;
        if (durationPercentDiff > 10) {
          // Use extracted duration if difference is significant
          verifiedDuration = extractedDuration;
          // Log warning but don't fail - frontend calculation may be slightly off
          console.warn(
            `Duration mismatch: provided=${duration.toFixed(2)}s, extracted=${extractedDuration.toFixed(2)}s`,
          );
        }
      }
    } catch (error) {
      console.warn('Failed to extract duration:', error instanceof Error ? error.message : error);
      // ffprobe not available or failed - use provided duration
      // This is acceptable as frontend already calculates duration
    }

    // Upload to blob storage (SeaweedFS S3) using the generic uploadMedia method
    const contentTypePrefix = mediaType === 'video' ? 'video' : 'audio';
    const fileName = `speech-${sentenceId}-${Date.now()}.${audioFormat}`;
    const blobStorageLink = await this.storage.uploadMedia(
      mediaBuffer,
      fileName,
      `${contentTypePrefix}/${audioFormat}`,
      mediaType,
    );

    // Save recording with verified duration
    const recording = await this.prisma.speechRecording.create({
      data: {
        sentenceId,
        userId,
        audioFile: blobStorageLink,
        audioFormat,
        mediaType,
        duration: verifiedDuration,
        fileSize: mediaBuffer.length,
      },
    });

    // Save audio metadata with verified duration
    if (userId && sentence.languageCode) {
      await this.storage.saveAudioMetadata(
        recording.id,
        userId,
        blobStorageLink,
        verifiedDuration,
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

    // Invalidate related caches
    await this.cacheInvalidation.invalidateSpeechRecording(
      sentenceId,
      sentence.languageCode,
      userId,
    );

    // Notify user of successful recording (if authenticated)
    if (userId) {
      this.realtimeGateway.emitToUser(userId, 'activity', {
        type: 'recording',
        action: 'saved',
        recordingId: recording.id,
        sentenceId,
      });
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
    // Generate cache key
    const cacheKey = `recordings:validation:${languageCode || 'all'}:${userId || 'anonymous'}`;

    // Check cache first
    type CachedRecording = Awaited<ReturnType<typeof this.prisma.speechRecording.findMany>>;
    const cached = await this.cache.get<CachedRecording>(cacheKey);
    if (cached) {
      return cached;
    }

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
      const result = null;
      // Cache null result for shorter time (1 minute) to allow retry
      await this.cache.set(cacheKey, result, 60);
      return result;
    }

    // Pick best recording via intelligent task assignment
    const ctx = await this.taskAssignment.getUserContext(userId);
    const selected = this.taskAssignment.pickBestValidationRecording(
      availableRecordings,
      countMap,
      ctx,
    ) ?? availableRecordings[0];
    const result = {
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

    // Cache result for 5 minutes
    await this.cache.set(cacheKey, result, 300);
    return result;
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
