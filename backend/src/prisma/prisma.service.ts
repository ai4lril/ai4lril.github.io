import { Injectable, OnModuleInit, INestApplication } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit {
  async onModuleInit() {
    // Connection is handled automatically in Prisma v5+
  }

  enableShutdownHooks(app: INestApplication) {
    // Shutdown hook implementation
    process.on('SIGTERM', async () => {
      await app.close();
    });
    process.on('SIGINT', async () => {
      await app.close();
    });
  }
}
