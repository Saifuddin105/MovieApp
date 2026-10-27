import React from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Link, useNavigate } from 'react-router-dom';
import { watchlistApi } from '../api/watchlist';
import { watchedApi } from '../api/watched';
import { Button } from '../components/ui/Button';
import {
  Bookmark,
  Trash2,
  CheckCircle,
  Star,
  Film,
  Sparkles,
  Compass,
} from 'lucide-react';
import { getPosterUrl, formatRating, formatReleaseYear } from '../utils/tmdb';
import { toast } from 'sonner';

export const WatchlistPage: React.FC = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const { data: watchlist, isLoading } = useQuery({
    queryKey: ['watchlist'],
    queryFn: () => watchlistApi.getWatchlist(),
  });

  const removeMutation = useMutation({
    mutationFn: (tmdbId: number) => watchlistApi.removeFromWatchlist(tmdbId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['watchlist'] });
      queryClient.invalidateQueries({ queryKey: ['userStats'] });
      toast.success('Removed from watchlist');
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.message || 'Failed to remove movie');
    },
  });

  const markWatchedMutation = useMutation({
    mutationFn: (item: any) =>
      watchedApi.markWatched({
        tmdbId: item.tmdbId,
        title: item.title,
        posterPath: item.posterPath,
        backdropPath: item.backdropPath,
        releaseDate: item.releaseDate,
        voteAverage: item.voteAverage,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['watchlist'] });
      queryClient.invalidateQueries({ queryKey: ['watched'] });
      queryClient.invalidateQueries({ queryKey: ['userStats'] });
      toast.success('Moved to Watched history!');
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.message || 'Failed to mark as watched');
    },
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-border/80 pb-6">
        <div className="space-y-1">
          <div className="flex items-center gap-2.5">
            <div className="p-2.5 rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/20">
              <Bookmark className="w-6 h-6" />
            </div>
            <h1 className="text-3xl font-black text-slate-100">My Watchlist</h1>
          </div>
          <p className="text-sm text-slate-400">
            {watchlist ? `${watchlist.length} movie${watchlist.length === 1 ? '' : 's'} saved to watch` : 'Saved movies'}
          </p>
        </div>

        <Button variant="secondary" size="sm" onClick={() => navigate('/discover')}>
          <Compass className="w-4 h-4 text-amber-400" />
          Explore More Movies
        </Button>
      </div>

      {/* Grid or Empty State */}
      {isLoading ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="aspect-[2/3] bg-slate-800 rounded-2xl animate-pulse" />
          ))}
        </div>
      ) : watchlist && watchlist.length > 0 ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 sm:gap-6">
          {watchlist.map((item) => (
            <div
              key={item.id}
              className="group flex flex-col rounded-2xl bg-card border border-border/70 hover:border-amber-500/50 transition-all duration-300 overflow-hidden shadow-lg hover:shadow-glow"
            >
              <Link to={`/movie/${item.tmdbId}`} className="block relative aspect-[2/3] bg-slate-900 overflow-hidden">
                <img
                  src={getPosterUrl(item.posterPath, 'w500')}
                  alt={item.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                {item.voteAverage && (
                  <div className="absolute top-2.5 left-2.5 bg-black/80 backdrop-blur-md px-2 py-0.5 rounded-lg border border-white/10 flex items-center gap-1 shadow">
                    <Star className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
                    <span className="text-xs font-bold text-slate-100">{formatRating(item.voteAverage)}</span>
                  </div>
                )}
              </Link>

              <div className="p-3.5 flex flex-col flex-1 justify-between gap-3">
                <div>
                  <Link to={`/movie/${item.tmdbId}`}>
                    <h4 className="font-semibold text-sm text-slate-100 group-hover:text-amber-400 transition-colors line-clamp-1">
                      {item.title}
                    </h4>
                  </Link>
                  <p className="text-xs text-slate-400 mt-0.5">{formatReleaseYear(item.releaseDate)}</p>
                </div>

                <div className="flex items-center gap-1.5 pt-1 border-t border-border/60">
                  <button
                    onClick={() => markWatchedMutation.mutate(item)}
                    className="flex-1 flex items-center justify-center gap-1 px-2 py-1.5 rounded-lg bg-emerald-500/15 text-emerald-300 hover:bg-emerald-500/25 border border-emerald-500/30 text-xs font-semibold transition-colors"
                    title="Mark Watched"
                  >
                    <CheckCircle className="w-3.5 h-3.5" />
                    <span>Watched</span>
                  </button>

                  <button
                    onClick={() => removeMutation.mutate(item.tmdbId)}
                    className="p-1.5 rounded-lg bg-rose-500/10 text-rose-400 hover:bg-rose-500/20 border border-rose-500/20 text-xs transition-colors"
                    title="Remove from watchlist"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-24 px-4 space-y-4 rounded-3xl border border-dashed border-border/80 bg-card/20 max-w-xl mx-auto">
          <div className="w-16 h-16 rounded-2xl bg-amber-500/10 text-amber-400 flex items-center justify-center mx-auto">
            <Film className="w-8 h-8" />
          </div>
          <h3 className="text-xl font-bold text-slate-200">Your Watchlist is Empty</h3>
          <p className="text-sm text-slate-400 max-w-sm mx-auto">
            Save movies you want to check out later from the home mood recommender or discover catalog.
          </p>
          <div className="pt-2 flex justify-center gap-3">
            <Button variant="primary" onClick={() => navigate('/')}>
              <Sparkles className="w-4 h-4 mr-1.5" />
              Find Movies by Mood
            </Button>
            <Button variant="secondary" onClick={() => navigate('/discover')}>
              <Compass className="w-4 h-4 mr-1.5 text-amber-400" />
              Browse Catalog
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};

