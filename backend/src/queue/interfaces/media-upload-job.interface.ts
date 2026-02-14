/**
 * Job data interface for media upload jobs
 */
export interface MediaUploadJobData {
  // Common fields
  userId?: string;
  mediaBuffer: Buffer;
  fileName: string;
  contentType: string;
  mediaType: 'audio' | 'video';
  duration?: number;

  // Audio-specific fields
  sentenceId?: string; // For speech recordings
  questionSubmissionId?: string; // For question answers
  languageCode?: string;

  // Blog-specific fields
  title?: string;
  description?: string;
  thumbnailUrl?: string; // For video blogs

  // Priority (higher number = higher priority)
  priority?: number;
}

/**
 * Job result interface
 */
export interface MediaUploadJobResult {
  success: boolean;
  blobStorageLink?: string;
  recordingId?: string;
  error?: string;
}
