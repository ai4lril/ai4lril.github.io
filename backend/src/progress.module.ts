import { Module } from '@nestjs/common';
import { ProgressService } from './progress.service';
import { PrismaModule } from './prisma/prisma.module';
import { CacheModule } from './cache/cache.module';

@Module({
  imports: [PrismaModule, CacheModule],
  providers: [ProgressService],
  exports: [ProgressService],
})
export class ProgressModule {}
