import { BadRequestException, Injectable, Logger, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateWebhookDto } from './dto/create-webhook.dto';
import { UpdateWebhookDto } from './dto/update-webhook.dto';
import { WEBHOOK_EVENT_TYPES } from './constants';
import { createHmac } from 'crypto';
import { InjectQueue } from '@nestjs/bullmq';
import { Queue } from 'bullmq';

export interface WebhookPayload {
  event: string;
  timestamp: string;
  data: Record<string, unknown>;
}

export interface WebhookDeliveryJobData {
  webhookId: string;
  eventType: string;
  payload: WebhookPayload;
}

@Injectable()
export class WebhookService {
  private readonly logger = new Logger(WebhookService.name);

  constructor(
    private readonly prisma: PrismaService,
    @InjectQueue('{webhook-delivery}') private readonly webhookQueue: Queue,
  ) { }

  /**
   * Generate HMAC-SHA256 signature for webhook payload.
   * Recipients can verify using: crypto.createHmac('sha256', secret).update(body).digest('hex')
   */
  generateSignature(payload: string, secret: string): string {
    return createHmac('sha256', secret).update(payload).digest('hex');
  }

  async create(userId: string, dto: CreateWebhookDto) {
    this.validateEventTypes(dto.eventTypes);
    return this.prisma.webhook.create({
      data: {
        userId,
        url: dto.url,
        secret: dto.secret ?? null,
        description: dto.description ?? null,
        eventTypes: dto.eventTypes,
        isActive: dto.isActive ?? true,
      },
    });
  }

  async findAll(userId: string, userRole?: string) {
    const where: { userId?: string } = {};
    if (userRole !== 'ADMIN' && userRole !== 'SUPER_ADMIN') {
      where.userId = userId;
    }
    return this.prisma.webhook.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        url: true,
        description: true,
        eventTypes: true,
        isActive: true,
        createdAt: true,
        updatedAt: true,
      },
    });
  }

  async findOne(id: string, userId: string, userRole?: string) {
    const where: { id: string; userId?: string } = { id };
    if (userRole !== 'ADMIN' && userRole !== 'SUPER_ADMIN') {
      where.userId = userId;
    }
    const webhook = await this.prisma.webhook.findFirst({ where });
    if (!webhook) {
      throw new NotFoundException(`Webhook ${id} not found`);
    }
    return webhook;
  }

  async update(id: string, userId: string, dto: UpdateWebhookDto, userRole?: string) {
    await this.findOne(id, userId, userRole);
    if (dto.eventTypes) {
      this.validateEventTypes(dto.eventTypes);
    }
    return this.prisma.webhook.update({
      where: { id },
      data: {
        ...(dto.url !== undefined && { url: dto.url }),
        ...(dto.secret !== undefined && { secret: dto.secret }),
        ...(dto.description !== undefined && { description: dto.description }),
        ...(dto.eventTypes !== undefined && { eventTypes: dto.eventTypes }),
        ...(dto.isActive !== undefined && { isActive: dto.isActive }),
      },
    });
  }

  async remove(id: string, userId: string, userRole?: string) {
    await this.findOne(id, userId, userRole);
    return this.prisma.webhook.delete({ where: { id } });
  }

  getEventTypes(): string[] {
    return [...WEBHOOK_EVENT_TYPES];
  }

  /**
   * Dispatch a webhook event to all registered webhooks subscribed to this event type.
   */
  async dispatch(eventType: string, data: Record<string, unknown>) {
    const webhooks = await this.prisma.webhook.findMany({
      where: {
        isActive: true,
        eventTypes: { has: eventType },
      },
    });

    const payload: WebhookPayload = {
      event: eventType,
      timestamp: new Date().toISOString(),
      data,
    };

    for (const webhook of webhooks) {
      await this.webhookQueue.add(
        'deliver',
        { webhookId: webhook.id, eventType, payload } as WebhookDeliveryJobData,
        { attempts: 5, backoff: { type: 'exponential', delay: 2000 } },
      );
    }

    this.logger.log(`Dispatched ${eventType} to ${webhooks.length} webhook(s)`);
  }

  private validateEventTypes(eventTypes: string[]) {
    const valid = new Set(WEBHOOK_EVENT_TYPES);
    const invalid = eventTypes.filter((e) => !valid.has(e as (typeof WEBHOOK_EVENT_TYPES)[number]));
    if (invalid.length > 0) {
      throw new BadRequestException(
        `Invalid event types: ${invalid.join(', ')}. Valid: ${WEBHOOK_EVENT_TYPES.join(', ')}`,
      );
    }
  }
}
