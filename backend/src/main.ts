import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { AllExceptionsFilter } from './common/filters/http-exception.filter';
import { ExceptionFilter } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import helmet from 'helmet';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.use(helmet());
  app.enableCors({
    origin: process.env.CORS_ORIGIN?.split(',').map((o) => o.trim()) ?? [
      'http://localhost:5577',
    ],
    credentials: true,
  });
  app.useGlobalFilters(new AllExceptionsFilter() as ExceptionFilter); // Typed cast
  app.setGlobalPrefix('api');

  const config = new DocumentBuilder()
    .setTitle('ILHRF Data Collection API')
    .setDescription('API for linguistic voice data collection, speech recordings, and crowdsourcing')
    .setVersion('1.0')
    .addBearerAuth()
    .addTag('auth', 'Authentication and authorization')
    .addTag('users', 'User profile and verification')
    .addTag('speech', 'Speech recording and validation')
    .addTag('question', 'Question submissions and answers')
    .addTag('write', 'Sentence submissions')
    .addTag('search', 'Search and discovery')
    .addTag('community', 'Community features: blogs, forum, FAQ, feedback')
    .addTag('admin', 'Admin operations')
    .addTag('export', 'Data export')
    .addTag('analytics', 'Analytics and statistics')
    .addTag('quality', 'Quality assurance')
    .addTag('queue', 'Job queue monitoring')
    .addTag('cache', 'Cache warming and statistics')
    .addTag('metrics', 'Prometheus metrics')
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('docs', app, document);

  const port = process.env.PORT || 5566;
  await app.listen(port);
  console.log(`Application is running on: ${await app.getUrl()}`);
  console.log(`Swagger docs: ${await app.getUrl()}/api/docs`);
}
void bootstrap();
