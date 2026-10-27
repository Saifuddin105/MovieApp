import { Controller, Get, HttpStatus, Res } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { Response } from 'express';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../prisma/prisma.service';

@ApiTags('health')
@Controller('health')
export class HealthController {
  constructor(
    private readonly prisma: PrismaService,
    private readonly configService: ConfigService,
  ) {}

  @Get()
  @ApiOperation({ summary: 'Health check verifying database connection and service configuration' })
  async check(@Res() res: Response) {
    let dbStatus = 'ok';
    let dbLatencyMs: number | null = null;

    try {
      const start = Date.now();
      await this.prisma.$queryRaw`SELECT 1`;
      dbLatencyMs = Date.now() - start;
    } catch (error) {
      dbStatus = 'error';
    }

    const hasTmdb = !!(
      this.configService.get<string>('TMDB_API_KEY') ||
      this.configService.get<string>('TMDB_ACCESS_TOKEN')
    );

    const isHealthy = dbStatus === 'ok';

    return res.status(HttpStatus.OK).json({
      status: isHealthy ? 'healthy' : 'degraded',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      database: {
        status: dbStatus,
        latencyMs: dbLatencyMs,
      },
      tmdbConfigured: hasTmdb,
      authMethod: this.configService.get<string>('TMDB_ACCESS_TOKEN') ? 'Bearer Token' : (this.configService.get<string>('TMDB_API_KEY') ? 'API Key' : 'none'),
      environment: process.env.NODE_ENV || 'development',
    });
  }
}

