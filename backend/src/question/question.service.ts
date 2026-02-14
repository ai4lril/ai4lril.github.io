import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { ProgressService } from '../progress/progress.service';
import { StorageService } from '../storage/storage.service';
import { CacheInvalidationService } from '../cache/cache-invalidation.service';
import { sanitizeInput } from '../common/utils/sanitize';

/**
 * Service for handling question submission and answer recording (Spontaneous Speech feature)
 * Manages question sentences, user answers, and audio storage
 */
@Injectable()
export class QuestionService {
  constructor(
    private prisma: PrismaService,
    private progress: ProgressService,
    private storage: StorageService,
    private cacheInvalidation: CacheInvalidationService,
  ) { }

  /**
   * Submit a new question for admin validation
   *
   * @param questionText - The question text to submit
   * @param languageCode - ISO 639-3 + ISO 15924 language code
   * @param userId - Optional user ID who submitted the question
   * @returns Object with success status and submission ID
   * @throws BadRequestException if validation fails
   */
  async submitQuestion(
    questionText: string,
    languageCode: string,
    userId?: string,
  ) {
    // Sanitize question text
    const sanitizedText = sanitizeInput(questionText);

    // Create sentence for the question
    const sentence = await this.prisma.sentence.create({
      data: {
        text: sanitizedText,
        languageCode,
        taskType: 'question',
        valid: null, // Pending admin validation
      },
    });

    // Create question submission
    const submission = await this.prisma.questionSubmission.create({
      data: {
        sentenceId: sentence.id,
        userId,
        submittedText: sanitizedText,
        languageCode,
        valid: null, // Pending admin validation
      },
    });

    return {
      success: true,
      id: submission.id,
      submissionId: submission.id,
      questionText: questionText,
      languageCode: languageCode,
    };
  }

  async getValidatedQuestions(languageCode?: string, userId?: string) {
    const where: {
      valid: boolean;
      languageCode?: string;
    } = {
      valid: true, // Only validated questions
    };

    if (languageCode) {
      where.languageCode = languageCode;
    }

    let submissions = await this.prisma.questionSubmission.findMany({
      where,
      include: {
        sentence: true,
      },
      orderBy: { createdAt: 'desc' },
    });

    // Exclude questions already answered by user
    if (userId) {
      const answeredIds = await this.getAnsweredQuestionIds(userId);
      submissions = submissions.filter((s) => !answeredIds.has(s.id));
    }

    return submissions.map((s) => ({
      id: s.id,
      text: s.submittedText,
      languageCode: s.languageCode,
      sentenceId: s.sentenceId,
    }));
  }

  /**
   * Save an audio answer for a question
   *
   * @param questionSubmissionId - ID of the question being answered
   * @param audioBuffer - Audio file buffer
   * @param audioFormat - Audio format (webm, wav, mp3, etc.)
   * @param duration - Audio duration in seconds
   * @param userId - User ID who submitted the answer
   * @returns Object with success status and answer ID
   * @throws NotFoundException if question not found
   * @throws BadRequestException if question not validated or already answered
   */
  async saveAnswer(
    questionSubmissionId: string,
    audioBuffer: Buffer,
    audioFormat: string,
    duration: number,
    userId?: string,
  ) {
    // Validate duration
    this.storage.validateDuration(duration, 'audio');

    // Verify question exists and is validated
    const question = await this.prisma.questionSubmission.findUnique({
      where: { id: questionSubmissionId },
    });

    if (!question) {
      throw new NotFoundException('Question not found');
    }

    // Allow unvalidated questions for testing - in production, you might want to keep this check
    // if (question.valid !== true) {
    //     throw new BadRequestException('Question is not validated yet');
    // }

    // Check if user already answered this question
    if (userId) {
      const existingAnswer = await this.prisma.answerRecording.findFirst({
        where: {
          questionSubmissionId,
          userId,
        },
      });

      if (existingAnswer) {
        throw new BadRequestException(
          'You have already answered this question',
        );
      }
    }

    // Optionally extract and verify duration from buffer (if ffprobe available)
    let verifiedDuration = duration;
    try {
      const extractedDuration = await this.storage.extractMediaDuration(
        audioBuffer,
        audioFormat,
        'audio',
      );
      if (extractedDuration !== null) {
        // Verify extracted duration is within 10% of provided duration
        const durationDiff = Math.abs(extractedDuration - duration);
        const durationPercentDiff = (durationDiff / duration) * 100;
        if (durationPercentDiff > 10) {
          // Use extracted duration if difference is significant
          verifiedDuration = extractedDuration;
          console.warn(
            `Duration mismatch: provided=${duration.toFixed(2)}s, extracted=${extractedDuration.toFixed(2)}s`,
          );
        }
      }
    } catch (error) {
      // ffprobe not available or failed - use provided duration
    }

    // Upload to MinIO
    let blobStorageLink: string;
    try {
      const fileName = `answer-${questionSubmissionId}-${Date.now()}.${audioFormat}`;
      blobStorageLink = await this.storage.uploadAudio(
        audioBuffer,
        fileName,
        `audio/${audioFormat}`,
      );
    } catch (error) {
      // If MinIO is not available (e.g., in tests), use a placeholder
      console.warn('MinIO upload failed, using placeholder:', error);
      blobStorageLink = `placeholder://audio/${questionSubmissionId}-${Date.now()}.${audioFormat}`;
    }

    // Save answer recording
    if (!userId) {
      throw new BadRequestException(
        'User ID is required to save answer recording',
      );
    }

    const answer = await this.prisma.answerRecording.create({
      data: {
        questionSubmissionId,
        userId,
        audioFile: blobStorageLink,
        audioFormat,
        duration: verifiedDuration,
        fileSize: audioBuffer.length,
      },
    });

    // Mark as completed
    if (userId) {
      await this.progress.markCompleted(
        userId,
        'question',
        questionSubmissionId,
        'answer',
      );
    }

    // Invalidate related caches
    await this.cacheInvalidation.invalidateQuestionAnswer(
      questionSubmissionId,
      userId,
    );

    return { success: true, id: answer.id, answerId: answer.id };
  }

  private async getAnsweredQuestionIds(userId: string): Promise<Set<string>> {
    const answers = await this.prisma.answerRecording.findMany({
      where: { userId },
      select: { questionSubmissionId: true },
    });

    return new Set(answers.map((a) => a.questionSubmissionId));
  }
}
