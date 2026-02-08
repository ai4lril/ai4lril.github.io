import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  OnGatewayConnection,
  OnGatewayDisconnect,
  MessageBody,
  ConnectedSocket,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { Logger } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../prisma/prisma.service';

@WebSocketGateway({
  cors: {
    origin: process.env.FRONTEND_URL || 'http://localhost:5577',
    credentials: true,
  },
  namespace: '/realtime',
})
export class RealtimeGateway
  implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  private readonly logger = new Logger(RealtimeGateway.name);
  private readonly connectedUsers = new Map<string, string>(); // socketId -> userId

  constructor(
    private readonly jwtService: JwtService,
    private readonly prisma: PrismaService,
  ) { }

  async handleConnection(client: Socket) {
    try {
      const token =
        client.handshake.auth.token ||
        client.handshake.headers.authorization?.replace('Bearer ', '');

      if (!token) {
        this.logger.warn(`Client ${client.id} connected without token`);
        client.disconnect();
        return;
      }

      const payload = this.jwtService.verify(token) as { id: string; sub: string };
      const userId = payload.id || payload.sub;

      if (!userId) {
        this.logger.warn(`Invalid token payload for client ${client.id}`);
        client.disconnect();
        return;
      }

      // Store connection
      this.connectedUsers.set(client.id, userId);
      client.data.userId = userId;

      // Join user room for targeted messaging
      await client.join(`user:${userId}`);

      // Log connection
      await this.prisma.webSocketConnection
        .create({
          data: {
            userId,
            socketId: client.id,
          },
        })
        .catch(() => {
          // Ignore errors if table doesn't exist yet
        });

      this.logger.log(`Client ${client.id} (user ${userId}) connected`);
    } catch (error) {
      this.logger.error(
        `Connection error for client ${client.id}: ${error instanceof Error ? error.message : 'Unknown error'}`,
      );
      client.disconnect();
    }
  }

  async handleDisconnect(client: Socket) {
    const userId = this.connectedUsers.get(client.id);

    if (userId) {
      this.connectedUsers.delete(client.id);

      // Update connection record
      await this.prisma.webSocketConnection
        .updateMany({
          where: { socketId: client.id },
          data: { disconnectedAt: new Date() },
        })
        .catch(() => {
          // Ignore errors
        });

      this.logger.log(`Client ${client.id} (user ${userId}) disconnected`);
    }
  }

  @SubscribeMessage('ping')
  handlePing(
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    @ConnectedSocket() _client: Socket,
  ) {
    return { event: 'pong', data: { timestamp: Date.now() } };
  }

  @SubscribeMessage('subscribe')
  handleSubscribe(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { channels: string[] },
  ) {
    const { userId } = client.data as { userId: string };
    if (!userId) {
      return { error: 'Not authenticated' };
    }

    data.channels.forEach((channel) => {
      client.join(channel);
      this.logger.log(`User ${userId} subscribed to channel ${channel}`);
    });

    return { success: true, subscribed: data.channels };
  }

  @SubscribeMessage('unsubscribe')
  handleUnsubscribe(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { channels: string[] },
  ) {
    data.channels.forEach((channel) => {
      client.leave(channel);
    });

    return { success: true, unsubscribed: data.channels };
  }

  // Methods to emit events
  emitToUser(userId: string, event: string, data: unknown) {
    this.server.to(`user:${userId}`).emit(event, data);
  }

  emitToRoom(room: string, event: string, data: unknown) {
    this.server.to(room).emit(event, data);
  }

  emitToAll(event: string, data: unknown) {
    this.server.emit(event, data);
  }

  // Notification events
  emitNotification(userId: string, notification: unknown) {
    this.emitToUser(userId, 'notification', notification);
  }

  // Activity feed events
  emitActivity(userId: string, activity: unknown) {
    this.emitToUser(userId, 'activity', activity);
  }

  // Real-time update events
  emitUpdate(resourceType: string, resourceId: string, update: unknown) {
    this.emitToRoom(`${resourceType}:${resourceId}`, 'update', update);
  }
}
