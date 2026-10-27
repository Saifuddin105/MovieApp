import React, { useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { moviesApi } from '../api/movies';
import { watchlistApi } from '../api/watchlist';
import { watchedApi } from '../api/watched';
import { useAuth } from '../context/AuthContext';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { MovieGrid } from '../components/movies/MovieGrid';
import { TrailerModal } from '../components/movies/TrailerModal';
import {
  getBackdropUrl,
  getPosterUrl,
  getProfileUrl,
  formatRating,
  formatReleaseYear,
  formatRuntime,
} from '../utils/tmdb';
import {
  Star,
  Play,
  Bookmark,
  CheckCircle,
  Calendar,
  Clock,
  ArrowLeft,
  Share2,
} from 'lucide-react';
import { toast } from 'sonner';

export const MovieDetailsPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const movieId = Number(id);
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const queryClient = useQueryClient();

  const [trailerModalOpen, setTrailerModalOpen] = useState(false);

  // Movie Details Query
  const {
    data: movie,
    isLoading,
    isError,
  } = useQuery({
    queryKey: ['movieDetails', movieId],
    queryFn: () => moviesApi.getDetails(movieId),
    enabled: !isNaN(movieId),
  });

  // Movie Credits Query
  const { data: credits } = useQuery({
    queryKey: ['movieCredits', movieId],
    queryFn: () => moviesApi.getCredits(movieId),
    enabled: !isNaN(movieId),
  });

  // Movie Videos Query
  const { data: videos } = useQuery({
    queryKey: ['movieVideos', movieId],
    queryFn: () => moviesApi.getVideos(movieId),
    enabled: !isNaN(movieId),
  });

  // Similar Movies Query
  const { data: similar } = useQuery({
    queryKey: ['movieSimilar', movieId],
    queryFn: () => moviesApi.getSimilar(movieId, 1),
    enabled: !isNaN(movieId),
  });

  // Check Watchlist status
  const { data: watchlistStatus } = useQuery({
    queryKey: ['watchlistStatus', movieId],
    queryFn: () => watchlistApi.checkWatchlist(movieId),
    enabled: isAuthenticated && !isNaN(movieId),
  });

  // Check Watched status
  const { data: watchedStatus } = useQuery({
    queryKey: ['watchedStatus', movieId],
    queryFn: () => watchedApi.checkWatched(movieId),
    enabled: isAuthenticated && !isNaN(movieId),
  });

  // Watchlist Mutation
  const toggleWatchlistMutation = useMutation({
    mutationFn: async () => {
      if (!isAuthenticated) {
        toast.info('Sign in to manage your watchlist');
        navigate('/login');
        return;
      }
      if (watchlistStatus?.inWatchlist) {
        await watchlistApi.removeFromWatchlist(movieId);
        toast.success(`Removed "${movie?.title}" from your watchlist`);
      } else {
        await watchlistApi.addToWatchlist({
          tmdbId: movieId,
          title: movie!.title,
          posterPath: movie!.poster_path,
          backdropPath: movie!.backdrop_path,
          releaseDate: movie!.release_date,
          voteAverage: movie!.vote_average,
        });
        toast.success(`Added "${movie?.title}" to your watchlist`);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['watchlistStatus', movieId] });
      queryClient.invalidateQueries({ queryKey: ['watchlist'] });
      queryClient.invalidateQueries({ queryKey: ['userStats'] });
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.message || 'Failed to update watchlist');
    },
  });

  // Watched Mutation
  const toggleWatchedMutation = useMutation({
    mutationFn: async () => {
      if (!isAuthenticated) {
        toast.info('Sign in to track your watched movies');
        navigate('/login');
        return;
      }
      if (watchedStatus?.isWatched) {
        await watchedApi.removeFromWatched(movieId);
        toast.success(`Removed "${movie?.title}" from watched`);
      } else {
        await watchedApi.markWatched({
          tmdbId: movieId,
          title: movie!.title,
          posterPath: movie!.poster_path,
          backdropPath: movie!.backdrop_path,
          releaseDate: movie!.release_date,
          voteAverage: movie!.vote_average,
        });
        toast.success(`Marked "${movie?.title}" as watched!`);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['watchedStatus', movieId] });
      queryClient.invalidateQueries({ queryKey: ['watchlistStatus', movieId] });
      queryClient.invalidateQueries({ queryKey: ['watched'] });
      queryClient.invalidateQueries({ queryKey: ['watchlist'] });
      queryClient.invalidateQueries({ queryKey: ['userStats'] });
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.message || 'Failed to update watched status');
    },
  });

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: movie?.title,
        url: window.location.href,
      });
    } else {
      navigator.clipboard.writeText(window.location.href);
      toast.success('Movie link copied to clipboard!');
    }
  };

  if (isLoading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-16 space-y-8 animate-pulse">
        <div className="h-96 bg-slate-800 rounded-3xl" />
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="h-80 bg-slate-800 rounded-2xl" />
          <div className="md:col-span-3 space-y-4">
            <div className="h-10 bg-slate-800 rounded w-1/2" />
            <div className="h-6 bg-slate-800 rounded w-1/4" />
            <div className="h-24 bg-slate-800 rounded" />
          </div>
        </div>
      </div>
    );
  }

  if (isError || !movie) {
    return (
      <div className="max-w-lg mx-auto py-24 px-4 text-center space-y-4">
        <h2 className="text-2xl font-bold text-slate-100">Movie Not Found</h2>
        <p className="text-sm text-slate-400">
          We could not locate this movie record on TMDB. It may have been removed or the ID is invalid.
        </p>
        <Button variant="primary" onClick={() => navigate('/discover')}>
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Discover
        </Button>
      </div>
    );
  }

  // Find suitable YouTube trailer
  const officialTrailer = videos?.results?.find(
    (v) => v.site === 'YouTube' && (v.type === 'Trailer' || v.type === 'Teaser'),
  );

  return (
    <div className="space-y-12 pb-24">
      {/* Backdrop Hero Header */}
      <div className="relative min-h-[460px] sm:min-h-[520px] flex items-end overflow-hidden border-b border-border/80">
        <div className="absolute inset-0">
          <img
            src={getBackdropUrl(movie.backdrop_path || movie.poster_path, 'original')}
            alt={movie.title}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-background via-background/80 to-transparent" />
          <div className="absolute inset-0 bg-gradient-to-r from-background via-background/60 to-transparent" />
        </div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 w-full z-10">
          <div className="flex flex-col md:flex-row items-start md:items-end gap-6 sm:gap-8">
            {/* Poster Card */}
            <div className="w-40 sm:w-56 flex-shrink-0 rounded-2xl overflow-hidden shadow-2xl border-2 border-border/80 bg-slate-900 -mb-16 md:mb-0">
              <img
                src={getPosterUrl(movie.poster_path, 'w500')}
                alt={movie.title}
                className="w-full aspect-[2/3] object-cover"
              />
            </div>

            {/* Title & High-Level Metadata */}
            <div className="flex-1 space-y-4">
              <div className="flex flex-wrap items-center gap-2">
                {movie.genres?.map((g) => (
                  <Badge key={g.id} variant="amber">
                    {g.name}
                  </Badge>
                ))}
              </div>

              <div>
                <h1 className="text-3xl sm:text-5xl font-black text-slate-100 tracking-tight">
                  {movie.title}
                </h1>
                {movie.original_title && movie.original_title !== movie.title && (
                  <p className="text-sm text-slate-400 italic mt-0.5">
                    Original Title: {movie.original_title}
                  </p>
                )}
                {movie.tagline && (
                  <p className="text-sm font-medium text-amber-400/90 mt-1">&ldquo;{movie.tagline}&rdquo;</p>
                )}
              </div>

              <div className="flex flex-wrap items-center gap-4 text-xs sm:text-sm text-slate-300">
                <div className="flex items-center gap-1.5 bg-amber-500/20 text-amber-300 px-3 py-1 rounded-xl font-bold border border-amber-500/30">
                  <Star className="w-4 h-4 fill-amber-400" />
                  <span>{formatRating(movie.vote_average)}</span>
                  <span className="text-slate-400 font-normal">
                    ({movie.vote_count.toLocaleString()} votes)
                  </span>
                </div>

                <div className="flex items-center gap-1.5">
                  <Calendar className="w-4 h-4 text-slate-400" />
                  <span>{formatReleaseYear(movie.release_date)}</span>
                </div>

                {movie.runtime && (
                  <div className="flex items-center gap-1.5">
                    <Clock className="w-4 h-4 text-slate-400" />
                    <span>{formatRuntime(movie.runtime)}</span>
                  </div>
                )}
              </div>

              {/* Action Buttons Row */}
              <div className="flex flex-wrap items-center gap-3 pt-2">
                {officialTrailer && (
                  <Button
                    variant="primary"
                    size="md"
                    onClick={() => setTrailerModalOpen(true)}
                  >
                    <Play className="w-4 h-4 fill-slate-950" />
                    Watch Trailer
                  </Button>
                )}

                <Button
                  variant={watchlistStatus?.inWatchlist ? 'primary' : 'secondary'}
                  size="md"
                  onClick={() => toggleWatchlistMutation.mutate()}
                  isLoading={toggleWatchlistMutation.isPending}
                >
                  <Bookmark
                    className={`w-4 h-4 ${
                      watchlistStatus?.inWatchlist ? 'fill-slate-950 text-slate-950' : 'text-amber-400'
                    }`}
                  />
                  <span>
                    {watchlistStatus?.inWatchlist ? 'In Watchlist' : 'Add to Watchlist'}
                  </span>
                </Button>

                <Button
                  variant={watchedStatus?.isWatched ? 'coral' : 'secondary'}
                  size="md"
                  onClick={() => toggleWatchedMutation.mutate()}
                  isLoading={toggleWatchedMutation.isPending}
                >
                  <CheckCircle className="w-4 h-4" />
                  <span>{watchedStatus?.isWatched ? 'Watched' : 'Mark as Watched'}</span>
                </Button>

                <Button variant="ghost" size="md" onClick={handleShare}>
                  <Share2 className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Details Body */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        {/* Overview */}
        <section className="space-y-3">
          <h3 className="text-xl font-bold text-slate-100">Overview</h3>
          <p className="text-base text-slate-300 leading-relaxed max-w-4xl">
            {movie.overview || 'No overview synopsis provided by TMDB.'}
          </p>
        </section>

        {/* Cast & Crew Carousel/Grid */}
        {credits && credits.cast && credits.cast.length > 0 && (
          <section className="space-y-4">
            <h3 className="text-xl font-bold text-slate-100">Top Cast</h3>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-4">
              {credits.cast.slice(0, 6).map((actor) => (
                <div
                  key={actor.id}
                  className="bg-card border border-border/60 rounded-2xl overflow-hidden p-2 text-center space-y-2"
                >
                  <img
                    src={getProfileUrl(actor.profile_path, 'w185')}
                    alt={actor.name}
                    className="w-full aspect-[2/3] object-cover rounded-xl bg-slate-800"
                  />
                  <div>
                    <h5 className="font-bold text-xs text-slate-100 line-clamp-1">{actor.name}</h5>
                    <p className="text-[11px] text-slate-400 line-clamp-1">{actor.character}</p>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Similar Movies */}
        {similar && similar.results && similar.results.length > 0 && (
          <section className="space-y-4">
            <h3 className="text-xl font-bold text-slate-100">Similar Movies You Might Enjoy</h3>
            <MovieGrid movies={similar.results.slice(0, 5)} />
          </section>
        )}
      </div>

      {/* Trailer Modal */}
      <TrailerModal
        isOpen={trailerModalOpen}
        onClose={() => setTrailerModalOpen(false)}
        videoKey={officialTrailer?.key || null}
        movieTitle={movie.title}
      />
    </div>
  );
};

