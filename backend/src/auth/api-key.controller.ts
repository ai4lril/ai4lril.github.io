import {
  Get,
  Put,
  Body,
  Post,
  Param,
  Delete,
  Request,
  UseGuards,
  Controller,
  ValidationPipe,
  Req,
} from '@nestjs/common';
import { ApiKeyService } from './api-key.service';
import { JwtAuthGuard } from './jwt-auth.guard';
import { RolesGuard, Roles } from './rbac.guard';
import type { User } from '@prisma/client';
import { UpdateApiKeyDto } from './dto/update-api-key.dto';

@Controller('auth/api-keys')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('USER')
export class ApiKeyController {
  constructor(private readonly apiKeyService: ApiKeyService) {}

  @Post()
  async createApiKey(
    @Body() body: { name: string; expiresAt?: string },
    @Req() req: { user: User },
  ) {
    const expiresAt = body.expiresAt ? new Date(body.expiresAt) : undefined;
    return this.apiKeyService.generateApiKey(req.user.id, body.name, expiresAt);
  }

  @Get()
  async getApiKeys(@Req() req: { user: User }) {
    return this.apiKeyService.getUserApiKeys(req.user.id);
  }

  @Delete(':id')
  async deleteApiKey(@Param('id') id: string, @Req() req: { user: User }) {
    return this.apiKeyService.revokeApiKey(req.user.id, id);
  }

  @Put(':id')
  async updateApiKey(
    @Req() req: { user: User },
    @Param('id') id: string,
    @Body(ValidationPipe) updateDto: UpdateApiKeyDto,
  ) {
    const expiresAt = updateDto.expiresAt
      ? new Date(updateDto.expiresAt)
      : undefined;
    return await this.apiKeyService.updateApiKey(req.user.id, id, {
      name: updateDto.name,
      expiresAt,
    });
  }
}
