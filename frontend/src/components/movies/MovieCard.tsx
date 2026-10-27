import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Star, Bookmark, CheckCircle, Plus, Check } from 'lucide-react';
import { Movie } from '../../types/movie';
import { getPosterUrl, formatRating, formatReleaseYear } from '../../utils/tmdb';
import { useAuth } from '../../context/AuthContext';
import { watchlistApi } from '../../api/watchlist';
import { watchedApi } from '../../api/watched';
import { useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';

interface MovieCardProps {
  movie: Movie;
  inWatchlistInitial?: boolean;
  isWatchedInitial?: boolean;
}

export const MovieCard: React.FC<MovieCardProps> = ({
  movie,
  inWatchlistInitial = false,
  isWatchedInitial = false,
}) => {
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const [inWatchlist, setInWatchlist] = useState(inWatchlistInitial);
  const [isWatched, setIsWatched] = useState(isWatchedInitial);
  const [isMutating, setIsMutating] = useState(false);

  const handleWatchlistClick = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (!isAuthenticated) {
      toast.info('Sign in to add movies to your watchlist');
      navigate('/login');
      return;
    }

    try {
      setIsMutating(true);
      if (inWatchlist) {
        await watchlistApi.removeFromWatchlist(movie.id);
        setInWatchlist(false);
        toast.success(`Removed "${movie.title}" from watchlist`);
      } else {
        await watchlistApi.addToWatchlist({
          tmdbId: movie.id,
          title: movie.title,
          posterPath: movie.poster_path,
          backdropPath: movie.backdrop_path,
          releaseDate: movie.release_date,
          voteAverage: movie.vote_average,
        });
        setInWatchlist(true);
        toast.success(`Added "${movie.title}" to watchlist`);
      }
      queryClient.invalidateQueries({ queryKey: ['watchlist'] });
      queryClient.invalidateQueries({ queryKey: ['userStats'] });
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to update watchlist');
    } finally {
      setIsMutating(false);
    }
  };

  const handleWatchedClick = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (!isAuthenticated) {
      toast.info('Sign in to track your watched movies');
      navigate('/login');
      return;
    }

    try {
      setIsMutating(true);
      if (isWatched) {
        await watchedApi.removeFromWatched(movie.id);
        setIsWatched(false);
        toast.success(`Removed "${movie.title}" from watched`);
      } else {
        await watchedApi.markWatched({
          tmdbId: movie.id,
          title: movie.title,
          posterPath: movie.poster_path,
          backdropPath: movie.backdrop_path,
          releaseDate: movie.release_date,
          voteAverage: movie.vote_average,
        });
        setIsWatched(true);
        // Automatically removed from watchlist on backend
        setInWatchlist(false);
        toast.success(`Marked "${movie.title}" as watched!`);
      }
      queryClient.invalidateQueries({ queryKey: ['watchlist'] });
      queryClient.invalidateQueries({ queryKey: ['watched'] });
      queryClient.invalidateQueries({ queryKey: ['userStats'] });
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to update watched status');
    } finally {
      setIsMutating(false);
    }
  };

  return (
    <div className="group relative flex flex-col rounded-2xl bg-card border border-border/60 hover:border-amber-500/50 transition-all duration-300 overflow-hidden shadow-lg hover:shadow-glow hover:-translate-y-1">
      <Link to={`/movie/${movie.id}`} className="block relative aspect-[2/3] overflow-hidden bg-slate-900">
        <img
          src={getPosterUrl(movie.poster_path, 'w500')}
          alt={movie.title}
          loading="lazy"
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
        />

        {/* Rating Badge */}
        <div className="absolute top-2.5 left-2.5 bg-black/75 backdrop-blur-md px-2 py-0.5 rounded-lg border border-white/10 flex items-center gap-1 shadow">
          <Star className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
          <span className="text-xs font-bold text-slate-100">{formatRating(movie.vote_average)}</span>
        </div>

        {/* Quick Action Overlay (Hover on Desktop, Tap on Mobile) */}
        <div className="absolute top-2.5 right-2.5 flex flex-col gap-1.5 opacity-90 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity">
          <button
            onClick={handleWatchlistClick}
            disabled={isMutating}
            title={inWatchlist ? 'In Watchlist' : 'Add to Watchlist'}
            className={`p-2 rounded-xl backdrop-blur-md transition-all shadow-md ${
              inWatchlist
                ? 'bg-amber-500 text-slate-950 font-bold'
                : 'bg-black/80 text-slate-200 hover:text-amber-400 hover:bg-slate-900 border border-white/10'
            }`}
          >
            <Bookmark className={`w-4 h-4 ${inWatchlist ? 'fill-slate-950' : ''}`} />
          </button>

          <button
            onClick={handleWatchedClick}
            disabled={isMutating}
            title={isWatched ? 'Watched' : 'Mark as Watched'}
            className={`p-2 rounded-xl backdrop-blur-md transition-all shadow-md ${
              isWatched
                ? 'bg-emerald-500 text-slate-950 font-bold'
                : 'bg-black/80 text-slate-200 hover:text-emerald-400 hover:bg-slate-900 border border-white/10'
            }`}
          >
            <CheckCircle className={`w-4 h-4 ${isWatched ? 'fill-slate-950' : ''}`} />
          </button>
        </div>
      </Link>

      {/* Card Body */}
      <div className="p-3.5 flex flex-col flex-1 justify-between gap-2">
        <Link to={`/movie/${movie.id}`}>
          <h4 className="font-semibold text-sm text-slate-100 group-hover:text-amber-400 transition-colors line-clamp-1">
            {movie.title}
          </h4>
        </Link>
        <div className="flex items-center justify-between text-xs text-slate-400">
          <span>{formatReleaseYear(movie.release_date)}</span>
          {movie.vote_count > 0 && (
            <span className="text-[11px] text-slate-400">{movie.vote_count.toLocaleString()} votes</span>
          )}
        </div>
      </div>
    </div>
  );
};

