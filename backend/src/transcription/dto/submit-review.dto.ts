import { IsString, IsNotEmpty, IsBoolean } from 'class-validator';

export class SubmitReviewDto {
  @IsString()
  @IsNotEmpty()
  transcriptionReviewId: string;

  @IsBoolean()
  @IsNotEmpty()
  isApproved: boolean;
}
