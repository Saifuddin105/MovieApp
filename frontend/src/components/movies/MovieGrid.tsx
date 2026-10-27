import React from 'react';
import { Movie } from '../../types/movie';
import { MovieCard } from './MovieCard';
import { MovieCardSkeleton } from '../ui/Skeleton';
import { Film } from 'lucide-react';

interface MovieGridProps {
  movies: Movie[];
  isLoading?: boolean;
  emptyMessage?: string;
  skeletonCount?: number;
}

export const MovieGrid: React.FC<MovieGridProps> = ({
  movies,
  isLoading = false,
  emptyMessage = 'No movies found matching your criteria.',
  skeletonCount = 10,
}) => {
  if (isLoading) {
    return (
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 sm:gap-6">
        {Array.from({ length: skeletonCount }).map((_, index) => (
          <MovieCardSkeleton key={index} />
        ))}
      </div>
    );
  }

  if (movies.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 px-4 text-center rounded-2xl border border-dashed border-border/80 bg-card/40 my-6">
        <div className="w-16 h-16 rounded-2xl bg-slate-800/80 flex items-center justify-center text-slate-400 mb-4">
          <Film className="w-8 h-8 text-amber-500/80" />
        </div>
        <h3 className="text-lg font-bold text-slate-200 mb-1">No Movies Found</h3>
        <p className="text-sm text-slate-400 max-w-sm">{emptyMessage}</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 sm:gap-6">
      {movies.map((movie) => (
        <MovieCard key={movie.id} movie={movie} />
      ))}
    </div>
  );
};

