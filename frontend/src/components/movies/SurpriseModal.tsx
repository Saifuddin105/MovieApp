import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Modal } from '../ui/Modal';
import { Button } from '../ui/Button';
import { Movie } from '../../types/movie';
import {
  getBackdropUrl,
  getPosterUrl,
  formatRating,
  formatReleaseYear,
  formatRuntime,
  getYouTubeEmbedUrl,
} from '../../utils/tmdb';
import { Star, Sparkles, Play, Bookmark, CheckCircle, ExternalLink, RefreshCw } from 'lucide-react';
import { watchlistApi } from '../../api/watchlist';
import { watchedApi } from '../../api/watched';
import { useAuth } from '../../context/AuthContext';
import { useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';

interface SurpriseModalProps {
  isOpen: boolean;
  onClose: () => void;
  movie: Movie | null;
  trailerKey: string | null;
  onReroll: () => void;
  isRerolling?: boolean;
}

export const SurpriseModal: React.FC<SurpriseModalProps> = ({
  isOpen,
  onClose,
  movie,
  trailerKey,
  onReroll,
  isRerolling = false,
}) => {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const queryClient = useQueryClient();
  const [showEmbeddedTrailer, setShowEmbeddedTrailer] = useState(false);

  if (!movie) return null;

  const handleWatchlist = async () => {
    if (!isAuthenticated) {
      toast.info('Sign in to save this movie to your watchlist');
      navigate('/login');
      return;
    }
    try {
      await watchlistApi.addToWatchlist({
        tmdbId: movie.id,
        title: movie.title,
        posterPath: movie.poster_path,
        backdropPath: movie.backdrop_path,
        releaseDate: movie.release_date,
        voteAverage: movie.vote_average,
      });
      toast.success(`Added "${movie.title}" to your watchlist!`);
      queryClient.invalidateQueries({ queryKey: ['watchlist'] });
      queryClient.invalidateQueries({ queryKey: ['userStats'] });
    } catch (e: any) {
      toast.error(e.response?.data?.message || 'Failed to add to watchlist');
    }
  };

  const handleWatched = async () => {
    if (!isAuthenticated) {
      toast.info('Sign in to mark this movie as watched');
      navigate('/login');
      return;
    }
    try {
      await watchedApi.markWatched({
        tmdbId: movie.id,
        title: movie.title,
        posterPath: movie.poster_path,
        backdropPath: movie.backdrop_path,
        releaseDate: movie.release_date,
        voteAverage: movie.vote_average,
      });
      toast.success(`Marked "${movie.title}" as watched!`);
      queryClient.invalidateQueries({ queryKey: ['watchlist'] });
      queryClient.invalidateQueries({ queryKey: ['watched'] });
      queryClient.invalidateQueries({ queryKey: ['userStats'] });
    } catch (e: any) {
      toast.error(e.response?.data?.message || 'Failed to update watched status');
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} maxWidth="2xl">
      <div className="space-y-6">
        {/* Header Bar */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-amber-400" />
            <span className="font-extrabold text-base uppercase tracking-wider text-amber-400">
              Your Movie Match Tonight
            </span>
          </div>
          <Button
            variant="secondary"
            size="sm"
            onClick={onReroll}
            isLoading={isRerolling}
          >
            <RefreshCw className="w-3.5 h-3.5" />
            Spin Again
          </Button>
        </div>

        {/* Backdrop or Trailer Frame */}
        <div className="relative aspect-video rounded-2xl overflow-hidden bg-slate-900 border border-border/80">
          {showEmbeddedTrailer && trailerKey ? (
            <iframe
              src={getYouTubeEmbedUrl(trailerKey)}
              title={`${movie.title} Trailer`}
              className="w-full h-full"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            />
          ) : (
            <>
              <img
                src={getBackdropUrl(movie.backdrop_path || movie.poster_path, 'w1280')}
                alt={movie.title}
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-background via-black/40 to-transparent" />
              {trailerKey && (
                <button
                  onClick={() => setShowEmbeddedTrailer(true)}
                  className="absolute inset-0 flex items-center justify-center group"
                >
                  <div className="w-16 h-16 rounded-full bg-amber-500 text-slate-950 flex items-center justify-center shadow-glow group-hover:scale-110 transition-transform">
                    <Play className="w-7 h-7 fill-slate-950 ml-1" />
                  </div>
                </button>
              )}
            </>
          )}
        </div>

        {/* Movie Details */}
        <div className="space-y-3">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <h2 className="text-2xl font-black text-slate-100">{movie.title}</h2>
            <div className="flex items-center gap-2">
              <span className="flex items-center gap-1 bg-amber-500/20 text-amber-400 px-2.5 py-1 rounded-xl text-xs font-bold border border-amber-500/30">
                <Star className="w-3.5 h-3.5 fill-amber-400" />
                {formatRating(movie.vote_average)}
              </span>
              <span className="text-xs text-slate-400 bg-slate-800/80 px-2.5 py-1 rounded-xl border border-slate-700/60">
                {formatReleaseYear(movie.release_date)}
              </span>
              {movie.runtime && (
                <span className="text-xs text-slate-400 bg-slate-800/80 px-2.5 py-1 rounded-xl border border-slate-700/60">
                  {formatRuntime(movie.runtime)}
                </span>
              )}
            </div>
          </div>

          <p className="text-sm text-slate-300 leading-relaxed line-clamp-4">
            {movie.overview || 'No synopsis available for this title.'}
          </p>
        </div>

        {/* Actions Footer */}
        <div className="pt-2 border-t border-border/80 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <Button variant="secondary" size="sm" onClick={handleWatchlist}>
              <Bookmark className="w-4 h-4 text-amber-400" />
              Add to Watchlist
            </Button>
            <Button variant="secondary" size="sm" onClick={handleWatched}>
              <CheckCircle className="w-4 h-4 text-emerald-400" />
              Mark Watched
            </Button>
          </div>

          <Button
            variant="primary"
            size="sm"
            onClick={() => {
              onClose();
              navigate(`/movie/${movie.id}`);
            }}
          >
            <span>Full Details & Cast</span>
            <ExternalLink className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </Modal>
  );
};

