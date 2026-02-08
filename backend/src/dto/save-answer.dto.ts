import { IsString, IsNotEmpty, IsOptional, IsNumber } from 'class-validator';
import { Type } from 'class-transformer';

export class SaveAnswerDto {
  @IsString()
  @IsNotEmpty()
  questionSubmissionId: string;

  @IsString()
  @IsNotEmpty()
  audioFile: string; // Base64 encoded

  @IsString()
  @IsNotEmpty()
  audioFormat: string;

  @Type(() => Number)
  @IsNumber()
  @IsOptional()
  duration?: number;
}
