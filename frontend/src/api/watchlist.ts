import { apiClient } from './client';
import { WatchlistItem } from '../types/user';

export interface AddWatchlistPayload {
  tmdbId: number;
  title: string;
  posterPath?: string | null;
  backdropPath?: string | null;
  releaseDate?: string | null;
  voteAverage?: number | null;
}

export const watchlistApi = {
  getWatchlist: async (): Promise<WatchlistItem[]> => {
    const res = await apiClient.get<WatchlistItem[]>('/watchlist');
    return res.data;
  },

  addToWatchlist: async (payload: AddWatchlistPayload): Promise<WatchlistItem> => {
    const res = await apiClient.post<WatchlistItem>('/watchlist', payload);
    return res.data;
  },

  removeFromWatchlist: async (tmdbId: number): Promise<{ success: boolean; message: string }> => {
    const res = await apiClient.delete<{ success: boolean; message: string }>(`/watchlist/${tmdbId}`);
    return res.data;
  },

  checkWatchlist: async (tmdbId: number): Promise<{ inWatchlist: boolean }> => {
    const res = await apiClient.get<{ inWatchlist: boolean }>(`/watchlist/check/${tmdbId}`);
    return res.data;
  },
};

