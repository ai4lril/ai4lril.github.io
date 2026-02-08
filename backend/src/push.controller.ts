import {
  Controller,
  Post,
  Delete,
  Body,
  UseGuards,
  Request,
} from '@nestjs/common';
import { PushService } from './push.service';
import { JwtAuthGuard } from './auth/jwt-auth.guard';

@Controller('notifications/push')
@UseGuards(JwtAuthGuard)
export class PushController {
  constructor(private readonly pushService: PushService) {}

  @Post('subscribe')
  async subscribe(
    @Request() req,
    @Body()
    subscription: {
      endpoint: string;
      keys: {
        p256dh: string;
        auth: string;
      };
    },
  ) {
    const userId = req.user.id;
    await this.pushService.subscribe(userId, subscription);
    return { success: true };
  }

  @Delete('unsubscribe')
  async unsubscribe(@Request() req, @Body() body: { endpoint: string }) {
    const userId = req.user.id;
    await this.pushService.unsubscribe(userId, body.endpoint);
    return { success: true };
  }

  @Post('public-key')
  getPublicKey() {
    const publicKey = this.pushService.getPublicKey();
    if (!publicKey) {
      return { error: 'Push notifications not configured' };
    }
    return { publicKey };
  }
}
