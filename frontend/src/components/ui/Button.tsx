import React from 'react';
import { cn } from '../../utils/cn';
import { Loader2 } from 'lucide-react';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'coral' | 'secondary' | 'outline' | 'ghost' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  isLoading?: boolean;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      className,
      variant = 'primary',
      size = 'md',
      isLoading = false,
      disabled,
      children,
      ...props
    },
    ref,
  ) => {
    const baseStyles =
      'inline-flex items-center justify-center font-medium rounded-xl transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-500/50 disabled:opacity-50 disabled:cursor-not-allowed active:scale-[0.98]';

    const variants = {
      primary:
        'bg-primary text-slate-950 hover:bg-primary-hover font-semibold shadow-glow hover:shadow-amber-500/40',
      coral:
        'bg-coral text-white hover:bg-coral-hover font-semibold shadow-glow-coral',
      secondary:
        'bg-[#19202e] text-slate-200 hover:bg-[#232c3f] border border-border/80',
      outline:
        'border border-border text-slate-200 hover:bg-white/5 hover:border-slate-500',
      ghost:
        'text-slate-300 hover:text-white hover:bg-white/5',
      danger:
        'bg-red-500/10 text-red-400 border border-red-500/20 hover:bg-red-500/20',
    };

    const sizes = {
      sm: 'text-xs px-3 py-1.5 gap-1.5',
      md: 'text-sm px-4 py-2.5 gap-2',
      lg: 'text-base px-6 py-3.5 gap-2.5 font-semibold',
    };

    return (
      <button
        ref={ref}
        disabled={disabled || isLoading}
        className={cn(baseStyles, variants[variant], sizes[size], className)}
        {...props}
      >
        {isLoading && <Loader2 className="w-4 h-4 animate-spin text-current" />}
        {children}
      </button>
    );
  },
);

Button.displayName = 'Button';

