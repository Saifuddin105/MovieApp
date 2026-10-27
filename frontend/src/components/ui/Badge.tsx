import React from 'react';
import { cn } from '../../utils/cn';

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: 'amber' | 'coral' | 'muted' | 'outline' | 'success';
}

export const Badge: React.FC<BadgeProps> = ({
  className,
  variant = 'amber',
  children,
  ...props
}) => {
  const variants = {
    amber: 'bg-amber-500/15 text-amber-300 border border-amber-500/30',
    coral: 'bg-rose-500/15 text-rose-300 border border-rose-500/30',
    muted: 'bg-slate-800/80 text-slate-300 border border-slate-700/60',
    outline: 'border border-border text-slate-300',
    success: 'bg-emerald-500/15 text-emerald-300 border border-emerald-500/30',
  };

  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium tracking-wide',
        variants[variant],
        className,
      )}
      {...props}
    >
      {children}
    </span>
  );
};

