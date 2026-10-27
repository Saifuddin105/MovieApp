import { NestFactory } from '@nestjs/core';
import { ValidationPipe, Logger } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import helmet from 'helmet';
import * as cookieParser from 'cookie-parser';
import { AppModule } from './app.module';

async function bootstrap() {
  const logger = new Logger('Bootstrap');
  const app = await NestFactory.create(AppModule);

  // Security headers with helmet
  app.use(
    helmet({
      crossOriginResourcePolicy: { policy: 'cross-origin' },
      contentSecurityPolicy: process.env.NODE_ENV === 'production' ? undefined : false,
    }),
  );

  // Cookie parser for JWT tokens in HttpOnly cookies
  app.use(cookieParser());

  // CORS configuration
  const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
  const allowedOrigins = [
    frontendUrl,
    'http://localhost:5173',
    'http://localhost:3000',
    'http://127.0.0.1:5173',
  ];

  app.enableCors({
    origin: (origin, callback) => {
      // Allow requests with no origin (like mobile apps, curl, server-to-server)
      if (!origin || allowedOrigins.includes(origin) || origin.endsWith('.vercel.app')) {
        callback(null, true);
      } else {
        callback(null, true); // Permissive in dev, or origin check
      }
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept'],
  });

  // Global API Prefix
  app.setGlobalPrefix('api');

  // Global DTO Validation Pipe
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      forbidNonWhitelisted: true,
      transformOptions: {
        enableImplicitConversion: true,
      },
    }),
  );

  // Swagger OpenAPI Documentation
  const config = new DocumentBuilder()
    .setTitle('What Should I Watch Tonight? — API')
    .setDescription(
      'Full-Stack Movie Discovery REST API powered by NestJS, Prisma, and TMDB. Provides authentication, movie discovery by mood, time & era, watchlist, and watched history.',
    )
    .setVersion('1.0')
    .addBearerAuth()
    .addTag('movies', 'TMDB movie proxy, discovery, surprise-me, and search')
    .addTag('auth', 'JWT registration, login, refresh token, and session')
    .addTag('users', 'User profile and movie statistics')
    .addTag('watchlist', 'Personal watchlist collection')
    .addTag('watched', 'Watched history and ratings')
    .addTag('health', 'System health and Neon database status')
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, document, {
    customSiteTitle: 'What Should I Watch Tonight? — API Docs',
  });

  const port = process.env.PORT || 3000;
  await app.listen(port, '0.0.0.0');

  logger.log(`Server listening on port ${port}`);
  logger.log(`API Base URL: http://localhost:${port}/api`);
  logger.log(`Swagger Docs available at: http://localhost:${port}/api/docs`);
}

bootstrap();

