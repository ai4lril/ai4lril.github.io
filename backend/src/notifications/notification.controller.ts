import {
  Controller,
  Get,
  Put,
  Delete,
  Param,
  Query,
  UseGuards,
  Request,
} from '@nestjs/common';
import { NotificationService } from './notification.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RequestUser } from '../common/request-user.types';

@Controller('notifications')
@UseGuards(JwtAuthGuard)
export class NotificationController {
  constructor(private readonly notificationService: NotificationService) { }

  @Get()
  async getNotifications(
    @Request() req: { user: RequestUser },
    @Query('limit') limit?: string,
    @Query('offset') offset?: string,
  ) {
    const userId = req.user.id;
    return this.notificationService.getNotifications(
      userId,
      limit ? parseInt(limit, 10) : 50,
      offset ? parseInt(offset, 10) : 0,
    );
  }

  @Get('unread-count')
  async getUnreadCount(@Request() req: { user: RequestUser }) {
    const userId = req.user.id;
    const count = await this.notificationService.getUnreadCount(userId);
    return { count };
  }

  @Put(':id/read')
  async markAsRead(@Request() req: { user: RequestUser }, @Param('id') id: string) {
    const userId = req.user.id;
    await this.notificationService.markAsRead(userId, id);
    return { success: true };
  }

  @Put('read-all')
  async markAllAsRead(@Request() req: { user: RequestUser }) {
    const userId = req.user.id;
    await this.notificationService.markAllAsRead(userId);
    return { success: true };
  }

  @Delete(':id')
  async deleteNotification(@Request() req: { user: RequestUser }, @Param('id') id: string) {
    const userId = req.user.id;
    await this.notificationService.deleteNotification(userId, id);
    return { success: true };
  }
}
