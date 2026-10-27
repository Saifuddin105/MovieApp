import { apiClient } from './client';
import { WatchedMovie } from '../types/user';

export interface MarkWatchedPayload {
  tmdbId: number;
  title: string;
  posterPath?: string | null;
  backdropPath?: string | null;
  releaseDate?: string | null;
  voteAverage?: number | null;
  userRating?: number | null;
  watchedAt?: string;
}

export const watchedApi = {
  getWatched: async (): Promise<WatchedMovie[]> => {
    const res = await apiClient.get<WatchedMovie[]>('/watched');
    return res.data;
  },

  markWatched: async (payload: MarkWatchedPayload): Promise<WatchedMovie> => {
    const res = await apiClient.post<WatchedMovie>('/watched', payload);
    return res.data;
  },

  removeFromWatched: async (tmdbId: number): Promise<{ success: boolean; message: string }> => {
    const res = await apiClient.delete<{ success: boolean; message: string }>(`/watched/${tmdbId}`);
    return res.data;
  },

  moveToWatchlist: async (tmdbId: number): Promise<any> => {
    const res = await apiClient.post(`/watched/move-to-watchlist/${tmdbId}`);
    return res.data;
  },

  checkWatched: async (
    tmdbId: number,
  ): Promise<{ isWatched: boolean; watchedAt?: string; userRating?: number }> => {
    const res = await apiClient.get<{ isWatched: boolean; watchedAt?: string; userRating?: number }>(
      `/watched/check/${tmdbId}`,
    );
    return res.data;
  },
};

