import { IsString, IsNotEmpty, IsOptional, IsNumber } from 'class-validator';

export class SaveRecordingDto {
  @IsString()
  @IsNotEmpty()
  sentenceId: string;

  @IsString()
  @IsNotEmpty()
  audioFile: string; // Base64 encoded

  @IsString()
  @IsNotEmpty()
  audioFormat: string;

  @IsString()
  @IsOptional()
  mediaType?: string; // 'audio' or 'video', defaults to 'audio'

  @IsNumber()
  @IsOptional()
  duration?: number;
}
