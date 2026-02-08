import { Module } from '@nestjs/common';
import { MailerModule } from '@nestjs-modules/mailer';
import { HandlebarsAdapter } from '@nestjs-modules/mailer/dist/adapters/handlebars.adapter';
import { EmailService } from './email.service';
import { NotificationService } from './notification.service';
import { NotificationController } from './notification.controller';
import { PrismaModule } from '../prisma/prisma.module';
import { CacheModule } from '../cache/cache.module';
import { LoggerModule } from '../logger/logger.module';

@Module({
  imports: [
    MailerModule.forRoot({
      transport: {
        host: process.env.SMTP_HOST || 'smtp.gmail.com',
        port: parseInt(process.env.SMTP_PORT || '587', 10),
        secure: process.env.SMTP_SECURE === 'true',
        auth: {
          user: process.env.SMTP_USER,
          pass: process.env.SMTP_PASSWORD,
        },
      },
      defaults: {
        from:
          process.env.SMTP_FROM ||
          '"Voice Data Collection" <noreply@voice-data-collection.com>',
      },
      template: {
        dir: process.cwd() + '/backend/src/notifications/templates',
        adapter: new HandlebarsAdapter(),
        options: {
          strict: true,
        },
      },
    }),
    PrismaModule,
    CacheModule,
    LoggerModule,
  ],
  providers: [EmailService, NotificationService],
  controllers: [NotificationController],
  exports: [EmailService, NotificationService],
})
export class NotificationsModule {}
