'use client';

import * as React from 'react';
import { Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

export type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: 'primary' | 'secondary' | 'ghost' | 'link';
  size?: 'md' | 'lg';
  fullWidth?: boolean;
  loading?: boolean;
  iconLeft?: React.ReactNode;
  iconRight?: React.ReactNode;
};

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(function Button(
  {
    variant = 'primary',
    size = 'md',
    fullWidth,
    loading,
    disabled,
    iconLeft,
    iconRight,
    className,
    children,
    type = 'button',
    ...props
  },
  ref,
) {
  return (
    <button
      ref={ref}
      type={type}
      aria-busy={loading || undefined}
      disabled={disabled || loading}
      className={cn(
        'inline-flex items-center justify-center gap-2 rounded-md font-semibold transition-colors duration-fast',
        'focus-visible:outline-none focus-visible:shadow-focus',
        fullWidth && 'w-full',
        size === 'lg' ? 'min-h-[56px] px-5 text-body' : 'min-h-[48px] px-4 text-body',
        variant === 'primary' && [
          'bg-primary text-primary-ink',
          'hover:bg-primary-hover active:bg-primary-pressed',
          'disabled:bg-ink-300 disabled:text-bg disabled:cursor-not-allowed',
        ],
        variant === 'secondary' && [
          'bg-bg text-ink-900 border border-ink-300',
          'hover:bg-bg-subtle active:bg-bg-inset',
          'disabled:bg-bg-inset disabled:text-ink-500 disabled:border-ink-100 disabled:cursor-not-allowed',
        ],
        variant === 'ghost' && [
          'bg-transparent text-ink-700',
          'hover:bg-bg-inset active:bg-ink-100',
          'disabled:text-ink-300 disabled:cursor-not-allowed',
        ],
        variant === 'link' && [
          'bg-transparent text-primary underline-offset-4 min-h-0 px-0',
          'hover:underline active:text-primary-pressed',
          'disabled:text-ink-300 disabled:no-underline disabled:cursor-not-allowed',
        ],
        className,
      )}
      {...props}
    >
      {loading ? <Loader2 size={16} className="animate-spin" aria-hidden /> : iconLeft}
      <span>{children}</span>
      {!loading && iconRight}
    </button>
  );
});
