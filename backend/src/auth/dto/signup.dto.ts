import {
  IsNotEmpty,
  IsEmail,
  IsOptional,
  IsDateString,
  IsString,
  MinLength,
  Matches,
} from 'class-validator';

export class SignupDto {
  @IsNotEmpty()
  @IsString()
  first_name: string;

  @IsNotEmpty()
  @IsString()
  last_name: string;

  @IsNotEmpty()
  @IsString()
  display_name: string;

  @IsNotEmpty()
  @IsString()
  username: string;

  @IsNotEmpty()
  @IsString()
  @MinLength(8, {
    message: 'Password must be at least 8 characters long',
  })
  @Matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/, {
    message:
      'Password must contain at least one uppercase letter, one lowercase letter, and one number',
  })
  password: string;

  @IsEmail()
  @IsNotEmpty()
  email: string;

  @IsOptional()
  @IsString()
  phone_number?: string;

  @IsOptional()
  @IsString()
  current_residence_pincode?: string;

  @IsOptional()
  @IsString()
  birth_place_pincode?: string;

  @IsOptional()
  @IsDateString()
  birth_date?: string;

  @IsOptional()
  @IsString()
  gender?: string;

  @IsOptional()
  @IsString()
  religion?: string;

  @IsOptional()
  @IsString()
  mother?: string;

  @IsOptional()
  @IsString()
  first_language?: string;

  @IsOptional()
  @IsString()
  second_language?: string;

  @IsOptional()
  @IsString()
  third_language?: string;

  @IsOptional()
  @IsString()
  fourth_language?: string;

  @IsOptional()
  @IsString()
  fifth_language?: string;

  @IsOptional()
  @IsString()
  profile_picture_url?: string;
}
