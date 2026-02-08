import { IsString, IsNotEmpty, IsOptional } from 'class-validator';

export class SubmitSentencesDto {
  @IsString()
  @IsNotEmpty()
  languageCode: string;

  @IsOptional()
  @IsString()
  citation?: string;

  // Accept either string or array
  sentences: string | string[];
}
