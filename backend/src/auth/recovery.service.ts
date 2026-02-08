import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { EmailService } from '../notifications/email.service';
import { randomBytes } from 'crypto';
import * as bcrypt from 'bcryptjs';

@Injectable()
export class RecoveryService {
  private readonly logger = new Logger(RecoveryService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly emailService: EmailService,
  ) {}

  async requestPasswordReset(email: string): Promise<void> {
    try {
      const user = await this.prisma.user.findUnique({
        where: { email },
      });

      if (!user) {
        // Don't reveal if user exists
        this.logger.warn(
          `Password reset requested for non-existent email: ${email}`,
        );
        return;
      }

      // Generate reset token
      const resetToken = randomBytes(32).toString('hex');
      const expiresAt = new Date();
      expiresAt.setHours(expiresAt.getHours() + 1); // 1 hour expiration

      // Store reset token (in a real implementation, you'd have a separate table)
      // For now, we'll use a temporary approach
      await this.prisma.user.update({
        where: { id: user.id },
        data: {
          // Store token temporarily (in production, use a separate PasswordResetToken table)
          verificationToken: resetToken, // Reusing this field temporarily
          verificationTokenExpires: expiresAt,
        },
      });

      // Send reset email
      await this.emailService.sendPasswordResetEmail(user.email, resetToken);

      this.logger.log(`Password reset email sent to ${email}`);
    } catch (error) {
      this.logger.error(
        `Failed to send password reset email: ${error.message}`,
      );
      throw error;
    }
  }

  async resetPassword(token: string, newPassword: string): Promise<boolean> {
    try {
      const user = await this.prisma.user.findFirst({
        where: {
          verificationToken: token,
          verificationTokenExpires: {
            gt: new Date(),
          },
        },
      });

      if (!user) {
        return false;
      }

      // Hash new password
      const hashedPassword = await bcrypt.hash(newPassword, 12);

      // Update password and clear token
      await this.prisma.user.update({
        where: { id: user.id },
        data: {
          password: hashedPassword,
          verificationToken: null,
          verificationTokenExpires: null,
        },
      });

      this.logger.log(`Password reset successful for user ${user.id}`);
      return true;
    } catch (error) {
      this.logger.error(`Password reset failed: ${error.message}`);
      return false;
    }
  }
}
