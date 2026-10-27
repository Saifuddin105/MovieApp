import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { moviesApi } from '../api/movies';
import { MovieGrid } from '../components/movies/MovieGrid';
import { Button } from '../components/ui/Button';
import { Search, X, ChevronLeft, ChevronRight, Sparkles } from 'lucide-react';

export const SearchPage: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const initialQuery = searchParams.get('q') || '';
  const initialPage = Number(searchParams.get('page')) || 1;

  const [queryInput, setQueryInput] = useState(initialQuery);
  const [debouncedQuery, setDebouncedQuery] = useState(initialQuery);
  const [page, setPage] = useState(initialPage);

  // Debounce query input by 400ms
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedQuery(queryInput.trim());
      setPage(1);
      if (queryInput.trim()) {
        setSearchParams({ q: queryInput.trim(), page: '1' });
      } else {
        setSearchParams({});
      }
    }, 400);

    return () => clearTimeout(handler);
  }, [queryInput, setSearchParams]);

  // Sync if URL query changes externally
  useEffect(() => {
    const q = searchParams.get('q') || '';
    if (q !== queryInput) {
      setQueryInput(q);
      setDebouncedQuery(q);
    }
  }, [searchParams]);

  const { data, isLoading, isError, error } = useQuery({
    queryKey: ['searchMovies', debouncedQuery, page],
    queryFn: () => moviesApi.search(debouncedQuery, page),
    enabled: debouncedQuery.length > 0,
    staleTime: 2 * 60 * 1000,
  });

  const handleClear = () => {
    setQueryInput('');
    setDebouncedQuery('');
    setSearchParams({});
  };

  const handlePageChange = (newPage: number) => {
    setPage(newPage);
    setSearchParams({ q: debouncedQuery, page: String(newPage) });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Search Header */}
      <div className="max-w-2xl mx-auto text-center space-y-4">
        <h1 className="text-3xl sm:text-4xl font-black text-slate-100">Search TMDB Movies</h1>
        <p className="text-sm text-slate-400">
          Find any movie title instantly with real-time results from The Movie Database.
        </p>

        {/* Input Bar */}
        <div className="relative flex items-center">
          <Search className="absolute left-4 w-5 h-5 text-slate-400 pointer-events-none" />
          <input
            type="text"
            value={queryInput}
            onChange={(e) => setQueryInput(e.target.value)}
            placeholder="Type a movie title (e.g. Inception, Barbie, Interstellar)..."
            className="w-full bg-[#12161f] border border-border focus:border-amber-500 rounded-2xl pl-12 pr-12 py-3.5 text-base text-slate-100 placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-amber-500/30 transition-all shadow-xl"
            autoFocus
          />
          {queryInput && (
            <button
              onClick={handleClear}
              className="absolute right-4 p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
              aria-label="Clear search"
            >
              <X className="w-5 h-5" />
            </button>
          )}
        </div>
      </div>

      {/* Results Header */}
      {debouncedQuery && (
        <div className="border-b border-border/80 pb-3 flex items-center justify-between text-sm text-slate-400">
          <span>
            {isLoading ? (
              'Searching TMDB...'
            ) : data ? (
              <>
                Found <strong className="text-slate-100">{data.total_results.toLocaleString()}</strong> results for &ldquo;{debouncedQuery}&rdquo;
              </>
            ) : null}
          </span>
        </div>
      )}

      {/* Grid or Empty/Prompt State */}
      {!debouncedQuery ? (
        <div className="text-center py-20 px-4 space-y-3 rounded-3xl border border-dashed border-border/70 bg-card/20">
          <Sparkles className="w-10 h-10 text-amber-500/60 mx-auto" />
          <h3 className="text-lg font-bold text-slate-300">Ready to Discover</h3>
          <p className="text-sm text-slate-400 max-w-sm mx-auto">
            Start typing above to search across hundreds of thousands of official TMDB movie records.
          </p>
        </div>
      ) : (
        <MovieGrid
          movies={data?.results || []}
          isLoading={isLoading}
          emptyMessage={`No movies found matching "${debouncedQuery}". Try another spelling or title!`}
        />
      )}

      {/* Pagination */}
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

