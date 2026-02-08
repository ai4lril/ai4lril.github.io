import { IsBoolean, IsOptional, IsString } from 'class-validator';

export class ValidateSentenceDto {
  @IsBoolean()
  @IsOptional()
  valid?: boolean;

  @IsString()
  @IsOptional()
  comment?: string;
}

export class ValidateQuestionDto {
  @IsBoolean()
  @IsOptional()
  valid?: boolean;

  @IsString()
  @IsOptional()
  comment?: string;
}
