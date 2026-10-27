import React, { useState } from 'react';
import { useMutation, useQuery } from '@tanstack/react-query';
import { MoodSelector } from '../components/movies/MoodSelector';
import { TimeSelector } from '../components/movies/TimeSelector';
import { EraSelector } from '../components/movies/EraSelector';
import { MovieGrid } from '../components/movies/MovieGrid';
import { SurpriseModal } from '../components/movies/SurpriseModal';
import { Button } from '../components/ui/Button';
import { moviesApi } from '../api/movies';
import {
  MoodType,
  RuntimeType,
  EraType,
  Movie,
  FindTonightResponse,
  SurpriseMovieResponse,
} from '../types/movie';
import { Sparkles, Dices, RefreshCw, Flame, ArrowRight, ChevronDown } from 'lucide-react';
import { toast } from 'sonner';

export const HomePage: React.FC = () => {
  // Preference States
  const [selectedMoods, setSelectedMoods] = useState<MoodType[]>([]);
  const [selectedGenres, setSelectedGenres] = useState<number[]>([]);
  const [selectedTime, setSelectedTime] = useState<RuntimeType | undefined>(undefined);
  const [selectedEra, setSelectedEra] = useState<EraType | undefined>(undefined);

  // Results State & Multi-Page Accumulator
  const [resultsData, setResultsData] = useState<FindTonightResponse | null>(null);
  const [allMovies, setAllMovies] = useState<Movie[]>([]);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [isLoadingMore, setIsLoadingMore] = useState<boolean>(false);
  const [hasSearched, setHasSearched] = useState(false);

  // Surprise Me State
  const [surpriseModalOpen, setSurpriseModalOpen] = useState(false);
  const [surpriseData, setSurpriseData] = useState<SurpriseMovieResponse | null>(null);
  const [surpriseHistory, setSurpriseHistory] = useState<number[]>([]);

  // Fetch initial trending movies for hero banner / discovery fallback
  const { data: trendingData, isLoading: isTrendingLoading } = useQuery({
    queryKey: ['trendingMovies'],
    queryFn: () => moviesApi.getTrending('day', 1),
    staleTime: 10 * 60 * 1000,
  });

  // Find My Movie Mutation
  const findMovieMutation = useMutation({
    mutationFn: () => {
      if (selectedMoods.length === 0 && selectedGenres.length === 0) {
        throw new Error('Please select at least one genre or mood to find movies');
      }
      return moviesApi.findForTonight({
        moods: selectedMoods.length > 0 ? selectedMoods : undefined,
        genreIds: selectedGenres.length > 0 ? selectedGenres : undefined,
        runtime: selectedTime,
        era: selectedEra,
        page: 1,
      });
    },
    onSuccess: (data) => {
      setResultsData(data);
      setAllMovies(data.results);
      setCurrentPage(1);
      setHasSearched(true);
      if (data.results.length === 0) {
        toast.info('No movies found for those exact filters. Try broadening your criteria!');
      } else {
        toast.success(`Found ${data.total_results.toLocaleString()} matching movies!`);
        // Smooth scroll to results
        setTimeout(() => {
          document.getElementById('results-section')?.scrollIntoView({ behavior: 'smooth' });
        }, 100);
      }
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to discover movies');
    },
  });

  // Load More Pages Mutation / Handler
  const handleLoadMore = async () => {
    if (!resultsData || currentPage >= resultsData.total_pages || isLoadingMore) return;
    try {
      setIsLoadingMore(true);
      const nextPage = currentPage + 1;
      const res = await moviesApi.findForTonight({
        moods: selectedMoods.length > 0 ? selectedMoods : undefined,
        genreIds: selectedGenres.length > 0 ? selectedGenres : undefined,
        runtime: selectedTime,
        era: selectedEra,
        page: nextPage,
      });

      // Avoid duplicates
      setAllMovies((prev) => {
        const existingIds = new Set(prev.map((m) => m.id));
        const newUnique = res.results.filter((m) => !existingIds.has(m.id));
        return [...prev, ...newUnique];
      });
      setCurrentPage(nextPage);
      toast.success(`Loaded ${res.results.length} more movies!`);
    } catch (err: any) {
      toast.error('Failed to load more movies.');
    } finally {
      setIsLoadingMore(false);
    }
  };

  // Surprise Me Mutation
  const surpriseMutation = useMutation({
    mutationFn: () =>
      moviesApi.surpriseMe({
        excludedIds: surpriseHistory,
        mood: selectedMoods[0],
        genreId: selectedGenres[0],
      }),
    onSuccess: (data) => {
      setSurpriseData(data);
      setSurpriseHistory((prev) => [...prev, data.movie.id]);
      setSurpriseModalOpen(true);
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Could not pick a surprise movie');
    },
  });

  const handleResetFilters = () => {
    setSelectedMoods([]);
    setSelectedGenres([]);
    setSelectedTime(undefined);
    setSelectedEra(undefined);
    setResultsData(null);
    setAllMovies([]);
    setCurrentPage(1);
    setHasSearched(false);
  };

  return (
    <div className="space-y-16 pb-20">
      {/* Hero Section */}
      <section className="relative pt-12 pb-8 sm:pt-20 sm:pb-12 text-center px-4 hero-gradient overflow-hidden">
        <div className="max-w-4xl mx-auto space-y-6">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-300 text-xs font-semibold tracking-wide uppercase shadow-glow">
            <Sparkles className="w-3.5 h-3.5" />
            <span>AI & TMDB-Powered Recommendation Engine</span>
          </div>

          <h1 className="text-4xl sm:text-6xl font-black tracking-tight text-slate-100 leading-[1.1]">
            What are you in the mood for{' '}
            <span className="bg-gradient-to-r from-amber-400 via-rose-400 to-amber-200 bg-clip-text text-transparent">
              tonight?
            </span>
          </h1>

          <p className="text-lg sm:text-xl text-slate-400 max-w-2xl mx-auto font-normal">
            Find your next favorite movie in just a few clicks.
          </p>
        </div>
      </section>

      {/* Interactive Preference Filter Panel */}
      <section className="max-w-5xl mx-auto px-4 sm:px-6">
        <div className="bg-[#10141d] border border-border/80 rounded-3xl p-6 sm:p-8 shadow-2xl space-y-8 backdrop-blur-md">
          {/* 1. Genres & Moods Selector */}
          <MoodSelector
            selectedMoods={selectedMoods}
            selectedGenres={selectedGenres}
            onMoodsChange={setSelectedMoods}
            onGenresChange={setSelectedGenres}
          />

          <div className="border-t border-border/60" />

          {/* 2. Runtime & 3. Era */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <TimeSelector
              selectedTime={selectedTime}
              onChange={setSelectedTime}
            />
            <EraSelector
              selectedEra={selectedEra}
              onChange={setSelectedEra}
            />
          </div>

          <div className="border-t border-border/60" />

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-2">
            <div className="flex items-center gap-2 w-full sm:w-auto">
              {hasSearched && (
                <Button
                  variant="ghost"
                  size="md"
                  onClick={handleResetFilters}
                  className="w-full sm:w-auto"
                >
                  <RefreshCw className="w-4 h-4" />
                  Reset Criteria
                </Button>
              )}
            </div>

            <div className="flex flex-col sm:flex-row items-center gap-3 w-full sm:w-auto">
              <Button
                variant="secondary"
                size="lg"
                onClick={() => surpriseMutation.mutate()}
                isLoading={surpriseMutation.isPending}
                className="w-full sm:w-auto"
              >
                <Dices className="w-5 h-5 text-amber-400" />
                <span>🎲 Surprise Me</span>
              </Button>

              <Button
                variant="primary"
                size="lg"
                onClick={() => findMovieMutation.mutate()}
                isLoading={findMovieMutation.isPending}
                disabled={selectedMoods.length === 0 && selectedGenres.length === 0}
                className="w-full sm:w-auto"
              >
                <Sparkles className="w-5 h-5" />
                <span>Find My Movie</span>
                <ArrowRight className="w-4 h-4 ml-1" />
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Results Section */}
      {hasSearched && resultsData && (
        <section id="results-section" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6 scroll-mt-24">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-border/80 pb-4">
            <div>
              <div className="flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-amber-400" />
                <h2 className="text-2xl font-black text-slate-100">
                  Recommended For Your Night
                </h2>
              </div>
              <p className="text-xs text-slate-400 mt-1">
                Showing <strong className="text-slate-200">{allMovies.length}</strong> of{' '}
                <strong className="text-amber-400">{resultsData.total_results.toLocaleString()}</strong> matching movies from TMDB
              </p>
            </div>

            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => surpriseMutation.mutate()}
              >
                <Dices className="w-4 h-4 text-amber-400" />
                Random Choice from Matches
              </Button>
            </div>
          </div>

          <MovieGrid
            movies={allMovies}
            isLoading={findMovieMutation.isPending}
            emptyMessage="No movies found matching all selected criteria. Try removing duration or era restrictions to see more options!"
          />

          {/* Load More Button & Pagination Controls */}
          {resultsData.total_pages > 1 && (
            <div className="flex flex-col items-center justify-center gap-3 pt-6 border-t border-border/80">
              <div className="text-xs text-slate-400 text-center">
                Displaying <strong className="text-slate-100">{allMovies.length}</strong> of{' '}
                <strong className="text-slate-100">{resultsData.total_results.toLocaleString()}</strong> movies (Page {currentPage} of {Math.min(resultsData.total_pages, 500)})
              </div>

              {currentPage < resultsData.total_pages && (
                <Button
                  variant="primary"
                  size="lg"
                  onClick={handleLoadMore}
                  isLoading={isLoadingMore}
                  className="px-8 shadow-glow"
                >
                  <ChevronDown className="w-5 h-5 mr-1" />
                  Load More Movies (+20)
                </Button>
              )}
            </div>
          )}
        </section>
      )}

      {/* Trending Today Showcase (when not searched or as footer discovery) */}
      {!hasSearched && (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
          <div className="flex items-center justify-between border-b border-border/80 pb-4">
            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded-xl bg-rose-500/10 text-rose-400 border border-rose-500/20">
                <Flame className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-xl sm:text-2xl font-black text-slate-100">Trending Right Now</h2>
                <p className="text-xs text-slate-400">What viewers around the globe are watching today</p>
              </div>
            </div>
          </div>

          <MovieGrid
            movies={trendingData?.results?.slice(0, 10) || []}
            isLoading={isTrendingLoading}
          />
        </section>
      )}

      {/* Surprise Me Modal */}
      <SurpriseModal
        isOpen={surpriseModalOpen}
        onClose={() => setSurpriseModalOpen(false)}
        movie={surpriseData?.movie || null}
        trailerKey={surpriseData?.trailerKey || null}
        onReroll={() => surpriseMutation.mutate()}
        isRerolling={surpriseMutation.isPending}
      />
    </div>
  );
};

