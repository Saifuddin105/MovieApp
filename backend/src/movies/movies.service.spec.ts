import { Test, TestingModule } from '@nestjs/testing';
import { MoviesService } from './movies.service';
import { TmdbService } from '../tmdb/tmdb.service';
import { MoodOption, RuntimeOption, EraOption } from './dto/find-tonight.dto';

describe('MoviesService', () => {
  let service: MoviesService;
  let tmdbService: jest.Mocked<Partial<TmdbService>>;

  const mockDiscoverResponse = {
    page: 1,
    results: [
      {
        id: 550,
        title: 'Fight Club',
        overview: 'An insomniac office worker...',
        poster_path: '/pB8BM7pdSp6B6Ih7QZ4DrQ3PmJK.jpg',
        backdrop_path: '/hZkgoQYus5vegHoetLkCJzb17zJ.jpg',
        release_date: '1999-10-15',
        vote_average: 8.4,
        vote_count: 26000,
        popularity: 65.4,
      },
    ],
    total_pages: 1,
    total_results: 1,
  };

  beforeEach(async () => {
    tmdbService = {
      discoverMovies: jest.fn().mockResolvedValue(mockDiscoverResponse),
      getPopular: jest.fn().mockResolvedValue(mockDiscoverResponse),
      getMovieDetails: jest.fn().mockResolvedValue({
        id: 550,
        title: 'Fight Club',
        runtime: 139,
      } as any),
      getMovieVideos: jest.fn().mockResolvedValue({
        id: 550,
        results: [{ id: '1', key: 'trailerKey123', site: 'YouTube', type: 'Trailer', official: true }],
      }),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        MoviesService,
        { provide: TmdbService, useValue: tmdbService },
      ],
    }).compile();

    service = module.get<MoviesService>(MoviesService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('findForTonight', () => {
    it('should map Scary mood to Horror and Thriller genre IDs', async () => {
      const result = await service.findForTonight({
        moods: [MoodOption.SCARY],
        runtime: RuntimeOption.UNDER_90,
        era: EraOption.CLASSIC,
        page: 1,
      });

      expect(tmdbService.discoverMovies).toHaveBeenCalledWith(
        expect.objectContaining({
          with_genres: expect.stringMatching(/27|53|9648/),
          'with_runtime.lte': 90,
          'primary_release_date.lte': '1999-12-31',
        }),
      );
      expect(result.appliedFilters.moods).toContain(MoodOption.SCARY);
    });

    it('should map 90-120 minutes runtime to lower and upper bounds', async () => {
      await service.findForTonight({
        moods: [MoodOption.FUNNY],
        runtime: RuntimeOption.BETWEEN_90_120,
      });

      expect(tmdbService.discoverMovies).toHaveBeenCalledWith(
        expect.objectContaining({
          'with_runtime.gte': 90,
          'with_runtime.lte': 120,
        }),
      );
    });

    it('should map Recent era to 2020 and onward release date', async () => {
      await service.findForTonight({
        moods: [MoodOption.EXCITING],
        era: EraOption.RECENT,
      });

      expect(tmdbService.discoverMovies).toHaveBeenCalledWith(
        expect.objectContaining({
          'primary_release_date.gte': '2020-01-01',
        }),
      );
    });

    it('should support direct TMDB genre IDs filtering', async () => {
      await service.findForTonight({
        genreIds: [28, 12],
      });

      expect(tmdbService.discoverMovies).toHaveBeenCalledWith(
        expect.objectContaining({
          with_genres: expect.stringMatching(/28|12/),
        }),
      );
    });
  });

  describe('surpriseMe', () => {
    it('should exclude specified movie IDs and return trailer key', async () => {
      const result = await service.surpriseMe({
        excludedIds: [999],
      });

      expect(result.movie.id).toBe(550);
      expect(result.trailerKey).toBe('trailerKey123');
    });
  });
});

