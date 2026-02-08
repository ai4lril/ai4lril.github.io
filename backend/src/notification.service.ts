import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from './prisma/prisma.service';
import { EmailService } from './email.service';
import { CacheService } from './cache/cache.service';

export interface CreateNotificationDto {
  userId: string;
  type: string;
  title: string;
  message: string;
  actionUrl?: string;
  metadata?: Record<string, any>;
}

@Injectable()
export class NotificationService {
  private readonly logger = new Logger(NotificationService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly emailService: EmailService,
    private readonly cacheService: CacheService,
  ) {}

  async createNotification(dto: CreateNotificationDto): Promise<void> {
    try {
      // Get user notification preferences (create default if doesn't exist)
      let preferences = await this.prisma.notificationPreference.findUnique({
        where: { userId: dto.userId },
      });

      if (!preferences) {
        preferences = await this.prisma.notificationPreference.create({
          data: {
            userId: dto.userId,
            inAppEnabled: true,
            emailEnabled: true,
            pushEnabled: false,
            emailTypes: ['contribution', 'achievement', 'system'],
          },
        });
      }

      // Check if user wants in-app notifications
      const inAppEnabled = preferences?.inAppEnabled !== false; // Default to true

      if (inAppEnabled) {
        // Create in-app notification
        await this.prisma.notification.create({
          data: {
            userId: dto.userId,
            type: dto.type,
            title: dto.title,
            message: dto.message,
            actionUrl: dto.actionUrl,
            metadata: dto.metadata || {},
            read: false,
          },
        });

        // Invalidate notification count cache
        await this.cacheService.del(`notification_count:${dto.userId}`);
      }

      // Check if user wants email notifications for this type
      const emailEnabled = preferences?.emailEnabled !== false; // Default to true
      const emailForType = preferences?.emailTypes?.includes(dto.type) ?? true;

      if (emailEnabled && emailForType) {
        try {
          // Get user email
          const user = await this.prisma.user.findUnique({
            where: { id: dto.userId },
            select: { email: true },
          });

          if (user?.email) {
            await this.emailService.sendNotificationEmail(
              user.email,
              dto.title,
              dto.message,
              dto.actionUrl,
            );
          }
        } catch (error) {
          this.logger.error(
            `Failed to send email notification: ${error.message}`,
          );
          // Don't throw - in-app notification was created
        }
      }
    } catch (error) {
      this.logger.error(`Failed to create notification: ${error.message}`);
      throw error;
    }
  }

  async getNotifications(userId: string, limit = 50, offset = 0) {
    return this.prisma.notification.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      take: limit,
      skip: offset,
    });
  }

  async getUnreadCount(userId: string): Promise<number> {
    const cacheKey = `notification_count:${userId}`;
    const cached = await this.cacheService.get<number>(cacheKey);

    if (cached !== null) {
      return cached;
    }

    const count = await this.prisma.notification.count({
      where: {
        userId,
        read: false,
      },
    });

    await this.cacheService.set(cacheKey, count, 300); // 5 minute TTL
    return count;
  }

  async markAsRead(userId: string, notificationId: string): Promise<void> {
    await this.prisma.notification.updateMany({
      where: {
        id: notificationId,
        userId,
      },
      data: {
        read: true,
        readAt: new Date(),
      },
    });

    // Invalidate cache
    await this.cacheService.del(`notification_count:${userId}`);
  }

  async markAllAsRead(userId: string): Promise<void> {
    await this.prisma.notification.updateMany({
      where: {
        userId,
        read: false,
      },
      data: {
        read: true,
        readAt: new Date(),
      },
    });

    // Invalidate cache
    await this.cacheService.del(`notification_count:${userId}`);
  }

  async deleteNotification(
    userId: string,
    notificationId: string,
  ): Promise<void> {
    await this.prisma.notification.deleteMany({
      where: {
        id: notificationId,
        userId,
      },
    });

    // Invalidate cache
    await this.cacheService.del(`notification_count:${userId}`);
  }
}
