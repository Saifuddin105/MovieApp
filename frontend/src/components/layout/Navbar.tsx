import React, { useState } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import {
  Film,
  Compass,
  Search,
  Bookmark,
  CheckCircle,
  User as UserIcon,
  LogOut,
  Menu,
  X,
  Sparkles,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { Button } from '../ui/Button';

export const Navbar: React.FC = () => {
  const { user, isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
      setSearchQuery('');
      setMobileMenuOpen(false);
    }
  };

  const navLinkClass = ({ isActive }: { isActive: boolean }) =>
    `inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
      isActive
        ? 'text-amber-400 bg-amber-500/10'
        : 'text-slate-300 hover:text-white hover:bg-white/5'
    }`;

  return (
    <header className="sticky top-0 z-40 w-full border-b border-border/80 bg-background/90 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
        {/* Brand Logo */}
        <Link to="/" className="flex items-center gap-2.5 group">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-amber-500 to-rose-500 flex items-center justify-center text-slate-950 font-bold shadow-glow group-hover:scale-105 transition-transform">
            <Film className="w-5 h-5 text-slate-950" />
          </div>
          <div className="flex flex-col">
            <span className="font-extrabold text-base tracking-tight text-slate-100 group-hover:text-amber-400 transition-colors">
              What Should I Watch?
            </span>
            <span className="text-[10px] text-amber-500/90 font-semibold tracking-wider uppercase -mt-1">
              Tonight
            </span>
          </div>
        </Link>

        {/* Desktop Navigation Links */}
        <nav className="hidden md:flex items-center space-x-1 lg:space-x-2">
          <NavLink to="/" className={navLinkClass} end>
            <Sparkles className="w-4 h-4 text-amber-400" />
            Home
          </NavLink>
          <NavLink to="/discover" className={navLinkClass}>
            <Compass className="w-4 h-4" />
            Discover
          </NavLink>
          <NavLink to="/search" className={navLinkClass}>
            <Search className="w-4 h-4" />
            Search
          </NavLink>
          {isAuthenticated && (
            <>
              <NavLink to="/watchlist" className={navLinkClass}>
                <Bookmark className="w-4 h-4" />
                Watchlist
              </NavLink>
              <NavLink to="/watched" className={navLinkClass}>
                <CheckCircle className="w-4 h-4" />
                Watched
              </NavLink>
            </>
          )}
        </nav>

        {/* Search Input Bar (Desktop) */}
        <form onSubmit={handleSearchSubmit} className="hidden lg:flex items-center flex-1 max-w-xs relative mx-2">
          <Search className="absolute left-3 w-4 h-4 text-slate-400 pointer-events-none" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Quick search movies..."
            className="w-full bg-[#12161f] border border-border rounded-xl pl-9 pr-3 py-1.5 text-xs text-slate-100 placeholder:text-slate-500 focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500/40"
          />
        </form>

        {/* User Auth Buttons / Profile Avatar */}
        <div className="hidden md:flex items-center gap-3">
          {isAuthenticated && user ? (
            <div className="relative">
              <button
                onClick={() => setProfileDropdownOpen(!profileDropdownOpen)}
                className="flex items-center gap-2.5 p-1.5 rounded-xl hover:bg-slate-800/80 transition-colors border border-transparent hover:border-border"
                aria-label="User menu"
              >
                <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-amber-500 to-rose-500 text-slate-950 font-bold text-xs flex items-center justify-center">
                  {user.name.charAt(0).toUpperCase()}
                </div>
                <span className="text-sm font-medium text-slate-200 max-w-[120px] truncate">
                  {user.name}
                </span>
              </button>

              {profileDropdownOpen && (
                <div
                  className="absolute right-0 mt-2 w-52 bg-[#12161f] border border-border rounded-2xl shadow-xl py-2 z-50 animate-in fade-in slide-in-from-top-2"
                  onMouseLeave={() => setProfileDropdownOpen(false)}
                >
                  <div className="px-4 py-2 border-b border-border/60">
                    <p className="text-xs text-slate-400">Signed in as</p>
                    <p className="text-sm font-semibold text-slate-100 truncate">{user.email}</p>
                  </div>
                  <Link
                    to="/profile"
                    onClick={() => setProfileDropdownOpen(false)}
                    className="flex items-center gap-2 px-4 py-2 text-sm text-slate-300 hover:text-white hover:bg-slate-800/60"
                  >
                    <UserIcon className="w-4 h-4 text-amber-400" />
                    My Profile
                  </Link>
                  <Link
                    to="/watchlist"
                    onClick={() => setProfileDropdownOpen(false)}
                    className="flex items-center gap-2 px-4 py-2 text-sm text-slate-300 hover:text-white hover:bg-slate-800/60"
                  >
                    <Bookmark className="w-4 h-4 text-amber-400" />
                    My Watchlist
                  </Link>
                  <Link
                    to="/watched"
                    onClick={() => setProfileDropdownOpen(false)}
                    className="flex items-center gap-2 px-4 py-2 text-sm text-slate-300 hover:text-white hover:bg-slate-800/60"
                  >
                    <CheckCircle className="w-4 h-4 text-emerald-400" />
                    Watched History
                  </Link>
                  <div className="border-t border-border/60 my-1" />
                  <button
                    onClick={() => {
                      setProfileDropdownOpen(false);
                      logout();
                    }}
                    className="w-full flex items-center gap-2 px-4 py-2 text-sm text-rose-400 hover:text-rose-300 hover:bg-rose-500/10 text-left"
                  >
                    <LogOut className="w-4 h-4" />
                    Log Out
                  </button>
                </div>
              )}
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => navigate('/login')}
              >
                Sign In
              </Button>
              <Button
                variant="primary"
                size="sm"
                onClick={() => navigate('/register')}
              >
                Sign Up
              </Button>
            </div>
          )}
        </div>

        {/* Mobile menu button */}
        <div className="md:hidden flex items-center">
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-2 rounded-xl text-slate-300 hover:text-white hover:bg-slate-800"
            aria-label="Toggle menu"
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden border-b border-border bg-[#0e1117] px-4 pt-3 pb-6 space-y-4">
          <form onSubmit={handleSearchSubmit} className="relative">
            <Search className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search movies..."
              className="w-full bg-[#161c28] border border-border rounded-xl pl-9 pr-3 py-2 text-sm text-slate-100 focus:outline-none focus:border-amber-500"
            />
          </form>

          <nav className="flex flex-col space-y-1">
            <Link
              to="/"
              onClick={() => setMobileMenuOpen(false)}
              className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-sm font-medium text-slate-200 hover:bg-slate-800"
            >
              <Sparkles className="w-4 h-4 text-amber-400" />
              Home
            </Link>
            <Link
              to="/discover"
              onClick={() => setMobileMenuOpen(false)}
              className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-sm font-medium text-slate-200 hover:bg-slate-800"
            >
              <Compass className="w-4 h-4 text-amber-400" />
              Discover Movies
            </Link>
            <Link
              to="/search"
              onClick={() => setMobileMenuOpen(false)}
              className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-sm font-medium text-slate-200 hover:bg-slate-800"
            >
              <Search className="w-4 h-4 text-amber-400" />
              Search
            </Link>
            {isAuthenticated ? (
              <>
                <Link
                  to="/watchlist"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-sm font-medium text-slate-200 hover:bg-slate-800"
                >
                  <Bookmark className="w-4 h-4 text-amber-400" />
                  Watchlist
                </Link>
                <Link
                  to="/watched"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-sm font-medium text-slate-200 hover:bg-slate-800"
                >
                  <CheckCircle className="w-4 h-4 text-emerald-400" />
                  Watched History
                </Link>
                <Link
                  to="/profile"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-sm font-medium text-slate-200 hover:bg-slate-800"
                >
                  <UserIcon className="w-4 h-4 text-amber-400" />
                  My Profile
                </Link>
                <button
                  onClick={() => {
                    setMobileMenuOpen(false);
                    logout();
                  }}
                  className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-sm font-medium text-rose-400 hover:bg-rose-500/10 text-left"
                >
                  <LogOut className="w-4 h-4" />
                  Log Out
                </button>
              </>
            ) : (
              <div className="pt-2 flex flex-col gap-2">
                <Button
                  variant="outline"
                  onClick={() => {
                    setMobileMenuOpen(false);
                    navigate('/login');
                  }}
                >
                  Sign In
                </Button>
                <Button
                  variant="primary"
                  onClick={() => {
                    setMobileMenuOpen(false);
                    navigate('/register');
                  }}
                >
                  Create Account
                </Button>
              </div>
            )}
          </nav>
        </div>
      )}
    </header>
  );
};

