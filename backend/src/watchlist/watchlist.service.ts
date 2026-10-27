import {
  Injectable,
  ConflictException,
  NotFoundException,
  Logger,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { AddWatchlistDto } from './dto/add-watchlist.dto';

@Injectable()
export class WatchlistService {
  private readonly logger = new Logger(WatchlistService.name);

  constructor(private readonly prisma: PrismaService) {}

  async getWatchlist(userId: string) {
    return this.prisma.watchlistItem.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
    });
  }

  async addToWatchlist(userId: string, dto: AddWatchlistDto) {
    const existing = await this.prisma.watchlistItem.findUnique({
      where: {
        userId_tmdbId: {
          userId,
          tmdbId: dto.tmdbId,
        },
      },
    });

    if (existing) {
      throw new ConflictException('Movie is already in your watchlist');
    }

    return this.prisma.watchlistItem.create({
      data: {
        userId,
        tmdbId: dto.tmdbId,
        title: dto.title,
        posterPath: dto.posterPath,
        backdropPath: dto.backdropPath,
        releaseDate: dto.releaseDate,
        voteAverage: dto.voteAverage,
      },
    });
  }

  async removeFromWatchlist(userId: string, tmdbId: number) {
    const item = await this.prisma.watchlistItem.findUnique({
      where: {
        userId_tmdbId: {
          userId,
          tmdbId,
        },
      },
    });

    if (!item) {
      throw new NotFoundException('Movie is not in your watchlist');
    }

    await this.prisma.watchlistItem.delete({
      where: {
        userId_tmdbId: {
          userId,
          tmdbId,
        },
      },
    });

    return { success: true, message: 'Movie removed from watchlist' };
  }

  async isMovieInWatchlist(userId: string, tmdbId: number) {
    const item = await this.prisma.watchlistItem.findUnique({
      where: {
        userId_tmdbId: {
          userId,
          tmdbId,
        },
      },
    });

    return { inWatchlist: !!item };
  }
}

