import { Injectable, BadRequestException, Logger } from '@nestjs/common';
import {
  S3Client,
  PutObjectCommand,
  GetObjectCommand,
  DeleteObjectCommand,
  HeadBucketCommand,
  CreateBucketCommand,
} from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { PrismaService } from '../prisma/prisma.service';
import { FileValidator } from './file-validator';
import { writeFile, unlink } from 'fs/promises';
import { join } from 'path';
import { tmpdir } from 'os';
import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

// Env vars: SEAWEEDFS_* (preferred) or MINIO_* (fallback)
function getStorageConfig() {
  const host =
    process.env.SEAWEEDFS_S3_HOST || process.env.MINIO_ENDPOINT || 'localhost';
  const port =
    process.env.SEAWEEDFS_S3_PORT || process.env.MINIO_PORT || '8333';
  const useSSL =
    process.env.SEAWEEDFS_USE_SSL === 'true' ||
    process.env.MINIO_USE_SSL === 'true';
  const accessKey =
    process.env.SEAWEEDFS_ACCESS_KEY ||
    process.env.MINIO_ACCESS_KEY ||
    's3admin';
  const secretKey =
    process.env.SEAWEEDFS_SECRET_KEY ||
    process.env.MINIO_SECRET_KEY ||
    's3secret';
  const bucket =
    process.env.SEAWEEDFS_BUCKET ||
    process.env.MINIO_BUCKET_NAME ||
    'voice-audio';
  const protocol = useSSL ? 'https' : 'http';
  const endpoint = `${protocol}://${host}:${port}`;
  return { host, port, useSSL, accessKey, secretKey, bucket, endpoint };
}

@Injectable()
export class StorageService {
  private s3Client: S3Client;
  private bucketName: string;
  private readonly config: ReturnType<typeof getStorageConfig>;
  private readonly logger = new Logger(StorageService.name);

  constructor(private prisma: PrismaService) {
    this.config = getStorageConfig();
    this.bucketName = this.config.bucket;

    this.s3Client = new S3Client({
      endpoint: this.config.endpoint,
      region: 'us-east-1',
      forcePathStyle: true,
      credentials: {
        accessKeyId: this.config.accessKey,
        secretAccessKey: this.config.secretKey,
      },
    });

    void this.ensureBucketExists();
  }

  private async ensureBucketExists() {
    try {
      await this.s3Client.send(
        new HeadBucketCommand({ Bucket: this.bucketName }),
      );
    } catch (error: unknown) {
      const isNotFound =
        error &&
        typeof error === 'object' &&
        'name' in error &&
        (error as { name: string }).name === 'NotFound';
      if (isNotFound) {
        await this.s3Client.send(
          new CreateBucketCommand({ Bucket: this.bucketName }),
        );
      } else {
        this.logger.error('Error ensuring bucket exists:', error);
      }
    }
  }

  /**
   * Upload audio file to SeaweedFS (S3-compatible) storage
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
   * Upload any media file (audio or video) to SeaweedFS (S3-compatible) storage
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

      await this.s3Client.send(
        new PutObjectCommand({
          Bucket: this.bucketName,
          Key: objectName,
          Body: buffer,
          ContentType: contentType,
        }),
      );

      // Return the blob storage link (path-style URL)
      return `${this.config.endpoint}/${this.bucketName}/${objectName}`;
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
      const command = new GetObjectCommand({
        Bucket: this.bucketName,
        Key: objectName,
      });
      return getSignedUrl(this.s3Client, command, { expiresIn: 86400 });
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'Unknown error';
      throw new BadRequestException(`Failed to get audio URL: ${errorMessage}`);
    }
  }

  async deleteAudio(objectName: string): Promise<void> {
    try {
      await this.s3Client.send(
        new DeleteObjectCommand({
          Bucket: this.bucketName,
          Key: objectName,
        }),
      );
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
