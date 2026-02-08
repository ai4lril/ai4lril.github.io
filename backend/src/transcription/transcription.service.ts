import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { ProgressService } from '../progress/progress.service';
import { sanitizeInput } from '../common/utils/sanitize';

/**
 * Service for handling audio transcription and review
 * Manages transcription submission, review workflow, and validation
 */
@Injectable()
export class TranscriptionService {
  constructor(
    private prisma: PrismaService,
    private progress: ProgressService,
  ) {}

  /**
   * Get audio recordings available for transcription
   *
   * @param languageCode - Optional ISO 639-3 + ISO 15924 language code filter
   * @param userId - Optional user ID to exclude already transcribed recordings
   * @returns Array of speech recording objects with associated sentences
   */
  async getAudioForTranscription(languageCode?: string, userId?: string) {
    // Get recordings that have been validated (isValidated=true)
    const where: {
      isValidated: boolean;
    } = {
      isValidated: true,
    };

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

    // Exclude recordings already transcribed by user
    if (userId) {
      const transcribedIds = await this.getTranscribedRecordingIds(userId);
      recordings = recordings.filter((r) => !transcribedIds.has(r.id));
    }

    if (recordings.length === 0) {
      return null;
    }

    const selected = recordings[0];
    return {
      id: selected.id,
      audioFile: selected.audioFile,
      audioFormat: selected.audioFormat,
      duration: selected.duration,
      sentence: {
        id: selected.sentence.id,
        text: selected.sentence.text,
        languageCode: selected.sentence.languageCode,
      },
    };
  }

  /**
   * Submit a transcription for an audio recording
   *
   * @param speechRecordingId - ID of the speech recording being transcribed
   * @param transcriptionText - Transcribed text
   * @param userId - User ID who submitted the transcription
   * @returns Object with success status
   * @throws NotFoundException if recording not found
   * @throws BadRequestException if already transcribed or userId missing
   */
  async submitTranscription(
    speechRecordingId: string,
    transcriptionText: string,
    userId?: string,
  ) {
    // Sanitize transcription text
    const sanitizedText = sanitizeInput(transcriptionText);

    // Verify recording exists
    const recording = await this.prisma.speechRecording.findUnique({
      where: { id: speechRecordingId },
    });

    if (!recording) {
      throw new NotFoundException('Speech recording not found');
    }

    // Check if user already transcribed this recording
    if (userId) {
      const existing = await this.prisma.transcriptionReview.findFirst({
        where: {
          speechRecordingId,
          userId,
        },
      });

      if (existing) {
        throw new BadRequestException(
          'You have already transcribed this recording',
        );
      }
    }

    // Create transcription review (initially not approved)
    if (!userId) {
      throw new BadRequestException(
        'User ID is required to submit transcription',
      );
    }

    await this.prisma.transcriptionReview.create({
      data: {
        speechRecordingId,
        userId,
        transcriptionText: sanitizedText,
        isApproved: false,
      },
    });

    // Mark as completed
    if (userId) {
      await this.progress.markCompleted(
        userId,
        'audio',
        speechRecordingId,
        'transcribe',
      );
    }

    return { success: true };
  }

  /**
   * Get transcriptions available for review
   *
   * @param languageCode - Optional ISO 639-3 + ISO 15924 language code filter
   * @param userId - Optional user ID to exclude already reviewed transcriptions
   * @returns Array of transcription objects with audio and sentence info
   */
  async getTranscriptionsForReview(languageCode?: string, userId?: string) {
    const where: {
      isApproved: boolean;
    } = {
      isApproved: false, // Not yet reviewed
    };

    let reviews = await this.prisma.transcriptionReview.findMany({
      where,
      include: {
        speechRecording: {
          include: {
            sentence: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    // Filter by language if specified
    if (languageCode) {
      reviews = reviews.filter(
        (r) => r.speechRecording.sentence.languageCode === languageCode,
      );
    }

    // Exclude reviews already done by user
    if (userId) {
      const reviewedIds = await this.getReviewedTranscriptionIds(userId);
      reviews = reviews.filter((r) => !reviewedIds.has(r.id));
    }

    if (reviews.length === 0) {
      return [];
    }

    // Return array of all reviews (or just the first one if you want single item)
    return reviews.map((selected) => ({
      id: selected.id,
      speechRecordingId: selected.speechRecordingId,
      audioFile: selected.speechRecording.audioFile,
      transcriptionText: selected.transcriptionText,
      sentence: {
        id: selected.speechRecording.sentence.id,
        text: selected.speechRecording.sentence.text,
        languageCode: selected.speechRecording.sentence.languageCode,
      },
    }));
  }

  /**
   * Submit a review for a transcription (approve or reject)
   * When approved, the audio becomes available for Listen feature validation
   *
   * @param transcriptionReviewId - ID of the transcription review
   * @param isApproved - Whether to approve (true) or reject (false) the transcription
   * @param userId - User ID who submitted the review
   * @returns Object with success status and approval status
   * @throws NotFoundException if transcription review not found
   */
  async submitReview(
    transcriptionReviewId: string,
    isApproved: boolean,
    userId?: string,
  ) {
    return await this.prisma.$transaction(async (tx) => {
      // Existing review update logic
      const review = await tx.transcriptionReview.findUnique({
        where: { id: transcriptionReviewId },
        include: { speechRecording: true },
      });

      if (!review) {
        throw new NotFoundException('Transcription review not found');
      }

      await tx.transcriptionReview.update({
        where: { id: transcriptionReviewId },
        data: {
          isApproved,
          reviewedBy: userId,
          reviewedAt: new Date(),
        },
      });

      // If approved, count as Listen validation (only if userId provided)
      if (isApproved && userId) {
        // Check if user already validated this recording
        const existingValidation = await tx.validation.findUnique({
          where: {
            speechRecordingId_userId: {
              speechRecordingId: review.speechRecordingId,
              userId,
            },
          },
        });

        if (!existingValidation) {
          // Create validation record (counts as 'listen' validation)
          await tx.validation.create({
            data: {
              speechRecordingId: review.speechRecordingId,
              userId,
              isValid: true, // Approved = valid
            },
          });

          // Check total validations for threshold (25)
          const validationCount = await tx.validation.count({
            where: { speechRecordingId: review.speechRecordingId },
          });

          if (validationCount >= 25) {
            // Mark recording as validated
            await tx.speechRecording.update({
              where: { id: review.speechRecordingId },
              data: { isValidated: true },
            });
          }
        }
      }

      // Mark as completed (outside validation logic)
      if (userId) {
        await this.progress.markCompleted(
          userId,
          'transcription',
          transcriptionReviewId,
          'review',
        );
      }

      return { success: true, isApproved };
    });
  }

  private async getTranscribedRecordingIds(
    userId: string,
  ): Promise<Set<string>> {
    const transcriptions = await this.prisma.transcriptionReview.findMany({
      where: { userId },
      select: { speechRecordingId: true },
    });

    return new Set(transcriptions.map((t) => t.speechRecordingId));
  }

  private async getReviewedTranscriptionIds(
    userId: string,
  ): Promise<Set<string>> {
    const reviews = await this.prisma.transcriptionReview.findMany({
      where: { reviewedBy: userId },
      select: { id: true },
    });

    return new Set(reviews.map((r) => r.id));
  }
}
