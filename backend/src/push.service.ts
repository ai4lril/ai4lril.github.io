import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from './prisma/prisma.service';
import * as webpush from 'web-push';

@Injectable()
export class PushService {
  private readonly logger = new Logger(PushService.name);
  private vapidKeys: { publicKey: string; privateKey: string } | null = null;

  constructor(private readonly prisma: PrismaService) {
    // Initialize VAPID keys (should be set via environment variables in production)
    const publicKey = process.env.VAPID_PUBLIC_KEY;
    const privateKey = process.env.VAPID_PRIVATE_KEY;

    if (publicKey && privateKey) {
      this.vapidKeys = { publicKey, privateKey };
      webpush.setVapidDetails(
        process.env.VAPID_SUBJECT || 'mailto:noreply@voice-data-collection.com',
        publicKey,
        privateKey,
      );
    } else {
      this.logger.warn(
        'VAPID keys not configured. Push notifications will not work.',
      );
    }
  }

  async subscribe(
    userId: string,
    subscription: {
      endpoint: string;
      keys: {
        p256dh: string;
        auth: string;
      };
    },
  ): Promise<void> {
    try {
      await this.prisma.pushSubscription.upsert({
        where: {
          userId_endpoint: {
            userId,
            endpoint: subscription.endpoint,
          },
        },
        create: {
          userId,
          endpoint: subscription.endpoint,
          p256dh: subscription.keys.p256dh,
          auth: subscription.keys.auth,
        },
        update: {
          p256dh: subscription.keys.p256dh,
          auth: subscription.keys.auth,
        },
      });

      this.logger.log(`Push subscription created for user ${userId}`);
    } catch (error) {
      this.logger.error(`Failed to subscribe user ${userId}: ${error.message}`);
      throw error;
    }
  }

  async unsubscribe(userId: string, endpoint: string): Promise<void> {
    try {
      await this.prisma.pushSubscription.deleteMany({
        where: {
          userId,
          endpoint,
        },
      });

      this.logger.log(`Push subscription removed for user ${userId}`);
    } catch (error) {
      this.logger.error(
        `Failed to unsubscribe user ${userId}: ${error.message}`,
      );
      throw error;
    }
  }

  async sendNotification(
    userId: string,
    title: string,
    body: string,
    data?: Record<string, any>,
  ): Promise<void> {
    if (!this.vapidKeys) {
      this.logger.warn(
        'VAPID keys not configured. Cannot send push notification.',
      );
      return;
    }

    try {
      const subscriptions = await this.prisma.pushSubscription.findMany({
        where: { userId },
      });

      const payload = JSON.stringify({
        title,
        body,
        icon: '/icon-192.png',
        badge: '/icon-192.png',
        data: data || {},
      });

      const promises = subscriptions.map(async (subscription) => {
        try {
          await webpush.sendNotification(
            {
              endpoint: subscription.endpoint,
              keys: {
                p256dh: subscription.p256dh,
                auth: subscription.auth,
              },
            },
            payload,
          );
        } catch (error: any) {
          // If subscription is invalid, remove it
          if (error.statusCode === 410 || error.statusCode === 404) {
            await this.unsubscribe(userId, subscription.endpoint);
          }
          throw error;
        }
      });

      await Promise.allSettled(promises);
      this.logger.log(`Push notification sent to user ${userId}`);
    } catch (error) {
      this.logger.error(
        `Failed to send push notification to user ${userId}: ${error.message}`,
      );
      throw error;
    }
  }

  getPublicKey(): string | null {
    return this.vapidKeys?.publicKey || null;
  }
}
