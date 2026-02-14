import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { PrismaModule } from '../prisma/prisma.module';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { ApiKeyController } from './api-key.controller';
import { JwtStrategy } from './jwt.strategy';
import { GoogleStrategy } from './google.strategy';
import { GitHubStrategy } from './github.strategy';
import { ApiKeyStrategy } from './api-key.strategy';
import { ApiKeyService } from './api-key.service';
import { RecoveryService } from './recovery.service';
import { VerificationService } from '../verification.service';
import { NotificationsModule } from '../notifications/notifications.module';
import { CacheModule } from '../cache/cache.module';

@Module({
  imports: [
    PrismaModule,
    CacheModule,
    PassportModule,
    JwtModule.register({
      secret: process.env.JWT_SECRET || 'your-jwt-secret-key',
      signOptions: { expiresIn: '24h' },
    }),
    NotificationsModule,
  ],
  controllers: [AuthController, ApiKeyController],
  providers: [
    AuthService,
    ApiKeyService,
    JwtStrategy,
    GoogleStrategy,
    GitHubStrategy,
    ApiKeyStrategy,
    RecoveryService,
    VerificationService,
  ],
  exports: [AuthService, ApiKeyService, RecoveryService],
})
export class AuthModule {}
