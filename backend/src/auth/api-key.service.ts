import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import * as bcrypt from 'bcryptjs';
import * as crypto from 'crypto';

// UserRole enum - defined in Prisma schema, will be available after client generation
type UserRole = 'USER' | 'MODERATOR' | 'ADMIN' | 'SUPER_ADMIN';

// Export the ApiKeyInfo interface
export interface ApiKeyInfo {
  apiKeyId: string;
  userId: string;
  user: {
    id: string;
    email: string;
    createdAt: Date;
    updatedAt: Date;
    role: UserRole;
  };
  name: string;
  expiresAt?: Date;
  metadata?: Record<string, unknown>; // Made optional since ApiKey model doesn't have it
}

@Injectable()
export class ApiKeyService {
  constructor(private prisma: PrismaService) {}

  /**
   * Generate a new API key for a user
   * Returns the plain text key (shown only once) and stores the hashed version
   *
   * @param userId - User ID to generate the API key for
   * @param name - Descriptive name for the API key
   * @param expiresAt - Optional expiration date for the API key
   * @returns Object containing the plain text key (display once), ID, name, and expiration
   * @throws Error if key generation fails
   */
  async generateApiKey(
    userId: string,
    name: string,
    expiresAt?: Date,
  ): Promise<{ id: string; key: string; name: string; expiresAt?: Date }> {
    // Generate a secure random API key
    const plainKey = `${crypto.randomBytes(32).toString('hex')}`;

    // Hash the key before storing
    const hashedKey = await bcrypt.hash(plainKey, 10);

    // Create API key record
    const apiKey = await this.prisma.apiKey.create({
      data: {
        userId,
        key: hashedKey,
        keyPrefix: 'ilhrf_',
        name,
        expiresAt,
        isActive: true,
      },
    });

    // Return plain key only once (frontend should display and store securely)
    return {
      id: apiKey.id,
      key: plainKey,
      name: apiKey.name,
      expiresAt: apiKey.expiresAt || undefined,
    };
  }

  /**
   * Validate an API key and return the associated user
   * Uses hash prefix for efficient lookup before expensive bcrypt comparison
   */
  async validateApiKey(apiKey: string): Promise<ApiKeyInfo | null> {
    const apiKeys = await this.prisma.apiKey.findMany({
      where: {
        OR: [
          {
            key: {
              startsWith: apiKey,
            },
          },
          {
            key: apiKey,
          },
        ],
      },
      include: {
        user: true,
      },
    });

    for (const key of apiKeys) {
      if (await bcrypt.compare(apiKey, key.key)) {
        if (key.expiresAt && key.expiresAt < new Date()) {
          await this.prisma.apiKey.update({
            where: { id: key.id },
            data: { isActive: false },
          });
          return null;
        }
        return {
          apiKeyId: key.id,
          userId: key.userId,
          user: {
            id: key.user.id,
            email: key.user.email,
            createdAt: key.user.created_at,
            updatedAt: key.user.updated_at,
            role:
              (key.user as { role?: UserRole }).role || ('USER' as UserRole),
          },
          name: key.name,
          expiresAt: key.expiresAt || undefined,
          metadata: {}, // Empty metadata since ApiKey model doesn't store it
        };
      }
    }
    return null;
  }

  /**
   * Get all API keys for a user
   *
   * @param userId - User ID to retrieve API keys for
   * @returns Array of API key metadata (never includes the actual key)
   */
  async getUserApiKeys(userId: string) {
    return this.prisma.apiKey.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        name: true,
        lastUsedAt: true,
        expiresAt: true,
        isActive: true,
        createdAt: true,
        updatedAt: true,
        // Never return the actual key
      },
    });
  }

  /**
   * Revoke (deactivate) an API key
   *
   * @param userId - User ID who owns the API key
   * @param apiKeyId - ID of the API key to revoke
   * @throws NotFoundException if API key not found or user doesn't own it
   */
  async revokeApiKey(userId: string, apiKeyId: string): Promise<void> {
    const apiKey = await this.prisma.apiKey.findUnique({
      where: { id: apiKeyId },
    });

    if (!apiKey) {
      throw new NotFoundException('API key not found');
    }

    if (apiKey.userId !== userId) {
      // Return 404 instead of 401 to prevent information leakage
      throw new NotFoundException('API key not found');
    }

    await this.prisma.apiKey.update({
      where: { id: apiKeyId },
      data: { isActive: false },
    });
  }

  /**
   * Update API key name or expiration
   *
   * @param userId - User ID who owns the API key
   * @param apiKeyId - ID of the API key to update
   * @param data - Update data (name and/or expiresAt)
   * @returns Updated API key metadata
   * @throws NotFoundException if API key not found or user doesn't own it
   */
  async updateApiKey(
    userId: string,
    apiKeyId: string,
    data: { name?: string; expiresAt?: Date },
  ): Promise<{ id: string; name: string; expiresAt?: Date }> {
    const apiKey = await this.prisma.apiKey.findUnique({
      where: { id: apiKeyId },
    });

    if (!apiKey) {
      throw new NotFoundException('API key not found');
    }

    if (apiKey.userId !== userId) {
      // Return 404 instead of 401 to prevent information leakage
      throw new NotFoundException('API key not found');
    }

    const updated = await this.prisma.apiKey.update({
      where: { id: apiKeyId },
      data,
      select: {
        id: true,
        name: true,
        expiresAt: true,
      },
    });

    return {
      id: updated.id,
      name: updated.name,
      expiresAt: updated.expiresAt || undefined,
    };
  }
}
