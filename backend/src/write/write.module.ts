import { Module } from '@nestjs/common';
import { WriteController } from './write.controller';
import { WriteService } from './write.service';
import { PrismaModule } from '../prisma/prisma.module';
import { CacheModule } from '../cache/cache.module';
import { RealtimeModule } from '../realtime/realtime.module';

@Module({
  imports: [PrismaModule, CacheModule, RealtimeModule],
  controllers: [WriteController],
  providers: [WriteService],
  exports: [WriteService],
})
export class WriteModule { }
