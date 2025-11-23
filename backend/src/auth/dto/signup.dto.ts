import {
  IsNotEmpty,
  IsEmail,
  IsOptional,
  IsDateString,
  IsString,
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
  password: string;

  @IsEmail()
  @IsNotEmpty()
  email: string;

  @IsNotEmpty()
  @IsString()
  phone_number: string;

  @IsNotEmpty()
  @IsString()
  current_residence_pincode: string;

  @IsNotEmpty()
  @IsString()
  birth_place_pincode: string;

  @IsDateString()
  @IsNotEmpty()
  birth_date: string;

  @IsNotEmpty()
  @IsString()
  gender: string;

  @IsOptional()
  @IsString()
  religion?: string;

  @IsOptional()
  @IsString()
  mother?: string;

  @IsNotEmpty()
  @IsString()
  first_language: string;

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
