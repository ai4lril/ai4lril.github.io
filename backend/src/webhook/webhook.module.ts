import { Module, forwardRef } from '@nestjs/common';
import { WebhookService } from './webhook.service';
import { WebhookController } from './webhook.controller';
import { WebhookDeliveryProcessor } from './webhook-delivery.processor';
import { PrismaModule } from '../prisma/prisma.module';
import { QueueModule } from '../queue/queue.module';

@Module({
  imports: [PrismaModule, forwardRef(() => QueueModule)],
  controllers: [WebhookController],
  providers: [WebhookService, WebhookDeliveryProcessor],
  exports: [WebhookService],
})
export class WebhookModule { }
