import { IsString, IsNotEmpty, IsOptional } from 'class-validator';

export class DetectEmotionDto {
  @IsString()
  @IsNotEmpty()
  text: string;

  @IsOptional()
  @IsString()
  language?: string;
}
