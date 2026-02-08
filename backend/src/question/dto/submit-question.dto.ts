import { IsString, IsNotEmpty } from 'class-validator';

export class SubmitQuestionDto {
  @IsString()
  @IsNotEmpty()
  questionText: string;

  @IsString()
  @IsNotEmpty()
  languageCode: string;
}
