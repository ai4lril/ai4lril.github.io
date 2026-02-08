import { IsString, IsNotEmpty, IsArray, IsOptional } from 'class-validator';

export class SaveNerAnnotationDto {
  @IsString()
  @IsNotEmpty()
  sentenceId: string;

  @IsArray()
  @IsNotEmpty()
  annotations: any[];

  @IsOptional()
  @IsString()
  languageCode?: string;
}
