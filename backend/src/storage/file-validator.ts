/**
 * File type validation using magic bytes (file signatures)
 */
export class FileValidator {
  // Audio file magic bytes - can be single array or array of arrays
  private static readonly AUDIO_SIGNATURES: {
    [key: string]: number[] | number[][];
  } = {
    webm: [0x1a, 0x45, 0xdf, 0xa3], // WebM starts with EBML header
    wav: [0x52, 0x49, 0x46, 0x46], // RIFF
    mp3: [
      [0xff, 0xfb], // MP3 with ID3v2
      [0xff, 0xf3], // MP3
      [0xff, 0xf2], // MP3
      [0x49, 0x44, 0x33], // ID3 tag
    ],
    ogg: [0x4f, 0x67, 0x67, 0x53], // OggS
    mpeg: [0xff, 0xfb], // MPEG audio
  };

  // Video file magic bytes
  private static readonly VIDEO_SIGNATURES: {
    [key: string]: number[] | number[][];
  } = {
    webm: [0x1a, 0x45, 0xdf, 0xa3], // WebM video shares EBML header with audio webm
    mp4: [
      [0x00, 0x00, 0x00, 0x18, 0x66, 0x74, 0x79, 0x70], // ftyp box (24 bytes)
      [0x00, 0x00, 0x00, 0x1c, 0x66, 0x74, 0x79, 0x70], // ftyp box (28 bytes)
      [0x00, 0x00, 0x00, 0x20, 0x66, 0x74, 0x79, 0x70], // ftyp box (32 bytes)
    ],
  };

  // Combined signatures for generic media detection
  private static readonly MEDIA_SIGNATURES: {
    [key: string]: number[] | number[][];
  } = {
    ...FileValidator.AUDIO_SIGNATURES,
    mp4: [
      [0x00, 0x00, 0x00, 0x18, 0x66, 0x74, 0x79, 0x70],
      [0x00, 0x00, 0x00, 0x1c, 0x66, 0x74, 0x79, 0x70],
      [0x00, 0x00, 0x00, 0x20, 0x66, 0x74, 0x79, 0x70],
    ],
  };

  /**
   * Validate audio file by checking magic bytes
   */
  static validateAudioFile(buffer: Buffer, expectedFormat: string): boolean {
    return this.validateFileSignature(
      buffer,
      expectedFormat,
      this.AUDIO_SIGNATURES,
    );
  }

  /**
   * Validate video file by checking magic bytes
   */
  static validateVideoFile(buffer: Buffer, expectedFormat: string): boolean {
    return this.validateFileSignature(
      buffer,
      expectedFormat,
      this.VIDEO_SIGNATURES,
    );
  }

  /**
   * Validate any media file (audio or video) by checking magic bytes
   */
  static validateMediaFile(buffer: Buffer, expectedFormat: string): boolean {
    return this.validateFileSignature(
      buffer,
      expectedFormat,
      this.MEDIA_SIGNATURES,
    );
  }

  private static validateFileSignature(
    buffer: Buffer,
    expectedFormat: string,
    signatures: { [key: string]: number[] | number[][] },
  ): boolean {
    if (buffer.length < 4) {
      return false;
    }

    const sig = signatures[expectedFormat.toLowerCase()];
    if (!sig) {
      return false; // Unknown format
    }

    return this.matchesAnySignature(buffer, sig);
  }

  private static matchesAnySignature(
    buffer: Buffer,
    signatures: number[] | number[][],
  ): boolean {
    // Handle both single array and array of arrays
    if (
      Array.isArray(signatures[0]) &&
      Array.isArray((signatures as number[][])[0])
    ) {
      // Array of arrays (multiple signature options)
      for (const sig of signatures as number[][]) {
        if (this.matchesSignature(buffer, sig)) {
          return true;
        }
      }
      return false;
    }

    // Single array
    return this.matchesSignature(buffer, signatures as number[]);
  }

  private static matchesSignature(
    buffer: Buffer,
    signature: number[],
  ): boolean {
    if (buffer.length < signature.length) {
      return false;
    }

    for (let i = 0; i < signature.length; i++) {
      if (buffer[i] !== signature[i]) {
        return false;
      }
    }

    return true;
  }

  /**
   * Detect audio format from magic bytes
   */
  static detectAudioFormat(buffer: Buffer): string | null {
    return this.detectFormatFromSignatures(buffer, this.AUDIO_SIGNATURES);
  }

  /**
   * Detect video format from magic bytes
   */
  static detectVideoFormat(buffer: Buffer): string | null {
    return this.detectFormatFromSignatures(buffer, this.VIDEO_SIGNATURES);
  }

  /**
   * Detect any media format (audio or video) from magic bytes
   */
  static detectMediaFormat(buffer: Buffer): string | null {
    return this.detectFormatFromSignatures(buffer, this.MEDIA_SIGNATURES);
  }

  private static detectFormatFromSignatures(
    buffer: Buffer,
    signatures: { [key: string]: number[] | number[][] },
  ): string | null {
    if (buffer.length < 4) {
      return null;
    }

    for (const [format, sig] of Object.entries(signatures)) {
      if (this.matchesAnySignature(buffer, sig)) {
        return format;
      }
    }

    return null;
  }
}
