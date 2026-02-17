import { Injectable, BadRequestException, Logger } from '@nestjs/common';
import * as MinIO from 'minio';
import { PrismaService } from '../prisma/prisma.service';
import { FileValidator } from './file-validator';
import { writeFile, unlink } from 'fs/promises';
import { join } from 'path';
import { tmpdir } from 'os';
import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

@Injectable()
export class StorageService {
  private minioClient: MinIO.Client;
  private bucketName: string;
  private readonly logger = new Logger(StorageService.name);

  constructor(private prisma: PrismaService) {
    this.minioClient = new MinIO.Client({
      endPoint: process.env.MINIO_ENDPOINT || 'localhost',
      port: parseInt(process.env.MINIO_PORT || '9000'),
      useSSL: process.env.MINIO_USE_SSL === 'true',
      accessKey: process.env.MINIO_ACCESS_KEY || 'minioadmin',
      secretKey: process.env.MINIO_SECRET_KEY || 'minioadmin',
    });

    this.bucketName = process.env.MINIO_BUCKET_NAME || 'voice-audio';
    void this.ensureBucketExists();
  }

  private async ensureBucketExists() {
    try {
      const exists = await this.minioClient.bucketExists(this.bucketName);
      if (!exists) {
        await this.minioClient.makeBucket(this.bucketName, 'us-east-1');
      }
    } catch (error) {
      console.error('Error ensuring bucket exists:', error);
    }
  }

  /**
   * Upload audio file to MinIO storage
   * Kept for backward compatibility - delegates to uploadMedia
   */
  async uploadAudio(
    buffer: Buffer,
    fileName: string,
    contentType: string = 'audio/webm',
  ): Promise<string> {
    return this.uploadMedia(buffer, fileName, contentType, 'audio');
  }

  /**
   * Upload any media file (audio or video) to MinIO storage
   *
   * @param buffer - File buffer
   * @param fileName - Name for the stored file
   * @param contentType - MIME type (e.g., 'audio/webm', 'video/webm', 'video/mp4')
   * @param mediaType - 'audio' or 'video'
   * @returns Blob storage link URL
   */
  async uploadMedia(
    buffer: Buffer,
    fileName: string,
    contentType: string,
    mediaType: string = 'audio',
  ): Promise<string> {
    // Extract format from contentType (e.g., 'audio/webm' -> 'webm', 'video/mp4' -> 'mp4')
    const format =
      contentType.split('/')[1] || fileName.split('.').pop() || 'webm';

    // Validate file type using magic bytes
    const detectedFormat = FileValidator.detectMediaFormat(buffer);
    if (!detectedFormat) {
      throw new BadRequestException(
        `Invalid ${mediaType} file: Could not detect file format from file content`,
      );
    }

    // Verify detected format matches expected format
    if (detectedFormat !== format.toLowerCase()) {
      throw new BadRequestException(
        `File format mismatch: Expected ${format} but detected ${detectedFormat}. File may be corrupted or incorrectly labeled.`,
      );
    }

    // Validate file format
    if (!FileValidator.validateMediaFile(buffer, format)) {
      throw new BadRequestException(
        `Invalid ${format} ${mediaType} file: File signature does not match expected format`,
      );
    }

    try {
      // Use appropriate path prefix based on media type
      const pathPrefix = mediaType === 'video' ? 'video' : 'audio';
      const objectName = `${pathPrefix}/${Date.now()}-${fileName}`;

      await this.minioClient.putObject(
        this.bucketName,
        objectName,
        buffer,
        buffer.length,
        {
          'Content-Type': contentType,
        },
      );

      // Return the blob storage link
      const protocol = process.env.MINIO_USE_SSL === 'true' ? 'https' : 'http';
      const port = process.env.MINIO_PORT || '9000';
      const endpoint = process.env.MINIO_ENDPOINT || 'localhost';

      return `${protocol}://${endpoint}:${port}/${this.bucketName}/${objectName}`;
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'Unknown error';
      throw new BadRequestException(
        `Failed to upload ${mediaType}: ${errorMessage}`,
      );
    }
  }

  async getAudioUrl(objectName: string): Promise<string> {
    try {
      // Generate presigned URL valid for 1 day
      return this.minioClient.presignedGetObject(
        this.bucketName,
        objectName,
        86400,
      );
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'Unknown error';
      throw new BadRequestException(`Failed to get audio URL: ${errorMessage}`);
    }
  }

  async deleteAudio(objectName: string): Promise<void> {
    try {
      await this.minioClient.removeObject(this.bucketName, objectName);
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'Unknown error';
      throw new BadRequestException(`Failed to delete audio: ${errorMessage}`);
    }
  }

