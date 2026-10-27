import React, { useState } from 'react';
import { MoodType } from '../../types/movie';
import { Film, Sparkles, SlidersHorizontal, Check } from 'lucide-react';

export interface GenreItem {
  id: number;
  name: string;
  emoji: string;
  description: string;
}

export const ALL_TMDB_GENRES: GenreItem[] = [
  { id: 28, name: 'Action', emoji: '💥', description: 'High-octane fights & stunts' },
  { id: 12, name: 'Adventure', emoji: '🗺️', description: 'Epic quests & explorations' },
  { id: 16, name: 'Animation', emoji: '🎨', description: 'Animated worlds & artistry' },
  { id: 35, name: 'Comedy', emoji: '😂', description: 'Hilarious laughs & fun' },
  { id: 80, name: 'Crime', emoji: '🕵️', description: 'Underworld, heists & noir' },
  { id: 99, name: 'Documentary', emoji: '📽️', description: 'Real-world insight & truth' },
  { id: 18, name: 'Drama', emoji: '🎭', description: 'Deep human emotions & stories' },
  { id: 10751, name: 'Family', emoji: '👨‍👩‍👧‍👦', description: 'Wholesome for all ages' },
  { id: 14, name: 'Fantasy', emoji: '🧙‍♂️', description: 'Magic, myths & wondrous realms' },
  { id: 36, name: 'History', emoji: '🏛️', description: 'Historic events & period pieces' },
  { id: 27, name: 'Horror', emoji: '😱', description: 'Chills, scares & monsters' },
  { id: 10402, name: 'Music', emoji: '🎵', description: 'Melody, rhythm & musicals' },
  { id: 9648, name: 'Mystery', emoji: '🔍', description: 'Puzzles, crimes & whodunits' },
  { id: 10749, name: 'Romance', emoji: '❤️', description: 'Love, passion & soulmates' },
  { id: 878, name: 'Science Fiction', emoji: '🚀', description: 'Futuristic sci-fi & technology' },
  { id: 10770, name: 'TV Movie', emoji: '📺', description: 'Feature broadcasts & specials' },
  { id: 53, name: 'Thriller', emoji: '⚡', description: 'Tension, adrenaline & twists' },
  { id: 10752, name: 'War', emoji: '🪖', description: 'Heroism, battles & strategy' },
  { id: 37, name: 'Western', emoji: '🤠', description: 'Outlaws, sheriffs & the frontier' },
];

export interface MoodOptionItem {
  id: MoodType;
  emoji: string;
  label: string;
  description: string;
  mappedGenreNames: string;
}

export const MOODS: MoodOptionItem[] = [
  { id: 'scary', emoji: '😱', label: 'Scary', description: 'Horror & thrillers', mappedGenreNames: 'Horror, Thriller, Mystery' },
  { id: 'funny', emoji: '😂', label: 'Funny', description: 'Comedies & feel-good laughs', mappedGenreNames: 'Comedy, Animation' },
  { id: 'smart', emoji: '🧠', label: 'Smart', description: 'Mind-benders & mystery', mappedGenreNames: 'Sci-Fi, Mystery, Documentary, Drama' },
  { id: 'emotional', emoji: '😭', label: 'Emotional', description: 'Heartfelt moving stories', mappedGenreNames: 'Drama, Romance' },
  { id: 'romantic', emoji: '❤️', label: 'Romantic', description: 'Love stories & rom-coms', mappedGenreNames: 'Romance, Comedy' },
  { id: 'exciting', emoji: '🔥', label: 'Exciting', description: 'Action & adrenaline', mappedGenreNames: 'Action, Adventure, Sci-Fi' },
];

interface MoodSelectorProps {
  selectedMoods: MoodType[];
  selectedGenres: number[];
  onMoodsChange: (moods: MoodType[]) => void;
  onGenresChange: (genreIds: number[]) => void;
}

