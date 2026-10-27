import React from 'react';
import { Film, Heart } from 'lucide-react';
import { Link } from 'react-router-dom';

export const Footer: React.FC = () => {
  return (
    <footer className="w-full border-t border-border/80 bg-[#080a0e] text-slate-400 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-12">
          {/* Brand */}
          <div className="md:col-span-2 space-y-4">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-amber-500 to-rose-500 flex items-center justify-center text-slate-950 font-bold shadow-glow">
                <Film className="w-4 h-4 text-slate-950" />
              </div>
              <span className="font-bold text-lg text-slate-100">
                What Should I Watch Tonight?
              </span>
            </div>
            <p className="text-sm text-slate-400 max-w-md leading-relaxed">
              Never spend 45 minutes scrolling through streaming catalogs again. Pick your mood,
              your available time, or hit Surprise Me to find your next favorite movie in seconds.
            </p>
          </div>

          {/* Quick Links */}
          <div className="space-y-3">
            <h4 className="text-sm font-semibold uppercase tracking-wider text-slate-200">
              Explore
            </h4>
            <ul className="space-y-2 text-sm">
              <li>
                <Link to="/" className="hover:text-amber-400 transition-colors">
                  Mood Matcher
                </Link>
              </li>
              <li>
                <Link to="/discover" className="hover:text-amber-400 transition-colors">
                  Discover Movies
                </Link>
              </li>
              <li>
                <Link to="/search" className="hover:text-amber-400 transition-colors">
                  Search Catalog
                </Link>
              </li>
              <li>
                <Link to="/watchlist" className="hover:text-amber-400 transition-colors">
                  Personal Watchlist
                </Link>
              </li>
            </ul>
          </div>

          {/* TMDB Attribution */}
          <div className="space-y-3">
            <h4 className="text-sm font-semibold uppercase tracking-wider text-slate-200">
              Data Source
            </h4>
            <div className="bg-[#12161f] p-4 rounded-xl border border-border/60 space-y-2">
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-[#01d277] uppercase tracking-wider">
                  TMDB API
                </span>
              </div>
              <p className="text-xs text-slate-400 leading-normal">
                This product uses the TMDB API but is not endorsed or certified by TMDB. All movie
                posters, synopses, and details originate directly from The Movie Database.
              </p>
            </div>
          </div>
        </div>

        <div className="border-t border-border/60 pt-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
          <p>© {new Date().getFullYear()} What Should I Watch Tonight? All rights reserved.</p>
          <div className="flex items-center gap-1 text-slate-400">
            <span>Built with precision & passion</span>
            <Heart className="w-3.5 h-3.5 text-rose-500 fill-rose-500" />
            <span>for film lovers</span>
          </div>
        </div>
      </div>
    </footer>
  );
};

