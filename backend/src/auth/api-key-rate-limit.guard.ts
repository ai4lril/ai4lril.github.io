import { Injectable, UnauthorizedException, SetMetadata } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import {
  ThrottlerGuard,
  ThrottlerException,
  ThrottlerRequest,
  ThrottlerModuleOptions,
  ThrottlerStorageService,
} from '@nestjs/throttler';
import { ApiKeyService } from './api-key.service';
import { ApiKeyRateLimitService } from './api-key-rate-limit.service';
import type {
  Request as ExpressRequest,
  Response as ExpressResponse,
} from 'express';
import type { ApiKeyInfo } from './api-key.service';

export const USE_API_KEY_RATE_LIMIT = 'useApiKeyRateLimit';
export const UseApiKeyRateLimit = () =>
  SetMetadata(USE_API_KEY_RATE_LIMIT, true);

interface TypedRequest extends ExpressRequest {
  apiKeyInfo?: ApiKeyInfo;
}

@Injectable()
export class ApiKeyRateLimitGuard extends ThrottlerGuard {
  constructor(
    protected readonly reflector: Reflector,
    protected readonly storageService: ThrottlerStorageService,
    protected readonly options: ThrottlerModuleOptions,
    private apiKeyService: ApiKeyService,
    private apiKeyRateLimitService: ApiKeyRateLimitService,
  ) {
    super(options, storageService, reflector);
  }

  async handleRequest(requestProps: ThrottlerRequest): Promise<boolean> {
    const { context, limit, ttl } = requestProps;
    const request = context.switchToHttp().getRequest<TypedRequest>();
    const response = context.switchToHttp().getResponse<ExpressResponse>();

    const useApiKeyRateLimit =
      this.reflector.getAllAndOverride<boolean>(USE_API_KEY_RATE_LIMIT, [
        context.getHandler(),
        context.getClass(),
      ]) ?? false;

    if (!useApiKeyRateLimit) {
      return true;
    }

    const apiKey =
      (request.headers['x-api-key'] as string) ||
      (request.query.api_key as string);

    if (!apiKey) {
      throw new UnauthorizedException('API key required');
    }

    const apiKeyInfo = await this.apiKeyService.validateApiKey(apiKey);

    if (!apiKeyInfo) {
      throw new UnauthorizedException('Invalid or expired API key');
    }

    request.apiKeyInfo = apiKeyInfo;

    const { allowed, remaining, resetTime } =
      await this.apiKeyRateLimitService.checkRateLimit(
        apiKeyInfo.apiKeyId,
        limit,
        ttl,
      );

    response.setHeader('X-RateLimit-Limit', limit.toString());
    response.setHeader('X-RateLimit-Remaining', remaining.toString());
    response.setHeader('X-RateLimit-Reset', resetTime.toString());

    if (!allowed) {
      throw new ThrottlerException(
        `Rate limit exceeded. Try again in ${ttl} seconds.`,
      );
    }

    return true;
  }
}
