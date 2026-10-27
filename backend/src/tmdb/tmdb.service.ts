import {
  Injectable,
  Logger,
  HttpException,
  HttpStatus,
  BadGatewayException,
  NotFoundException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import axios, { AxiosInstance, AxiosError } from 'axios';
import {
  TmdbMovie,
  TmdbPaginatedResponse,
  TmdbCredits,
  TmdbVideosResponse,
  TmdbGenre,
} from './tmdb.types';

interface CacheEntry<T> {
  data: T;
  expiry: number;
}

@Injectable()
export class TmdbService {
  private readonly logger = new Logger(TmdbService.name);
  private readonly axiosInstance: AxiosInstance;
  private readonly cache = new Map<string, CacheEntry<any>>();
  private readonly defaultCacheTtl = 5 * 60 * 1000; // 5 minutes

  private readonly apiKey?: string;
  private readonly accessToken?: string;

  constructor(private readonly configService: ConfigService) {
    const sanitize = (val?: string) => {
      if (!val) return undefined;
      const cleaned = val.trim().replace(/^["']|["']$/g, '');
      if (!cleaned || cleaned === 'your_tmdb_api_key_v3_here' || cleaned.startsWith('your_tmdb_')) {
        return undefined;
      }
      return cleaned;
    };

    this.apiKey = sanitize(this.configService.get<string>('TMDB_API_KEY'));
    this.accessToken = sanitize(this.configService.get<string>('TMDB_ACCESS_TOKEN'));

    if (this.accessToken) {
      this.logger.log('TMDB API service initialized with Read Access Token (Bearer)');
    } else if (this.apiKey) {
      this.logger.log('TMDB API service initialized with API Key (v3)');
    } else {
      this.logger.warn(
        'Neither TMDB_API_KEY nor TMDB_ACCESS_TOKEN is configured. Real TMDB requests will fail until an API key is set in .env.',
      );
    }

    this.axiosInstance = axios.create({
      baseURL: 'https://api.themoviedb.org/3',
      timeout: 8000,
    });
  }

  private getRequestConfig(customParams: Record<string, any> = {}) {
    if (!this.apiKey && !this.accessToken) {
      throw new HttpException(
        'TMDB API key or Bearer token is not configured on the server. Please add TMDB_API_KEY or TMDB_ACCESS_TOKEN to backend/.env',
        HttpStatus.SERVICE_UNAVAILABLE,
      );
    }

    const headers: Record<string, string> = {
      Accept: 'application/json',
    };

    const params: Record<string, any> = { ...customParams };

    if (this.accessToken) {
      headers['Authorization'] = `Bearer ${this.accessToken}`;
    } else if (this.apiKey) {
      params['api_key'] = this.apiKey;
    }

    return { headers, params };
  }

  private async fetchWithCache<T>(
    cacheKey: string,
    url: string,
    params: Record<string, any> = {},
    ttlMs: number = this.defaultCacheTtl,
  ): Promise<T> {
    const serializedKey = `${cacheKey}:${JSON.stringify(params)}`;
    const cached = this.cache.get(serializedKey);
    const now = Date.now();

    if (cached && cached.expiry > now) {
      return cached.data;
    }

    try {
      const config = this.getRequestConfig(params);
      const response = await this.axiosInstance.get<T>(url, config);

      this.cache.set(serializedKey, {
        data: response.data,
        expiry: now + ttlMs,
      });

      // Cleanup cache if it grows too large
      if (this.cache.size > 1000) {
        for (const [key, value] of this.cache.entries()) {
          if (value.expiry <= now) {
            this.cache.delete(key);
          }
        }
      }

      return response.data;
    } catch (error) {
      this.handleAxiosError(error, `TMDB request to ${url} failed`);
    }
  }

  private handleAxiosError(error: any, contextMsg: string): never {
    if (axios.isAxiosError(error)) {
      const axiosErr = error as AxiosError<any>;
      const status = axiosErr.response?.status;
      const responseData = axiosErr.response?.data;

      this.logger.error(
        `${contextMsg}: Status ${status} - ${JSON.stringify(responseData || axiosErr.message)}`,
      );

      if (status === 404) {
        throw new NotFoundException('Movie or resource not found on TMDB');
      }

      if (status === 401 || status === 403) {
        throw new HttpException(
          'Invalid or unauthorized TMDB credentials. Check your TMDB_API_KEY / TMDB_ACCESS_TOKEN.',
          HttpStatus.BAD_GATEWAY,
        );
      }

      if (status === 429) {
        throw new HttpException(
          'TMDB rate limit reached. Please try again shortly.',
          HttpStatus.TOO_MANY_REQUESTS,
        );
      }

      throw new BadGatewayException(
        responseData?.status_message ||
          'Failed to retrieve data from TMDB upstream service',
      );
    }

    this.logger.error(`${contextMsg}: ${error?.message || error}`);
    throw new BadGatewayException('Unexpected error communicating with TMDB API');
  }

  async getGenres(): Promise<{ genres: TmdbGenre[] }> {
    return this.fetchWithCache<{ genres: TmdbGenre[] }>(
      'genres',
      '/genre/movie/list',
      { language: 'en-US' },
      24 * 60 * 60 * 1000, // 24 hours
    );
  }

  async getPopular(page = 1): Promise<TmdbPaginatedResponse<TmdbMovie>> {
    return this.fetchWithCache<TmdbPaginatedResponse<TmdbMovie>>(
      'popular',
      '/movie/popular',
      { page, language: 'en-US' },
    );
  }

  async getTrending(timeWindow: 'day' | 'week' = 'day', page = 1): Promise<TmdbPaginatedResponse<TmdbMovie>> {
    return this.fetchWithCache<TmdbPaginatedResponse<TmdbMovie>>(
      `trending-${timeWindow}`,
      `/trending/movie/${timeWindow}`,
      { page, language: 'en-US' },
    );
  }

  async getTopRated(page = 1): Promise<TmdbPaginatedResponse<TmdbMovie>> {
    return this.fetchWithCache<TmdbPaginatedResponse<TmdbMovie>>(
      'top_rated',
      '/movie/top_rated',
      { page, language: 'en-US' },
    );
  }

  async getUpcoming(page = 1): Promise<TmdbPaginatedResponse<TmdbMovie>> {
    return this.fetchWithCache<TmdbPaginatedResponse<TmdbMovie>>(
      'upcoming',
      '/movie/upcoming',
      { page, language: 'en-US' },
    );
  }

  async searchMovies(query: string, page = 1): Promise<TmdbPaginatedResponse<TmdbMovie>> {
    return this.fetchWithCache<TmdbPaginatedResponse<TmdbMovie>>(
      'search',
      '/search/movie',
      { query, page, include_adult: false, language: 'en-US' },
      2 * 60 * 1000, // 2 mins
    );
  }

  async getMovieDetails(id: number): Promise<TmdbMovie> {
    return this.fetchWithCache<TmdbMovie>(
      `movie-${id}`,
      `/movie/${id}`,
      { language: 'en-US' },
      10 * 60 * 1000,
    );
  }

  async getMovieCredits(id: number): Promise<TmdbCredits> {
    return this.fetchWithCache<TmdbCredits>(
      `credits-${id}`,
      `/movie/${id}/credits`,
      { language: 'en-US' },
      10 * 60 * 1000,
    );
  }

  async getMovieVideos(id: number): Promise<TmdbVideosResponse> {
    return this.fetchWithCache<TmdbVideosResponse>(
      `videos-${id}`,
      `/movie/${id}/videos`,
      { language: 'en-US' },
      10 * 60 * 1000,
    );
  }

  async getSimilarMovies(id: number, page = 1): Promise<TmdbPaginatedResponse<TmdbMovie>> {
    return this.fetchWithCache<TmdbPaginatedResponse<TmdbMovie>>(
      `similar-${id}`,
      `/movie/${id}/similar`,
      { page, language: 'en-US' },
    );
  }

  async getRecommendedMovies(id: number, page = 1): Promise<TmdbPaginatedResponse<TmdbMovie>> {
    return this.fetchWithCache<TmdbPaginatedResponse<TmdbMovie>>(
      `recommendations-${id}`,
      `/movie/${id}/recommendations`,
      { page, language: 'en-US' },
    );
  }

  async discoverMovies(filters: {
    page?: number;
    with_genres?: string;
    without_genres?: string;
    'primary_release_date.gte'?: string;
    'primary_release_date.lte'?: string;
    'with_runtime.gte'?: number;
    'with_runtime.lte'?: number;
    'vote_average.gte'?: number;
    'vote_count.gte'?: number;
    sort_by?: string;
  }): Promise<TmdbPaginatedResponse<TmdbMovie>> {
    const params: Record<string, any> = {
      include_adult: false,
      include_video: false,
      language: 'en-US',
      sort_by: filters.sort_by || 'popularity.desc',
      page: filters.page || 1,
      ...filters,
    };

    return this.fetchWithCache<TmdbPaginatedResponse<TmdbMovie>>(
      'discover',
      '/discover/movie',
      params,
      3 * 60 * 1000,
    );
  }
}