export const MoodSelector: React.FC<MoodSelectorProps> = ({
  selectedMoods,
  selectedGenres,
  onMoodsChange,
  onGenresChange,
}) => {
  const [viewMode, setViewMode] = useState<'all-genres' | 'quick-moods'>('all-genres');

  const toggleMood = (id: MoodType) => {
    if (selectedMoods.includes(id)) {
      onMoodsChange(selectedMoods.filter((m) => m !== id));
    } else {
      onMoodsChange([...selectedMoods, id]);
    }
  };

  const toggleGenre = (genreId: number) => {
    if (selectedGenres.includes(genreId)) {
      onGenresChange(selectedGenres.filter((id) => id !== genreId));
    } else {
      onGenresChange([...selectedGenres, genreId]);
    }
  };

  const totalSelectedCount = selectedMoods.length + selectedGenres.length;

  const handleClearAll = () => {
    onMoodsChange([]);
    onGenresChange([]);
  };

  return (
    <div className="space-y-4">
      {/* Header and Toggle Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-border/60 pb-3">
        <div className="flex items-center gap-2">
          <label className="text-sm font-semibold text-slate-200 uppercase tracking-wider flex items-center gap-2">
            <span>1. Choose Genres & Moods</span>
            {totalSelectedCount > 0 && (
              <span className="text-xs font-bold text-amber-400 bg-amber-500/10 border border-amber-500/30 px-2 py-0.5 rounded-full lowercase">
                {totalSelectedCount} selected
              </span>
            )}
          </label>
        </div>

        <div className="flex items-center gap-2">
          {/* Mode Switcher */}
          <div className="inline-flex p-1 rounded-xl bg-slate-900 border border-border">
            <button
              type="button"
              onClick={() => setViewMode('all-genres')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                viewMode === 'all-genres'
                  ? 'bg-amber-500 text-slate-950 shadow-glow'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Film className="w-3.5 h-3.5" />
              All 19 Genres
            </button>
            <button
              type="button"
              onClick={() => setViewMode('quick-moods')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                viewMode === 'quick-moods'
                  ? 'bg-amber-500 text-slate-950 shadow-glow'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Sparkles className="w-3.5 h-3.5" />
              Quick Mood Vibes
            </button>
          </div>

          {totalSelectedCount > 0 && (
            <button
              type="button"
              onClick={handleClearAll}
              className="text-xs text-slate-400 hover:text-rose-400 transition-colors px-2 py-1"
            >
              Clear all
            </button>
          )}
        </div>
      </div>

      {/* ALL 19 TMDB GENRES GRID */}
      {viewMode === 'all-genres' && (
        <div className="space-y-3">
          <p className="text-xs text-slate-400">
            Select one or multiple TMDB genres to customize your movie recommendations:
          </p>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-2.5">
            {ALL_TMDB_GENRES.map((genre) => {
              const isSelected = selectedGenres.includes(genre.id);
              return (
                <button
                  key={genre.id}
                  type="button"
                  onClick={() => toggleGenre(genre.id)}
                  className={`flex items-center gap-2.5 p-3 rounded-2xl border transition-all duration-200 text-left relative group ${
                    isSelected
                      ? 'bg-amber-500/20 border-amber-500 shadow-glow text-white scale-[1.01]'
                      : 'bg-card/90 border-border/80 hover:border-slate-600 text-slate-300 hover:bg-slate-800/60'
                  }`}
                >
                  <span className="text-xl sm:text-2xl filter drop-shadow flex-shrink-0">
                    {genre.emoji}
                  </span>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-xs sm:text-sm tracking-wide truncate">
                        {genre.name}
                      </span>
                      {isSelected && (
                        <span className="w-4 h-4 rounded-full bg-amber-500 text-slate-950 flex items-center justify-center flex-shrink-0 ml-1">
                          <Check className="w-2.5 h-2.5 stroke-[3]" />
                        </span>
                      )}
                    </div>
                    <span className="text-[10px] text-slate-400 line-clamp-1 block">
                      {genre.description}
                    </span>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* QUICK MOOD VIBES GRID */}
      {viewMode === 'quick-moods' && (
        <div className="space-y-3">
          <p className="text-xs text-slate-400">
            Or pick from our quick human mood combos:
          </p>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
            {MOODS.map((mood) => {
              const isSelected = selectedMoods.includes(mood.id);
              return (
                <button
                  key={mood.id}
                  type="button"
                  onClick={() => toggleMood(mood.id)}
                  className={`flex flex-col items-center justify-center p-3.5 rounded-2xl border transition-all duration-200 text-center relative ${
                    isSelected
                      ? 'bg-amber-500/15 border-amber-500 shadow-glow text-white scale-[1.02]'
                      : 'bg-card border-border/70 hover:border-slate-600 text-slate-300 hover:bg-slate-800/40'
                  }`}
                >
                  <span className="text-2xl sm:text-3xl mb-1.5 filter drop-shadow">{mood.emoji}</span>
                  <span className="font-bold text-sm tracking-wide">{mood.label}</span>
                  <span className="text-[11px] text-slate-400 mt-0.5 line-clamp-1">{mood.description}</span>
                  <span className="text-[9px] text-amber-500/80 mt-1 uppercase font-semibold">
                    {mood.mappedGenreNames}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};
