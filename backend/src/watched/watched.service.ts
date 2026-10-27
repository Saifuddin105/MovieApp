import {
  Injectable,
  ConflictException,
  NotFoundException,
  Logger,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { MarkWatchedDto } from './dto/mark-watched.dto';

@Injectable()
export class WatchedService {
  private readonly logger = new Logger(WatchedService.name);

  constructor(private readonly prisma: PrismaService) {}

  async getWatched(userId: string) {
    return this.prisma.watchedMovie.findMany({
      where: { userId },
      orderBy: { watchedAt: 'desc' },
    });
  }

  async markAsWatched(userId: string, dto: MarkWatchedDto) {
    const existing = await this.prisma.watchedMovie.findUnique({
      where: {
        userId_tmdbId: {
          userId,
          tmdbId: dto.tmdbId,
        },
      },
    });

    if (existing) {
      throw new ConflictException('Movie is already marked as watched');
    }

    // Execute atomic transaction: add to WatchedMovie and remove from WatchlistItem
    return this.prisma.$transaction(async (tx) => {
      const watched = await tx.watchedMovie.create({
        data: {
          userId,
          tmdbId: dto.tmdbId,
          title: dto.title,
          posterPath: dto.posterPath,
          backdropPath: dto.backdropPath,
          releaseDate: dto.releaseDate,
          voteAverage: dto.voteAverage,
          userRating: dto.userRating,
          watchedAt: dto.watchedAt ? new Date(dto.watchedAt) : new Date(),
        },
      });

      // Remove from watchlist if present (state transition)
      await tx.watchlistItem.deleteMany({
        where: {
          userId,
          tmdbId: dto.tmdbId,
        },
      });

      return watched;
    });
  }

  async removeFromWatched(userId: string, tmdbId: number) {
    const item = await this.prisma.watchedMovie.findUnique({
      where: {
        userId_tmdbId: {
          userId,
          tmdbId,
        },
      },
    });

    if (!item) {
      throw new NotFoundException('Movie is not in your watched list');
    }

    await this.prisma.watchedMovie.delete({
      where: {
        userId_tmdbId: {
          userId,
          tmdbId,
        },
      },
    });

    return { success: true, message: 'Movie removed from watched list' };
  }

  async isMovieWatched(userId: string, tmdbId: number) {
    const item = await this.prisma.watchedMovie.findUnique({
      where: {
        userId_tmdbId: {
          userId,
          tmdbId,
        },
      },
    });

    return {
      isWatched: !!item,
      watchedAt: item?.watchedAt,
      userRating: item?.userRating,
    };
  }

  async moveToWatchlist(userId: string, tmdbId: number) {
    const item = await this.prisma.watchedMovie.findUnique({
      where: {
        userId_tmdbId: {
          userId,
          tmdbId,
        },
      },
    });

    if (!item) {
      throw new NotFoundException('Movie is not in your watched list');
    }

    return this.prisma.$transaction(async (tx) => {
      // Remove from watched
      await tx.watchedMovie.delete({
        where: {
          userId_tmdbId: {
            userId,
            tmdbId,
          },
        },
      });

      // Add to watchlist
      const watchlistItem = await tx.watchlistItem.upsert({
        where: {
          userId_tmdbId: {
            userId,
            tmdbId,
          },
        },
        create: {
          userId,
          tmdbId: item.tmdbId,
          title: item.title,
          posterPath: item.posterPath,
          backdropPath: item.backdropPath,
          releaseDate: item.releaseDate,
          voteAverage: item.voteAverage,
        },
        update: {},
      });

      return watchlistItem;
    });
  }
}

