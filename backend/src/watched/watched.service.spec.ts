import { Test, TestingModule } from '@nestjs/testing';
import { ConflictException, NotFoundException } from '@nestjs/common';
import { WatchedService } from './watched.service';
import { PrismaService } from '../prisma/prisma.service';

describe('WatchedService', () => {
  let service: WatchedService;
  let prisma: any;

  beforeEach(async () => {
    prisma = {
      watchedMovie: {
        findMany: jest.fn(),
        findUnique: jest.fn(),
        create: jest.fn(),
        delete: jest.fn(),
      },
      watchlistItem: {
        deleteMany: jest.fn(),
        upsert: jest.fn(),
      },
      $transaction: jest.fn().mockImplementation(async (callback) => {
        return callback(prisma);
      }),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        WatchedService,
        { provide: PrismaService, useValue: prisma },
      ],
    }).compile();

    service = module.get<WatchedService>(WatchedService);
  });

  describe('markAsWatched', () => {
    it('should throw ConflictException if already marked as watched', async () => {
      prisma.watchedMovie.findUnique.mockResolvedValue({
        id: 'wm1',
        userId: 'u1',
        tmdbId: 550,
      });

      await expect(
        service.markAsWatched('u1', {
          tmdbId: 550,
          title: 'Fight Club',
        }),
      ).rejects.toThrow(ConflictException);
    });

    it('should create watched movie and remove it from watchlist in atomic transaction', async () => {
      prisma.watchedMovie.findUnique.mockResolvedValue(null);
      prisma.watchedMovie.create.mockResolvedValue({
        id: 'wm1',
        userId: 'u1',
        tmdbId: 550,
        title: 'Fight Club',
      });
      prisma.watchlistItem.deleteMany.mockResolvedValue({ count: 1 });

      const result = await service.markAsWatched('u1', {
        tmdbId: 550,
        title: 'Fight Club',
      });

      expect(prisma.watchedMovie.create).toHaveBeenCalled();
      expect(prisma.watchlistItem.deleteMany).toHaveBeenCalledWith({
        where: {
          userId: 'u1',
          tmdbId: 550,
        },
      });
      expect(result.id).toBe('wm1');
    });
  });

  describe('removeFromWatched', () => {
    it('should throw NotFoundException if movie is not in watched list', async () => {
      prisma.watchedMovie.findUnique.mockResolvedValue(null);

      await expect(service.removeFromWatched('u1', 550)).rejects.toThrow(
        NotFoundException,
      );
    });

    it('should remove movie from watched list', async () => {
      prisma.watchedMovie.findUnique.mockResolvedValue({ id: 'wm1' });
      prisma.watchedMovie.delete.mockResolvedValue({ id: 'wm1' });

      const result = await service.removeFromWatched('u1', 550);
      expect(result.success).toBe(true);
    });
  });
});

