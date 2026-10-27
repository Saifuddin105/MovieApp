import { Injectable, Logger } from '@nestjs/common';
import { TmdbService } from '../tmdb/tmdb.service';
import {
  FindTonightDto,
  MoodOption,
  RuntimeOption,
  EraOption,
  SurpriseMovieDto,
} from './dto/find-tonight.dto';
import { DiscoverMoviesDto } from './dto/discover-movies.dto';
import { TmdbMovie } from '../tmdb/tmdb.types';

@Injectable()
export class MoviesService {
  private readonly logger = new Logger(MoviesService.name);

  // Explicit, documented mapping of human moods to TMDB Genre IDs
  public static readonly MOOD_GENRE_MAP: Record<MoodOption, number[]> = {
    [MoodOption.SCARY]: [27, 53, 9648], // Horror, Thriller, Mystery
    [MoodOption.FUNNY]: [35, 16], // Comedy, Animation
    [MoodOption.SMART]: [9648, 878, 99, 18], // Mystery, Science Fiction, Documentary, Drama
    [MoodOption.EMOTIONAL]: [18, 10749], // Drama, Romance
    [MoodOption.ROMANTIC]: [10749, 35], // Romance, Comedy
    [MoodOption.EXCITING]: [28, 12, 878], // Action, Adventure, Science Fiction
  };

  constructor(private readonly tmdbService: TmdbService) {}

  async getPopular(page = 1) {
    return this.tmdbService.getPopular(page);
  }

  async getTrending(timeWindow: 'day' | 'week' = 'day', page = 1) {
    return this.tmdbService.getTrending(timeWindow, page);
  }

  async getTopRated(page = 1) {
    return this.tmdbService.getTopRated(page);
  }

  async getUpcoming(page = 1) {
    return this.tmdbService.getUpcoming(page);
  }

  async getGenres() {
    return this.tmdbService.getGenres();
  }

  async searchMovies(query: string, page = 1) {
    return this.tmdbService.searchMovies(query, page);
  }

  async getMovieDetails(id: number) {
    return this.tmdbService.getMovieDetails(id);
  }

  async getMovieCredits(id: number) {
    return this.tmdbService.getMovieCredits(id);
  }

  async getMovieVideos(id: number) {
    return this.tmdbService.getMovieVideos(id);
  }

  async getSimilarMovies(id: number, page = 1) {
    return this.tmdbService.getSimilarMovies(id, page);
  }

  async getRecommendedMovies(id: number, page = 1) {
    return this.tmdbService.getRecommendedMovies(id, page);
  }

  async discoverMovies(dto: DiscoverMoviesDto) {
    const filters: Record<string, any> = {
      page: dto.page || 1,
      sort_by: dto.sort_by || 'popularity.desc',
      'vote_count.gte': 50,
    };

    if (dto.with_genres) {
      filters.with_genres = dto.with_genres;
    }

    if (dto.primary_release_year) {
      filters.primary_release_year = dto.primary_release_year;
    }

    return this.tmdbService.discoverMovies(filters);
  }

  async findForTonight(dto: FindTonightDto) {
    // 1. Resolve genre IDs from selected moods and/or direct TMDB genre IDs
    const genreIdSet = new Set<number>();
    if (dto.moods && Array.isArray(dto.moods)) {
      for (const mood of dto.moods) {
        const genres = MoviesService.MOOD_GENRE_MAP[mood] || [];
        genres.forEach((g) => genreIdSet.add(g));
      }
    }

    if (dto.genreIds && Array.isArray(dto.genreIds)) {
      dto.genreIds.forEach((id) => genreIdSet.add(Number(id)));
    }

    const filters: Record<string, any> = {
      page: dto.page || 1,
      sort_by: 'popularity.desc',
      'vote_count.gte': 40,
    };

    if (genreIdSet.size > 0) {
      // Pipe '|' represents OR in TMDB API discover
      filters.with_genres = Array.from(genreIdSet).join('|');
    }

    // 2. Resolve duration filters
    if (dto.runtime) {
      switch (dto.runtime) {
        case RuntimeOption.UNDER_90:
          filters['with_runtime.lte'] = 90;
          break;
        case RuntimeOption.BETWEEN_90_120:
          filters['with_runtime.gte'] = 90;
          filters['with_runtime.lte'] = 120;
          break;
        case RuntimeOption.OVER_120:
          filters['with_runtime.gte'] = 120;
          break;
      }
    }

    // 3. Resolve era filters
    if (dto.era) {
      switch (dto.era) {
        case EraOption.CLASSIC:
          filters['primary_release_date.lte'] = '1999-12-31';
          break;
        case EraOption.ERA_2000_2010:
          filters['primary_release_date.gte'] = '2000-01-01';
          filters['primary_release_date.lte'] = '2009-12-31';
          break;
        case EraOption.ERA_2010_2020:
          filters['primary_release_date.gte'] = '2010-01-01';
          filters['primary_release_date.lte'] = '2019-12-31';
          break;
        case EraOption.RECENT:
          filters['primary_release_date.gte'] = '2020-01-01';
          break;
      }
    }

    const response = await this.tmdbService.discoverMovies(filters);

    return {
      appliedFilters: {
        moods: dto.moods,
        runtime: dto.runtime,
        era: dto.era,
        genreIds: Array.from(genreIdSet),
      },
      ...response,
    };
  }

  async surpriseMe(dto: SurpriseMovieDto) {
    const excluded = new Set<number>(dto.excludedIds || []);

    const filters: Record<string, any> = {
      'vote_average.gte': 6.8,
      'vote_count.gte': 200,
      sort_by: 'popularity.desc',
    };

    if (dto.genreId) {
      filters.with_genres = String(dto.genreId);
    } else if (dto.mood && MoviesService.MOOD_GENRE_MAP[dto.mood]) {
      filters.with_genres = MoviesService.MOOD_GENRE_MAP[dto.mood].join('|');
    }

    // Pick a random page between 1 and 6 to get fresh candidates
    const randomPage = Math.floor(Math.random() * 6) + 1;
    filters.page = randomPage;

    let discoverRes = await this.tmdbService.discoverMovies(filters);

    let candidates = discoverRes.results.filter(
      (movie) => !excluded.has(movie.id) && movie.poster_path,
    );

    // If all movies were excluded on this page, fallback to page 1
    if (candidates.length === 0 && randomPage !== 1) {
      filters.page = 1;
      discoverRes = await this.tmdbService.discoverMovies(filters);
      candidates = discoverRes.results.filter((movie) => movie.poster_path);
    }

    if (candidates.length === 0) {
      // Final fallback if strict filters had zero results
      discoverRes = await this.tmdbService.getPopular(1);
      candidates = discoverRes.results;
    }

    // Pick a random candidate
    const randomIndex = Math.floor(Math.random() * candidates.length);
    const selected = candidates[randomIndex];

    // Fetch full details and videos for instant playback
    let fullDetails: TmdbMovie = selected;
    let trailerKey: string | null = null;

    try {
      fullDetails = await this.tmdbService.getMovieDetails(selected.id);
      const videos = await this.tmdbService.getMovieVideos(selected.id);
      const youtubeTrailer = videos.results.find(
        (v) =>
          v.site === 'YouTube' &&
          (v.type === 'Trailer' || v.type === 'Teaser'),
      );
      if (youtubeTrailer) {
        trailerKey = youtubeTrailer.key;
      }
    } catch (e) {
      this.logger.warn(`Could not fetch extra details for surprise movie ${selected.id}`);
    }

    return {
      movie: fullDetails,
      trailerKey,
    };
  }
}

