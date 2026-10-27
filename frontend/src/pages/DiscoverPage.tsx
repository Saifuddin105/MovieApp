import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { moviesApi } from '../api/movies';
import { MovieGrid } from '../components/movies/MovieGrid';
import { Button } from '../components/ui/Button';
import { ALL_TMDB_GENRES } from '../components/movies/MoodSelector';
import {
  Compass,
  Flame,
  Award,
  Calendar,
  Filter,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';

type TabType = 'popular' | 'trending' | 'top_rated' | 'upcoming' | 'custom';

export const DiscoverPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<TabType>('popular');
  const [page, setPage] = useState<number>(1);
  const [selectedGenre, setSelectedGenre] = useState<string>('');
  const [selectedYear, setSelectedYear] = useState<number | undefined>(undefined);
  const [sortBy, setSortBy] = useState<string>('popularity.desc');

  // Fetch genres
  const { data: genresData } = useQuery({
    queryKey: ['genres'],
    queryFn: () => moviesApi.getGenres(),
    staleTime: 60 * 60 * 1000,
  });

  // Fetch movies depending on tab
  const { data, isLoading } = useQuery({
    queryKey: ['discoverMovies', activeTab, page, selectedGenre, selectedYear, sortBy],
    queryFn: async () => {
      if (activeTab === 'popular') {
        return moviesApi.getPopular(page);
      }
      if (activeTab === 'trending') {
        return moviesApi.getTrending('day', page);
      }
      if (activeTab === 'top_rated') {
        return moviesApi.getTopRated(page);
      }
      if (activeTab === 'upcoming') {
        return moviesApi.getUpcoming(page);
      }
      // Custom filter via discover endpoint
      return moviesApi.discover({
        page,
        with_genres: selectedGenre || undefined,
        primary_release_year: selectedYear,
        sort_by: sortBy,
      });
    },
    staleTime: 5 * 60 * 1000,
  });

  const handleTabChange = (tab: TabType) => {
    setActiveTab(tab);
    setPage(1);
  };

  const handlePageChange = (newPage: number) => {
    setPage(newPage);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const currentYear = new Date().getFullYear();
  const yearOptions = Array.from({ length: 30 }, (_, i) => currentYear - i);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Page Header */}
      <div className="space-y-3">
        <div className="flex items-center gap-2.5">
          <div className="p-2.5 rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/20">
            <Compass className="w-6 h-6" />
          </div>
          <h1 className="text-3xl font-black text-slate-100">Discover Movies</h1>
        </div>
        <p className="text-sm text-slate-400 max-w-xl">
          Browse real, acclaimed cinema across global charts, trending hits, upcoming releases,
          and curated genres.
        </p>
      </div>

      {/* Category Tabs */}
      <div className="flex flex-wrap items-center gap-2 border-b border-border/80 pb-3">
        <button
          onClick={() => handleTabChange('popular')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition-all ${
            activeTab === 'popular'
              ? 'bg-amber-500 text-slate-950 shadow-glow'
              : 'text-slate-300 hover:text-white hover:bg-slate-800'
          }`}
        >
          <Compass className="w-4 h-4" />
          Popular
        </button>

        <button
          onClick={() => handleTabChange('trending')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition-all ${
            activeTab === 'trending'
              ? 'bg-amber-500 text-slate-950 shadow-glow'
              : 'text-slate-300 hover:text-white hover:bg-slate-800'
          }`}
        >
          <Flame className="w-4 h-4" />
          Trending Today
        </button>

        <button
          onClick={() => handleTabChange('top_rated')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition-all ${
            activeTab === 'top_rated'
              ? 'bg-amber-500 text-slate-950 shadow-glow'
              : 'text-slate-300 hover:text-white hover:bg-slate-800'
          }`}
        >
          <Award className="w-4 h-4" />
          Top Rated
        </button>

        <button
          onClick={() => handleTabChange('upcoming')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition-all ${
            activeTab === 'upcoming'
              ? 'bg-amber-500 text-slate-950 shadow-glow'
              : 'text-slate-300 hover:text-white hover:bg-slate-800'
          }`}
        >
          <Calendar className="w-4 h-4" />
          Upcoming
        </button>

        <button
          onClick={() => handleTabChange('custom')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition-all ${
            activeTab === 'custom'
              ? 'bg-amber-500 text-slate-950 shadow-glow'
              : 'text-slate-300 hover:text-white hover:bg-slate-800'
          }`}
        >
          <Filter className="w-4 h-4" />
          Custom Filters
        </button>
      </div>

      {/* Quick Genre Pills Bar across all 19 TMDB genres */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 -mt-2">
        <button
          onClick={() => {
            setSelectedGenre('');
            if (activeTab === 'custom') setPage(1);
          }}
          className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
            !selectedGenre
              ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
              : 'bg-card border border-border text-slate-400 hover:text-white'
          }`}
        >
          All Genres
        </button>
        {ALL_TMDB_GENRES.map((g) => {
          const isSelected = selectedGenre === String(g.id);
          return (
            <button
              key={g.id}
              onClick={() => {
                setSelectedGenre(isSelected ? '' : String(g.id));
                setActiveTab('custom');
                setPage(1);
              }}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
                isSelected
                  ? 'bg-amber-500 text-slate-950 font-bold shadow-glow'
                  : 'bg-card border border-border/80 text-slate-300 hover:text-white hover:border-slate-600'
              }`}
            >
              <span>{g.emoji}</span>
              <span>{g.name}</span>
            </button>
          );
        })}
      </div>

      {/* Custom Filters Drawer (Active when in 'custom' mode or always as refinement) */}
      {activeTab === 'custom' && (
        <div className="bg-[#12161f] border border-border rounded-2xl p-4 sm:p-6 grid grid-cols-1 sm:grid-cols-3 gap-4 animate-in fade-in">
          {/* Genre select */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold uppercase text-slate-300">Genre</label>
            <select
              value={selectedGenre}
              onChange={(e) => {
                setSelectedGenre(e.target.value);
                setPage(1);
              }}
              className="w-full bg-[#181f2c] border border-border rounded-xl px-3 py-2 text-sm text-slate-100 focus:outline-none focus:border-amber-500"
            >
              <option value="">All Genres</option>
              {genresData?.genres?.map((g) => (
                <option key={g.id} value={g.id}>
                  {g.name}
                </option>
              ))}
            </select>
          </div>

          {/* Release Year */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold uppercase text-slate-300">Release Year</label>
            <select
              value={selectedYear || ''}
              onChange={(e) => {
                setSelectedYear(e.target.value ? Number(e.target.value) : undefined);
                setPage(1);
              }}
              className="w-full bg-[#181f2c] border border-border rounded-xl px-3 py-2 text-sm text-slate-100 focus:outline-none focus:border-amber-500"
            >
              <option value="">All Release Years</option>
              {yearOptions.map((year) => (
                <option key={year} value={year}>
                  {year}
                </option>
              ))}
            </select>
          </div>

          {/* Sort By */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold uppercase text-slate-300">Sort By</label>
            <select
              value={sortBy}
              onChange={(e) => {
                setSortBy(e.target.value);
                setPage(1);
              }}
              className="w-full bg-[#181f2c] border border-border rounded-xl px-3 py-2 text-sm text-slate-100 focus:outline-none focus:border-amber-500"
            >
              <option value="popularity.desc">Most Popular</option>
              <option value="vote_average.desc">Highest Rated</option>
              <option value="primary_release_date.desc">Newest First</option>
              <option value="primary_release_date.asc">Oldest First</option>
            </select>
          </div>
        </div>
      )}

      {/* Movies Grid */}
      <MovieGrid
        movies={data?.results || []}
        isLoading={isLoading}
        emptyMessage="No movies match the selected discovery criteria. Try switching categories or clearing genre filters."
      />

      {/* Pagination Controls */}
      {data && data.total_pages > 1 && (
        <div className="flex items-center justify-center gap-3 pt-6 border-t border-border/80">
          <Button
            variant="secondary"
            size="sm"
            onClick={() => handlePageChange(page - 1)}
            disabled={page <= 1 || isLoading}
          >
            <ChevronLeft className="w-4 h-4" />
            Previous
          </Button>

          <span className="text-sm font-semibold text-slate-300 px-3">
            Page {page} of {Math.min(data.total_pages, 500)}
          </span>

          <Button
            variant="secondary"
            size="sm"
            onClick={() => handlePageChange(page + 1)}
            disabled={page >= data.total_pages || isLoading}
          >
            Next
            <ChevronRight className="w-4 h-4" />
          </Button>
        </div>
      )}
    </div>
  );
};

