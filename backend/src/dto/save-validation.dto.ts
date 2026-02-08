import { IsString, IsNotEmpty, IsBoolean } from 'class-validator';

export class SaveValidationDto {
  @IsString()
  @IsNotEmpty()
  speechRecordingId: string;

  @IsBoolean()
  @IsNotEmpty()
  isValid: boolean;
}
