import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Request } from 'express';
import { ApiKeyService } from './api-key.service';

// Custom strategy for API key authentication
@Injectable()
export class ApiKeyStrategy extends PassportStrategy(
  class {
    name = 'api-key';
  },
  'api-key',
) {
  constructor(private apiKeyService: ApiKeyService) {
    super();
  }

  async validate(
    req: Request,
  ): Promise<{ id: string; apiKeyId: string; type: string } | null> {
    // Check for API key in header or query parameter
    const headerKey = req.headers['x-api-key'];
    const queryKey = req.query.api_key;
    let apiKey = '';
    if (typeof headerKey === 'string') {
      apiKey = headerKey;
    } else if (
      Array.isArray(headerKey) &&
      headerKey[0] &&
      typeof headerKey[0] === 'string'
    ) {
      apiKey = headerKey[0];
    } else if (typeof queryKey === 'string') {
      apiKey = queryKey;
    } else if (
      Array.isArray(queryKey) &&
      queryKey[0] &&
      typeof queryKey[0] === 'string'
    ) {
      apiKey = queryKey[0];
    }

    if (!apiKey) {
      return null;
    }

    const validation = await this.apiKeyService.validateApiKey(apiKey);
    if (!validation) {
      return null;
    }

    return {
      id: validation.userId,
      apiKeyId: validation.apiKeyId,
      type: 'api-key',
    };
  }
}
