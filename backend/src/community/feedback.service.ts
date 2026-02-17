import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { NotificationService } from '../notifications/notification.service';
import { WebhookService } from '../webhook/webhook.service';
import { getErrorMessage } from '../common/error-utils';

@Injectable()
export class FeedbackService {
  private readonly logger = new Logger(FeedbackService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly notificationService: NotificationService,
    private readonly webhookService: WebhookService,
  ) { }

  async submitFeedback(
    userId: string | null,
    type: string,
    subject: string,
    message: string,
  ) {
    try {
      const feedback = await this.prisma.feedback.create({
        data: {
          userId,
          type,
          subject,
          message,
          status: 'open',
        },
      });

      // Dispatch webhook (non-blocking)
      this.webhookService
        .dispatch('feedback.submitted', {
          feedbackId: feedback.id,
          type,
          subject,
          userId,
        })
        .catch((err) => this.logger.warn('Webhook dispatch failed:', err));

      return feedback;
    } catch (error) {
      this.logger.error(`Failed to submit feedback: ${getErrorMessage(error)}`);
      throw error;
    }
  }

  async getFeedback(userId?: string, status?: string, limit = 50, offset = 0) {
    const where: { userId?: string; status?: string } = {};
    if (userId) {
      where.userId = userId;
    }
    if (status) {
      where.status = status;
    }

    return this.prisma.feedback.findMany({
      where,
      orderBy: {
        createdAt: 'desc',
      },
      take: limit,
      skip: offset,
      include: {
        user: {
          select: {
            id: true,
            username: true,
            email: true,
          },
        },
      },
    });
  }

  async respondToFeedback(
    feedbackId: string,
    adminResponse: string,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    _adminUserId: string,
  ) {
    return this.prisma.feedback.update({
      where: { id: feedbackId },
      data: {
        adminResponse,
        status: 'resolved',
        respondedAt: new Date(),
      },
    });
  }
}
