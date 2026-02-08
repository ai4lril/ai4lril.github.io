import { Module } from '@nestjs/common';
import { DatasetService } from './dataset.service';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  providers: [DatasetService],
  exports: [DatasetService],
})
export class DatasetModule {}
