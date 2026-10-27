import { apiClient } from './client';
import {
  Movie,
  PaginatedMovies,
  MovieCredits,
  MovieVideo,
  Genre,
  FindTonightRequest,
  FindTonightResponse,
  SurpriseMovieResponse,
} from '../types/movie';

export const moviesApi = {
  getPopular: async (page = 1): Promise<PaginatedMovies> => {
    const res = await apiClient.get<PaginatedMovies>('/movies/popular', { params: { page } });
    return res.data;
  },

  getTrending: async (timeWindow: 'day' | 'week' = 'day', page = 1): Promise<PaginatedMovies> => {
    const res = await apiClient.get<PaginatedMovies>('/movies/trending', {
      params: { timeWindow, page },
    });
    return res.data;
  },

  getTopRated: async (page = 1): Promise<PaginatedMovies> => {
    const res = await apiClient.get<PaginatedMovies>('/movies/top-rated', { params: { page } });
    return res.data;
  },

  getUpcoming: async (page = 1): Promise<PaginatedMovies> => {
    const res = await apiClient.get<PaginatedMovies>('/movies/upcoming', { params: { page } });
    return res.data;
  },

  getGenres: async (): Promise<{ genres: Genre[] }> => {
    const res = await apiClient.get<{ genres: Genre[] }>('/movies/genres');
    return res.data;
  },

  search: async (query: string, page = 1): Promise<PaginatedMovies> => {
    const res = await apiClient.get<PaginatedMovies>('/movies/search', {
      params: { query, page },
    });
    return res.data;
  },

  discover: async (params: {
    page?: number;
    with_genres?: string;
    primary_release_year?: number;
    sort_by?: string;
  }): Promise<PaginatedMovies> => {
    const res = await apiClient.get<PaginatedMovies>('/movies/discover', { params });
    return res.data;
  },

  findForTonight: async (data: FindTonightRequest): Promise<FindTonightResponse> => {
    const res = await apiClient.post<FindTonightResponse>('/movies/find-for-tonight', data);
    return res.data;
  },

  surpriseMe: async (data?: { excludedIds?: number[]; mood?: string; genreId?: number }): Promise<SurpriseMovieResponse> => {
    const res = await apiClient.post<SurpriseMovieResponse>('/movies/surprise', data || {});
    return res.data;
  },

  getDetails: async (id: number): Promise<Movie> => {
    const res = await apiClient.get<Movie>(`/movies/${id}`);
    return res.data;
  },

  getCredits: async (id: number): Promise<MovieCredits> => {
    const res = await apiClient.get<MovieCredits>(`/movies/${id}/credits`);
    return res.data;
  },

  getVideos: async (id: number): Promise<{ id: number; results: MovieVideo[] }> => {
    const res = await apiClient.get<{ id: number; results: MovieVideo[] }>(`/movies/${id}/videos`);
    return res.data;
  },

  getSimilar: async (id: number, page = 1): Promise<PaginatedMovies> => {
    const res = await apiClient.get<PaginatedMovies>(`/movies/${id}/similar`, {
      params: { page },
    });
    return res.data;
  },

  getRecommendations: async (id: number, page = 1): Promise<PaginatedMovies> => {
    const res = await apiClient.get<PaginatedMovies>(`/movies/${id}/recommendations`, {
      params: { page },
    });
    return res.data;
  },
};

