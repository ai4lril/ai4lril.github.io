import { Module, forwardRef } from '@nestjs/common';
import { SearchService } from './search.service';
import { SearchController } from './search.controller';
import { PrismaModule } from '../prisma/prisma.module';
import { CacheModule } from '../cache/cache.module';
import { LoggerModule } from '../logger/logger.module';

@Module({
  imports: [PrismaModule, forwardRef(() => CacheModule), LoggerModule],
  providers: [SearchService],
  controllers: [SearchController],
  exports: [SearchService],
})
export class SearchModule { }
