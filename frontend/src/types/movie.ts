export interface Movie {
  id: number;
  title: string;
  original_title?: string;
  overview: string;
  poster_path: string | null;
  backdrop_path: string | null;
  release_date: string;
  vote_average: number;
  vote_count: number;
  popularity: number;
  genre_ids?: number[];
  genres?: { id: number; name: string }[];
  runtime?: number;
  tagline?: string;
  status?: string;
  budget?: number;
  revenue?: number;
}

export interface PaginatedMovies {
  page: number;
  results: Movie[];
  total_pages: number;
  total_results: number;
}

export interface CastMember {
  id: number;
  name: string;
  character: string;
  profile_path: string | null;
  order: number;
}

export interface CrewMember {
  id: number;
  name: string;
  job: string;
  department: string;
  profile_path: string | null;
}

export interface MovieCredits {
  id: number;
  cast: CastMember[];
  crew: CrewMember[];
}

export interface MovieVideo {
  id: string;
  key: string;
  name: string;
  site: string;
  type: string;
  official: boolean;
}

export interface Genre {
  id: number;
  name: string;
}

export type MoodType = 'scary' | 'funny' | 'smart' | 'emotional' | 'romantic' | 'exciting';
export type RuntimeType = 'under-90' | '90-120' | 'over-120';
export type EraType = 'classic' | '2000-2010' | '2010-2020' | 'recent';

export interface FindTonightRequest {
  moods?: MoodType[];
  genreIds?: number[];
  runtime?: RuntimeType;
  era?: EraType;
  page?: number;
}

export interface FindTonightResponse extends PaginatedMovies {
  appliedFilters: {
    moods: MoodType[];
    runtime?: RuntimeType;
    era?: EraType;
    genreIds: number[];
  };
}

export interface SurpriseMovieResponse {
  movie: Movie;
  trailerKey: string | null;
}

