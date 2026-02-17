import { Injectable, Logger } from '@nestjs/common';
import { getErrorMessage } from '../common/error-utils';
import { MailerService } from '@nestjs-modules/mailer';
import { PrismaService } from '../prisma/prisma.service';
import { CacheService } from '../cache/cache.service';

export interface EmailOptions {
  to: string;
  subject: string;
  template: string;
  context?: Record<string, any>;
}

@Injectable()
export class EmailService {
  private readonly logger = new Logger(EmailService.name);

  constructor(
    private readonly mailerService: MailerService,
    private readonly prisma: PrismaService,
    private readonly cacheService: CacheService,
  ) { }

  async sendEmail(options: EmailOptions): Promise<void> {
    try {
      // Check rate limit
      const rateLimitKey = `email_rate_limit:${options.to}`;
      const emailCount =
        (await this.cacheService.get<number>(rateLimitKey)) || 0;

      if (emailCount >= 10) {
        this.logger.warn(`Rate limit exceeded for ${options.to}`);
        throw new Error('Email rate limit exceeded');
      }

      // Send email
      await this.mailerService.sendMail({
        to: options.to,
        subject: options.subject,
        template: options.template,
        context: options.context || {},
      });

      // Update rate limit
      await this.cacheService.set(rateLimitKey, emailCount + 1, 3600); // 1 hour TTL

      // Log to email queue for tracking
      await this.prisma.emailQueue.create({
        data: {
          to: options.to,
          subject: options.subject,
          template: options.template,
          context: options.context,
          status: 'sent',
          sentAt: new Date(),
        },
      });

      this.logger.log(`Email sent successfully to ${options.to}`);
    } catch (error) {
      const errMsg = getErrorMessage(error);
      this.logger.error(`Failed to send email to ${options.to}: ${errMsg}`);

      // Log failed email to queue
      await this.prisma.emailQueue
        .create({
          data: {
            to: options.to,
            subject: options.subject,
            template: options.template,
            context: options.context,
            status: 'failed',
            error: errMsg,
            sentAt: new Date(),
          },
        })
        .catch(() => {
          // Ignore errors when logging failed emails
        });

      throw error;
    }
  }

  async sendWelcomeEmail(to: string, name: string): Promise<void> {
    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5577';
    await this.sendEmail({
      to,
      subject: 'Welcome to ILHRF Data Collection Platform',
      template: 'welcome',
      context: { name, frontendUrl },
    });
  }

  async sendNotificationEmail(
    to: string,
    title: string,
    message: string,
    actionUrl?: string,
  ): Promise<void> {
    await this.sendEmail({
      to,
      subject: title,
      template: 'notification',
      context: {
        title,
        message,
        actionUrl,
      },
    });
  }

  async sendPasswordResetEmail(to: string, resetToken: string): Promise<void> {
    const resetUrl = `${process.env.FRONTEND_URL}/auth/reset-password?token=${resetToken}`;
    await this.sendEmail({
      to,
      subject: 'Password Reset Request',
      template: 'password-reset',
      context: {
        resetUrl,
      },
    });
  }

  async sendVerificationEmail(
    to: string,
    verificationToken: string,
  ): Promise<void> {
    const verificationUrl = `${process.env.FRONTEND_URL}/auth/verify?token=${verificationToken}`;
    await this.sendEmail({
      to,
      subject: 'Verify Your Email Address',
      template: 'verification',
      context: {
        verificationUrl,
      },
    });
  }

  async sendAdminAlert(
    to: string,
    alertType: string,
    message: string,
    severity: 'low' | 'medium' | 'high' | 'critical',
  ): Promise<void> {
    await this.sendEmail({
      to,
      subject: `[${severity.toUpperCase()}] Admin Alert: ${alertType}`,
      template: 'admin-alert',
      context: {
        alertType,
        message,
        severity,
      },
    });
  }
}
