import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '../components/ui/Button';
import { Film, Home, Compass } from 'lucide-react';

export const NotFoundPage: React.FC = () => {
  return (
    <div className="min-h-[70vh] flex flex-col items-center justify-center px-4 text-center space-y-6">
      <div className="w-20 h-20 rounded-3xl bg-amber-500/10 text-amber-400 border border-amber-500/20 flex items-center justify-center shadow-glow">
        <Film className="w-10 h-10" />
      </div>
      <div className="space-y-2">
        <h1 className="text-5xl font-black text-slate-100">404</h1>
        <h2 className="text-xl font-bold text-slate-200">Scene Not Found</h2>
        <p className="text-sm text-slate-400 max-w-sm mx-auto">
          The page or movie reel you are searching for does not exist in our cinema catalog.
        </p>
      </div>

      <div className="flex items-center gap-3 pt-2">
        <Link to="/">
          <Button variant="primary">
            <Home className="w-4 h-4 mr-1.5" />
            Return Home
          </Button>
        </Link>
        <Link to="/discover">
          <Button variant="secondary">
            <Compass className="w-4 h-4 mr-1.5 text-amber-400" />
            Discover Movies
          </Button>
        </Link>
      </div>
    </div>
  );
};