  async saveAudioMetadata(
    speechRecordingId: string,
    userId: string,
    blobStorageLink: string,
    audioDuration: number,
    languageCode: string,
  ) {
    // Get user demographics
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: {
        gender: true,
        birth_date: true,
        current_residence_pincode: true,
        birthplace_pincode: true,
      },
    });

    if (!user) {
      throw new BadRequestException('User not found');
    }

    // Calculate age group from birth_date (handle nullable)
    const ageGroup = user.birth_date
      ? this.calculateAgeGroup(user.birth_date)
      : null;

    // Derive region and state from pincode (simplified - would need actual pincode database)
    const region = user.current_residence_pincode
      ? this.deriveRegionFromPincode(user.current_residence_pincode)
      : null;
    const state = user.current_residence_pincode
      ? this.deriveStateFromPincode(user.current_residence_pincode)
      : null;

    return this.prisma.audioMetadata.create({
      data: {
        speechRecordingId,
        userId,
        blobStorageLink,
        audioDuration,
        timestamp: new Date(),
        languageCode,
        gender: user.gender,
        ageGroup,
        region,
        state,
      },
    });
  }

  private calculateAgeGroup(birthDate: Date): string {
    const age = Math.floor(
      (Date.now() - birthDate.getTime()) / (365.25 * 24 * 60 * 60 * 1000),
    );

    if (age < 18) return 'under_18';
    if (age < 25) return '18_24';
    if (age < 35) return '25_34';
    if (age < 45) return '35_44';
    if (age < 55) return '45_54';
    if (age < 65) return '55_64';
    return '65_plus';
  }

  private deriveRegionFromPincode(pincode: string): string | null {
    // Simplified - would need actual pincode database
    // For now, return null or implement basic logic
    // Parameter kept for future implementation
    void pincode; // Mark as intentionally unused
    return null;
  }

  private deriveStateFromPincode(pincode: string): string | null {
    // Simplified - would need actual pincode database
    // For now, return null or implement basic logic
    // Parameter kept for future implementation
    void pincode; // Mark as intentionally unused
    return null;
  }

  /**
   * Extract media duration from buffer using ffprobe
   * Falls back to null if ffprobe is not available or fails
   *
   * @param buffer - Media file buffer
   * @param format - File format (webm, wav, mp3, mp4, etc.)
   * @param mediaType - 'audio' or 'video'
   * @returns Duration in seconds, or null if extraction fails
   */
  async extractMediaDuration(
    buffer: Buffer,
    format: string,
    mediaType: string = 'audio',
  ): Promise<number | null> {
    try {
      // Create temporary file for ffprobe
      const tempFilePath = join(
        tmpdir(),
        `media-${Date.now()}-${Math.random().toString(36).substring(7)}.${format}`,
      );

      try {
        // Write buffer to temp file
        await writeFile(tempFilePath, buffer);

        // Use ffprobe command to get duration
        // ffprobe -v error -show_entries format=duration -of default=noprint_wrappers=1:nokey=1 <file>
        const { stdout } = await execAsync(
          `ffprobe -v error -show_entries format=duration -of default=noprint_wrappers=1:nokey=1 "${tempFilePath}"`,
        );

        const duration = parseFloat(stdout.trim());
        if (duration && isFinite(duration) && duration > 0) {
          return duration;
        } else {
          throw new Error('Invalid duration from ffprobe');
        }
      } finally {
        // Clean up temp file
        try {
          await unlink(tempFilePath);
        } catch (cleanupError) {
          this.logger.warn('Failed to cleanup temp file:', cleanupError);
        }
      }
    } catch (error: unknown) {
      // ffprobe might not be installed - this is acceptable
      // Frontend already calculates duration, so this is just for validation
      const code = error && typeof error === 'object' && 'code' in error ? (error as { code: string }).code : undefined;
      if (code !== 'ENOENT') {
        this.logger.warn(
          `Failed to extract ${mediaType} duration using ffprobe:`,
          error instanceof Error ? error.message : String(error),
        );
      }
      return null;
    }
  }

  /**
   * Validate duration value
   * Ensures duration is within acceptable bounds
   *
   * @param duration - Duration in seconds
   * @param mediaType - 'audio' or 'video'
   * @throws BadRequestException if duration is invalid
   */
  validateDuration(duration: number, mediaType: string = 'audio'): void {
    const MIN_DURATION = 0.5; // 0.5 seconds minimum
    const MAX_DURATION_AUDIO = 300; // 5 minutes for audio
    const MAX_DURATION_VIDEO = 600; // 10 minutes for video
    const MAX_DURATION =
      mediaType === 'video' ? MAX_DURATION_VIDEO : MAX_DURATION_AUDIO;

    if (!isFinite(duration) || duration <= 0) {
      throw new BadRequestException(
        `Invalid duration: ${duration}. Duration must be a positive number.`,
      );
    }

    if (duration < MIN_DURATION) {
      throw new BadRequestException(
        `Recording too short (${duration.toFixed(1)}s). Minimum duration is ${MIN_DURATION}s.`,
      );
    }

    if (duration > MAX_DURATION) {
      throw new BadRequestException(
        `Recording too long (${duration.toFixed(1)}s). Maximum duration is ${MAX_DURATION}s for ${mediaType}.`,
      );
    }
  }
}
