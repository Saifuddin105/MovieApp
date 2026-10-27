import { Test, TestingModule } from '@nestjs/testing';
import { ConflictException, NotFoundException } from '@nestjs/common';
import { WatchlistService } from './watchlist.service';
import { PrismaService } from '../prisma/prisma.service';

describe('WatchlistService', () => {
  let service: WatchlistService;
  let prisma: any;

  beforeEach(async () => {
    prisma = {
      watchlistItem: {
        findMany: jest.fn(),
        findUnique: jest.fn(),
        create: jest.fn(),
        delete: jest.fn(),
      },
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        WatchlistService,
        { provide: PrismaService, useValue: prisma },
      ],
    }).compile();

    service = module.get<WatchlistService>(WatchlistService);
  });

  describe('addToWatchlist', () => {
    it('should throw ConflictException if movie is already in user watchlist', async () => {
      prisma.watchlistItem.findUnique.mockResolvedValue({
        id: 'w1',
        userId: 'u1',
        tmdbId: 550,
      });

      await expect(
        service.addToWatchlist('u1', {
          tmdbId: 550,
          title: 'Fight Club',
        }),
      ).rejects.toThrow(ConflictException);
    });

    it('should successfully add movie if not already present', async () => {
      prisma.watchlistItem.findUnique.mockResolvedValue(null);
      prisma.watchlistItem.create.mockResolvedValue({
        id: 'w1',
        userId: 'u1',
        tmdbId: 550,
        title: 'Fight Club',
      });

      const result = await service.addToWatchlist('u1', {
        tmdbId: 550,
        title: 'Fight Club',
      });

      expect(result.id).toBe('w1');
      expect(prisma.watchlistItem.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            userId: 'u1',
            tmdbId: 550,
            title: 'Fight Club',
          }),
        }),
      );
    });
  });

  describe('removeFromWatchlist', () => {
    it('should throw NotFoundException if movie is not in watchlist', async () => {
      prisma.watchlistItem.findUnique.mockResolvedValue(null);

      await expect(service.removeFromWatchlist('u1', 550)).rejects.toThrow(
        NotFoundException,
      );
    });

    it('should successfully delete movie from watchlist', async () => {
      prisma.watchlistItem.findUnique.mockResolvedValue({ id: 'w1' });
      prisma.watchlistItem.delete.mockResolvedValue({ id: 'w1' });

      const result = await service.removeFromWatchlist('u1', 550);
      expect(result.success).toBe(true);
    });
  });
});

