export interface User {
  id: string;
  name: string;
  email: string;
  avatarUrl?: string | null;
  createdAt: string;
  stats?: {
    watchlistCount: number;
    watchedCount: number;
  };
}

export interface AuthResponse {
  user: User;
  accessToken: string;
  refreshToken: string;
}

export interface WatchlistItem {
  id: string;
  userId: string;
  tmdbId: number;
  title: string;
  posterPath: string | null;
  backdropPath: string | null;
  releaseDate: string | null;
  voteAverage: number | null;
  createdAt: string;
}

export interface WatchedMovie {
  id: string;
  userId: string;
  tmdbId: number;
  title: string;
  posterPath: string | null;
  backdropPath: string | null;
  releaseDate: string | null;
  voteAverage: number | null;
  userRating?: number | null;
  watchedAt: string;
  createdAt: string;
}

export interface UserStats {
  watchlistCount: number;
  watchedCount: number;
  recentWatched: WatchedMovie[];
}

