import { IsString, IsNotEmpty, IsOptional } from 'class-validator';

export class TranslateDto {
  @IsString()
  @IsNotEmpty()
  text: string;

  @IsString()
  @IsNotEmpty()
  target_language: string;

  @IsOptional()
  @IsString()
  source_language?: string;

  @IsOptional()
  @IsString()
  sentenceId?: string;
}
