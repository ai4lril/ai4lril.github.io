import { IsArray, IsBoolean, IsOptional, IsString, IsUrl, MaxLength } from 'class-validator';

export class CreateWebhookDto {
  @IsUrl()
  url: string;

  @IsOptional()
  @IsString()
  @MaxLength(512)
  secret?: string;

  @IsOptional()
  @IsString()
  @MaxLength(255)
  description?: string;

  @IsArray()
  @IsString({ each: true })
  eventTypes: string[];

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}
