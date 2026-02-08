import { IsString, IsNotEmpty, IsOptional } from 'class-validator';

export class ProcessPosDto {
  @IsString()
  @IsNotEmpty()
  text: string;

  @IsOptional()
  @IsString()
  language?: string;

  @IsOptional()
  @IsString()
  sentenceId?: string;
}
