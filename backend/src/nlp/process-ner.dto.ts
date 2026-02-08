import { IsString, IsNotEmpty, IsOptional, IsArray } from 'class-validator';

export class ProcessNerDto {
  @IsString()
  @IsNotEmpty()
  text: string;

  @IsOptional()
  @IsArray()
  annotations?: any[];

  @IsOptional()
  @IsString()
  language?: string;

  @IsOptional()
  @IsString()
  sentenceId?: string;
}
