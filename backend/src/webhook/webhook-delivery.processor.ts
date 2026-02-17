import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Logger } from '@nestjs/common';
import { Job } from 'bullmq';
import { PrismaService } from '../prisma/prisma.service';
import { WebhookService } from './webhook.service';
import type { WebhookDeliveryJobData } from './webhook.service';

@Processor('{webhook-delivery}', { concurrency: 5 })
export class WebhookDeliveryProcessor extends WorkerHost {
  private readonly logger = new Logger(WebhookDeliveryProcessor.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly webhookService: WebhookService,
  ) {
    super();
  }

  async process(job: Job<WebhookDeliveryJobData>): Promise<void> {
    const { webhookId, eventType, payload } = job.data;

    const webhook = await this.prisma.webhook.findUnique({
      where: { id: webhookId },
    });

    if (!webhook || !webhook.isActive) {
      this.logger.warn(`Webhook ${webhookId} not found or inactive, skipping`);
      return;
    }

    const body = JSON.stringify(payload);
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      'User-Agent': 'Linguistic-Data-Collection-Webhook/1.0',
      'X-Webhook-Event': eventType,
      'X-Webhook-Timestamp': payload.timestamp,
    };

    if (webhook.secret) {
      headers['X-Webhook-Signature'] = `sha256=${this.webhookService.generateSignature(body, webhook.secret)}`;
    }

    const delivery = await this.prisma.webhookDelivery.create({
      data: {
        webhookId,
        eventType,
        payload: payload as unknown as object,
        status: 'pending',
        attempts: 0,
        maxAttempts: 5,
      },
    });

    try {
      const response = await fetch(webhook.url, {
        method: 'POST',
        headers,
        body,
        signal: AbortSignal.timeout(30000),
      });

      const responseBody = await response.text();

      await this.prisma.webhookDelivery.update({
        where: { id: delivery.id },
        data: {
          status: response.ok ? 'success' : 'failed',
          attempts: 1,
          lastAttemptAt: new Date(),
          responseStatus: response.status,
          responseBody: responseBody.slice(0, 2000),
          error: response.ok ? null : `HTTP ${response.status}`,
        },
      });

      if (!response.ok) {
        throw new Error(`Webhook returned ${response.status}`);
      }

      this.logger.log(`Webhook ${webhookId} delivered successfully (${response.status})`);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      await this.prisma.webhookDelivery.update({
        where: { id: delivery.id },
        data: {
          status: 'failed',
          attempts: 1,
          lastAttemptAt: new Date(),
          error: errorMessage.slice(0, 1000),
        },
      });
      this.logger.warn(`Webhook ${webhookId} delivery failed: ${errorMessage}`);
      throw error;
    }
  }
}
