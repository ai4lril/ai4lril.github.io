import { Module } from '@nestjs/common';
import { BlogService } from './blog.service';
import { BlogController } from './blog.controller';
import { AudioBlogService } from './audio-blog.service';
import { AudioBlogController } from './audio-blog.controller';
import { VideoBlogService } from './video-blog.service';
import { VideoBlogController } from './video-blog.controller';
import { ForumService } from './forum.service';
import { ForumController } from './forum.controller';
import { FAQService } from './faq.service';
import { FAQController } from './faq.controller';
import { FeedbackService } from './feedback.service';
import { FeedbackController } from './feedback.controller';
import { PrismaModule } from './prisma/prisma.module';
import { StorageModule } from './storage/storage.module';
import { CacheModule } from './cache/cache.module';
import { LoggerModule } from './logger/logger.module';
import { NotificationsModule } from './notifications/notifications.module';
import { JwtModule } from '@nestjs/jwt';

@Module({
  imports: [
    PrismaModule,
    StorageModule,
    CacheModule,
    LoggerModule,
    NotificationsModule,
    JwtModule.register({
      secret: process.env.JWT_SECRET,
      signOptions: { expiresIn: '7d' },
    }),
  ],
  providers: [
    BlogService,
    AudioBlogService,
    VideoBlogService,
    ForumService,
    FAQService,
    FeedbackService,
  ],
  controllers: [
    BlogController,
    AudioBlogController,
    VideoBlogController,
    ForumController,
    FAQController,
    FeedbackController,
  ],
  exports: [
    BlogService,
    AudioBlogService,
    VideoBlogService,
    ForumService,
    FAQService,
    FeedbackService,
  ],
})
export class CommunityModule {}
