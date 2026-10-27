import React from 'react';
import { cn } from '../../utils/cn';

export const Skeleton: React.FC<React.HTMLAttributes<HTMLDivElement>> = ({
  className,
  ...props
}) => {
  return (
    <div
      className={cn('animate-pulse rounded-xl bg-slate-800/60', className)}
      {...props}
    />
  );
};

export const MovieCardSkeleton: React.FC = () => {
  return (
    <div className="flex flex-col rounded-2xl bg-card border border-border/60 overflow-hidden shadow-lg animate-pulse">
      <div className="aspect-[2/3] w-full bg-slate-800" />
      <div className="p-4 space-y-2.5">
        <div className="h-4 bg-slate-700/80 rounded w-3/4" />
        <div className="flex items-center justify-between">
          <div className="h-3 bg-slate-700/50 rounded w-1/4" />
          <div className="h-3 bg-slate-700/50 rounded w-1/4" />
        </div>
      </div>
    </div>
  );
};

