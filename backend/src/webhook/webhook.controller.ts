import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  UseGuards,
  Request,
} from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { WebhookService } from './webhook.service';
import { CreateWebhookDto } from './dto/create-webhook.dto';
import { UpdateWebhookDto } from './dto/update-webhook.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RequestUser } from '../common/request-user.types';

@ApiTags('webhooks')
@Controller('webhooks')
@UseGuards(JwtAuthGuard)
export class WebhookController {
  constructor(private readonly webhookService: WebhookService) { }

  @Post()
  async create(@Request() req: { user: RequestUser }, @Body() dto: CreateWebhookDto) {
    const userId = req.user.id;
    return this.webhookService.create(userId, dto);
  }

  @Get()
  async findAll(
    @Request() req: { user: RequestUser & { role?: string } },
  ) {
    const userId = req.user.id;
    const userRole = req.user.role;
    return this.webhookService.findAll(userId, userRole);
  }

  @Get('events')
  getEventTypes() {
    return { events: this.webhookService.getEventTypes() };
  }

  @Get(':id')
  async findOne(
    @Param('id') id: string,
    @Request() req: { user: RequestUser & { role?: string } },
  ) {
    const userId = req.user.id;
    const userRole = req.user.role;
    return this.webhookService.findOne(id, userId, userRole);
  }

  @Put(':id')
  async update(
    @Param('id') id: string,
    @Request() req: { user: RequestUser & { role?: string } },
    @Body() dto: UpdateWebhookDto,
  ) {
    const userId = req.user.id;
    const userRole = req.user.role;
    return this.webhookService.update(id, userId, dto, userRole);
  }

  @Delete(':id')
  async remove(
    @Param('id') id: string,
    @Request() req: { user: RequestUser & { role?: string } },
  ) {
    const userId = req.user.id;
    const userRole = req.user.role;
    return this.webhookService.remove(id, userId, userRole);
  }
}
