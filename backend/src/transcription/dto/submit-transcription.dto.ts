import { IsString, IsNotEmpty } from 'class-validator';

export class SubmitTranscriptionDto {
  @IsString()
  @IsNotEmpty()
  speechRecordingId: string;

  @IsString()
  @IsNotEmpty()
  transcriptionText: string;
}
