import { IsString, IsNotEmpty, IsArray, IsOptional } from 'class-validator';

export class SavePosAnnotationDto {
  @IsString()
  @IsNotEmpty()
  sentenceId: string;

  @IsOptional()
  @IsArray()
  annotations?: any[];

  @IsOptional()
  @IsArray()
  tags?: any[];

  @IsOptional()
  @IsString()
  languageCode?: string;
}
