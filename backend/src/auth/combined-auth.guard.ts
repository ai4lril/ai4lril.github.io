import {
  Injectable,
  ExecutionContext,
  UnauthorizedException,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ApiKeyService } from './api-key.service';
import { PrismaService } from '../prisma/prisma.service';

type RequestWithHeaders = {
  headers: Record<string, string | string[] | undefined>;
  query: Record<string, string | string[] | undefined>;
  user?: {
    id: string;
    email: string;
    username: string;
    display_name: string;
    first_name: string;
    last_name: string;
  };
};

@Injectable()
export class CombinedAuthGuard extends AuthGuard('jwt') {
  constructor(
    private apiKeyService: ApiKeyService,
    private prisma: PrismaService,
  ) {
    super();
  }

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<RequestWithHeaders>();

    // Check for API key first
    const headerKey = request.headers['x-api-key'];
    const queryKey = request.query.api_key;
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

    if (apiKey) {
      const validation = await this.apiKeyService.validateApiKey(apiKey);
      if (validation) {
        // Attach user info to request
        const user = await this.prisma.user.findUnique({
          where: { id: validation.userId },
          select: {
            id: true,
            email: true,
            username: true,
            display_name: true,
            first_name: true,
            last_name: true,
          },
        });
        if (user) {
          request.user = user as RequestWithHeaders['user'];
          return true;
        }
      }
    }

    // Fall back to JWT authentication
    try {
      const result = await super.canActivate(context);
      return result as boolean;
    } catch {
      // If JWT auth fails and no API key was provided, require authentication
      if (!apiKey) {
        throw new UnauthorizedException(
          'Authentication required. Please login or provide an API key.',
        );
      }
      // If API key was provided but invalid, re-throw the error
      throw new UnauthorizedException('Invalid API key');
    }
  }
}
