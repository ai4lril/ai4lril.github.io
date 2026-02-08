import { IsString, IsNotEmpty, IsOptional, IsEnum } from 'class-validator';

export enum OAuthProvider {
  GOOGLE = 'GOOGLE',
  GITHUB = 'GITHUB',
}

export class LinkOAuthDto {
  @IsEnum(OAuthProvider)
  @IsNotEmpty()
  provider: 'GOOGLE' | 'GITHUB';

  @IsString()
  @IsNotEmpty()
  providerId: string;

  @IsOptional()
  @IsString()
  email?: string;
}

export class UnlinkOAuthDto {
  @IsEnum(OAuthProvider)
  @IsNotEmpty()
  provider: 'GOOGLE' | 'GITHUB';
}
