import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { EmailService } from '../notifications/email.service';
import { CacheService } from '../cache/cache.service';
import { randomBytes } from 'crypto';
import * as bcrypt from 'bcryptjs';

@Injectable()
export class RecoveryService {
  private readonly logger = new Logger(RecoveryService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly emailService: EmailService,
    private readonly cacheService: CacheService,
  ) { }

  async requestPasswordReset(email: string): Promise<void> {
    // Rate limit: max 3 requests per email per hour
    const rateLimitKey = `password_reset:${email.toLowerCase()}`;
    const requestCount = (await this.cacheService.get<number>(rateLimitKey)) || 0;
    if (requestCount >= 3) {
      this.logger.warn(`Password reset rate limit exceeded for ${email}`);
      return; // Don't reveal rate limit
    }

    const user = await this.prisma.user.findUnique({
      where: { email: email.toLowerCase() },
    });

    if (!user) {
      this.logger.warn(`Password reset requested for non-existent email: ${email}`);
      return;
    }

    // OAuth users without password cannot reset
    if (!user.password) {
      this.logger.warn(`Password reset requested for OAuth-only user: ${email}`);
      return;
    }

    try {
      const resetToken = randomBytes(32).toString('hex');
      const expiresAt = new Date();
      expiresAt.setHours(expiresAt.getHours() + 1);

      // Invalidate any existing tokens for this user
      await this.prisma.passwordResetToken.updateMany({
        where: { userId: user.id, usedAt: null },
        data: { usedAt: new Date() },
      });

      await this.prisma.passwordResetToken.create({
        data: {
          userId: user.id,
          token: resetToken,
          expiresAt,
        },
      });

      await this.emailService.sendPasswordResetEmail(user.email, resetToken);
      await this.cacheService.set(rateLimitKey, requestCount + 1, 3600);

      this.logger.log(`Password reset email sent to ${email}`);
    } catch (error) {
      this.logger.error(
        `Failed to send password reset email: ${error instanceof Error ? error.message : 'Unknown error'}`,
      );
      throw error;
    }
  }

  async resetPassword(token: string, newPassword: string): Promise<boolean> {
    const resetRecord = await this.prisma.passwordResetToken.findUnique({
      where: { token },
      include: { user: true },
    });

    if (!resetRecord || resetRecord.usedAt || resetRecord.expiresAt < new Date()) {
      return false;
    }

    try {
      const hashedPassword = await bcrypt.hash(newPassword, 12);

      await this.prisma.$transaction([
        this.prisma.user.update({
          where: { id: resetRecord.userId },
          data: { password: hashedPassword },
        }),
        this.prisma.passwordResetToken.update({
          where: { id: resetRecord.id },
          data: { usedAt: new Date() },
        }),
      ]);

      this.logger.log(`Password reset successful for user ${resetRecord.userId}`);
      return true;
    } catch (error) {
      this.logger.error(
        `Password reset failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
      );
      return false;
    }
  }
}
