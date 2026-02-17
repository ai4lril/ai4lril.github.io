import { Module, forwardRef } from '@nestjs/common';
import { QuestionController } from './question.controller';
import { QuestionService } from './question.service';
import { PrismaModule } from '../prisma/prisma.module';
import { ProgressModule } from '../progress/progress.module';
import { StorageModule } from '../storage/storage.module';
import { QueueModule } from '../queue/queue.module';
import { TaskAssignmentModule } from '../task-assignment/task-assignment.module';

@Module({
  imports: [
    PrismaModule,
    ProgressModule,
    StorageModule,
    forwardRef(() => QueueModule),
    TaskAssignmentModule,
  ],
  controllers: [QuestionController],
  providers: [QuestionService],
  exports: [QuestionService],
})
export class QuestionModule { }
