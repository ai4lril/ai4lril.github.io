import { IsString, IsNotEmpty, IsOptional } from 'class-validator';

export class AnalyzeSentimentDto {
  @IsString()
  @IsNotEmpty()
  text: string;

  @IsOptional()
  @IsString()
  userId?: string;

  @IsOptional()
  @IsString()
  language?: string;
}
