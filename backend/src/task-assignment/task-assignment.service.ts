import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Sentence } from '@prisma/client';

/** User context for task assignment (level, preferred languages) */
interface UserContext {
  level: number;
  languagesContributed: string[];
}

/** Sentence with recording count for prioritization */
export interface SentenceWithRecordingCount extends Sentence {
  _recordingCount?: number;
}

@Injectable()
export class TaskAssignmentService {
  constructor(private readonly prisma: PrismaService) { }

  /**
   * Get user context for task assignment (level, preferred languages).
   * Returns default context when userId is missing or user not found.
   */
  async getUserContext(userId?: string): Promise<UserContext> {
    if (!userId) {
      return { level: 1, languagesContributed: [] };
    }

    const [user, userStats] = await Promise.all([
      this.prisma.user.findUnique({
        where: { id: userId },
        select: { level: true },
      }),
      this.prisma.userStats.findUnique({
        where: { userId },
        select: { languagesContributed: true },
      }),
    ]);

    const level = user?.level ?? 1;
    const languagesContributed =
      (userStats?.languagesContributed as string[] | null) ?? [];

    return { level, languagesContributed };
  }

  /**
   * Get preferred difficulty for user level.
   * Beginners (1-2): easy; intermediate (3-5): medium; advanced (6+): hard.
   */
  getPreferredDifficulty(level: number): 'easy' | 'medium' | 'hard' {
    if (level <= 2) return 'easy';
    if (level <= 5) return 'medium';
    return 'hard';
  }

  /**
   * Score a sentence for speech recording assignment.
   * Higher score = better match.
   */
  scoreSpeechSentence(
    sentence: SentenceWithRecordingCount,
    ctx: UserContext,
  ): number {
    let score = 0;

    // Difficulty matching: prefer sentences matching user level
    const preferred = this.getPreferredDifficulty(ctx.level);
    const difficulty = (sentence.difficulty ?? 'medium').toLowerCase();
    if (difficulty === preferred) {
      score += 100;
    } else if (
      (preferred === 'easy' && difficulty === 'medium') ||
      (preferred === 'medium' && (difficulty === 'easy' || difficulty === 'hard')) ||
      (preferred === 'hard' && difficulty === 'medium')
    ) {
      score += 50;
    }

    // Language preference: boost languages user has contributed to
    if (
      ctx.languagesContributed.length > 0 &&
      sentence.languageCode &&
      ctx.languagesContributed.includes(sentence.languageCode)
    ) {
      score += 80;
    }

    // Task prioritization: prefer under-collected sentences (fewer recordings)
    const recordingCount = sentence._recordingCount ?? 0;
    score += Math.max(0, 50 - recordingCount); // Up to 50 points for 0 recordings

    return score;
  }

  /**
   * Rank speech sentences by assignment score (highest first).
   * Adds variety by shuffling ties.
   */
  rankSpeechSentences(
    sentences: SentenceWithRecordingCount[],
    ctx: UserContext,
  ): SentenceWithRecordingCount[] {
    return [...sentences].sort((a, b) => {
      const scoreA = this.scoreSpeechSentence(a, ctx);
      const scoreB = this.scoreSpeechSentence(b, ctx);
      if (scoreB !== scoreA) return scoreB - scoreA;
      // Tie-break: randomize for variety
      return Math.random() - 0.5;
    });
  }

  /**
   * Score a validation recording for assignment.
   * Prefer: fewer validations, longer wait, user's language.
   */
  scoreValidationRecording(
    recording: { id: string; createdAt: Date; sentence: { languageCode: string } },
    validationCount: number,
    ctx: UserContext,
  ): number {
    let score = 0;

    // Prioritize recordings with fewer validations (need more reviews)
    score += Math.max(0, 100 - validationCount * 4);

    // Prioritize recordings waiting longest (older = higher score)
    const ageHours =
      (Date.now() - recording.createdAt.getTime()) / (1000 * 60 * 60);
    score += Math.min(50, ageHours * 2);

    // Language preference
    if (
      ctx.languagesContributed.length > 0 &&
      ctx.languagesContributed.includes(recording.sentence.languageCode)
    ) {
      score += 30;
    }

    return score;
  }

  /**
   * Pick the best validation recording from the list.
   */
  pickBestValidationRecording<T extends { id: string; createdAt: Date; sentence: { languageCode: string } }>(
    recordings: T[],
    validationCounts: Map<string, number>,
    ctx: UserContext,
  ): T | null {
    if (recordings.length === 0) return null;

    let best = recordings[0];
    let bestScore = this.scoreValidationRecording(
      best,
      validationCounts.get(best.id) ?? 0,
      ctx,
    );

    for (let i = 1; i < recordings.length; i++) {
      const r = recordings[i];
      const s = this.scoreValidationRecording(
        r,
        validationCounts.get(r.id) ?? 0,
        ctx,
      );
      if (s > bestScore) {
        best = r;
        bestScore = s;
      }
    }

    return best;
  }

  /**
   * Score a question for assignment.
   */
  scoreQuestion(
    question: { id: string; languageCode: string; _answerCount?: number },
    ctx: UserContext,
  ): number {
    let score = 0;

    // Language preference
    if (
      ctx.languagesContributed.length > 0 &&
      ctx.languagesContributed.includes(question.languageCode)
    ) {
      score += 80;
    }

    // Prefer under-answered questions
    const answerCount = question._answerCount ?? 0;
    score += Math.max(0, 50 - answerCount);

    return score;
  }

  /**
   * Rank questions by assignment score.
   */
  rankQuestions<T extends { id: string; languageCode: string; _answerCount?: number }>(
    questions: T[],
    ctx: UserContext,
  ): T[] {
    return [...questions].sort((a, b) => {
      const scoreA = this.scoreQuestion(a, ctx);
      const scoreB = this.scoreQuestion(b, ctx);
      if (scoreB !== scoreA) return scoreB - scoreA;
      return Math.random() - 0.5;
    });
  }

  /**
   * Score a transcription recording.
   */
  scoreTranscriptionRecording(
    recording: { id: string; createdAt: Date; sentence: { languageCode: string } },
    ctx: UserContext,
  ): number {
    let score = 0;

    // Prioritize older recordings (waiting longest)
    const ageHours =
      (Date.now() - recording.createdAt.getTime()) / (1000 * 60 * 60);
    score += Math.min(100, ageHours * 5);

    // Language preference
    if (
      ctx.languagesContributed.length > 0 &&
      ctx.languagesContributed.includes(recording.sentence.languageCode)
    ) {
      score += 50;
    }

    return score;
  }

  /**
   * Pick the best transcription recording.
   */
  pickBestTranscriptionRecording<T extends { id: string; createdAt: Date; sentence: { languageCode: string } }>(
    recordings: T[],
    ctx: UserContext,
  ): T | null {
    if (recordings.length === 0) return null;

    let best = recordings[0];
    let bestScore = this.scoreTranscriptionRecording(best, ctx);

    for (let i = 1; i < recordings.length; i++) {
      const r = recordings[i];
      const s = this.scoreTranscriptionRecording(r, ctx);
      if (s > bestScore) {
        best = r;
        bestScore = s;
      }
    }

    return best;
  }
}
