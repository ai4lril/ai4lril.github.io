import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from './prisma/prisma.service';
import { EmailService } from './notifications/email.service';
import { randomBytes } from 'crypto';

@Injectable()
export class VerificationService {
  private readonly logger = new Logger(VerificationService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly emailService: EmailService,
  ) { }

  async sendVerificationEmail(userId: string): Promise<void> {
    try {
      const user = await this.prisma.user.findUnique({
        where: { id: userId },
        select: { email: true, isVerified: true },
      });

      if (!user) {
        throw new Error('User not found');
      }

      if (user.isVerified) {
        return; // Already verified
      }

      // Generate verification token
      const token = randomBytes(32).toString('hex');
      const expiresAt = new Date();
      expiresAt.setHours(expiresAt.getHours() + 24); // 24 hour expiration

      await this.prisma.user.update({
        where: { id: userId },
        data: {
          verificationToken: token,
          verificationTokenExpires: expiresAt,
        },
      });

      // Send verification email
      await this.emailService.sendVerificationEmail(user.email, token);

      this.logger.log(`Verification email sent to user ${userId}`);
    } catch (error) {
      this.logger.error(`Failed to send verification email: ${error instanceof Error ? error.message : 'Unknown error'}`);
      throw error;
    }
  }

  async verifyEmail(token: string): Promise<boolean> {
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

      await this.prisma.user.update({
        where: { id: user.id },
        data: {
          isVerified: true,
          verificationToken: null,
          verificationTokenExpires: null,
        },
      });

      this.logger.log(`User ${user.id} email verified`);
      return true;
    } catch (error) {
      this.logger.error(`Email verification failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
      return false;
    }
  }

  async checkVerificationStatus(userId: string): Promise<boolean> {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { isVerified: true },
    });

    return user?.isVerified || false;
  }
}
