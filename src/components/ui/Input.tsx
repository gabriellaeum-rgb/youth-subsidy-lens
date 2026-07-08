'use client';

import * as React from 'react';
import { cn } from '@/lib/utils';

export type InputFieldProps = {
  id: string;
  label: string;
  /** Visually hide the label (still in the DOM, associated via htmlFor) — use when a
   * surrounding heading already shows the same question text, to avoid duplication. */
  hideLabel?: boolean;
  hint?: string;
  error?: string;
  unit?: string;
  containerClassName?: string;
} & React.InputHTMLAttributes<HTMLInputElement>;

export const InputField = React.forwardRef<HTMLInputElement, InputFieldProps>(function InputField(
  { id, label, hideLabel, hint, error, unit, containerClassName, className, ...props },
  ref,
) {
  const hasError = Boolean(error);
  const describedBy = hasError ? `${id}-error` : hint ? `${id}-hint` : undefined;

  return (
    <div className={cn('flex flex-col gap-1', containerClassName)}>
      <label htmlFor={id} className={cn('font-semibold text-body text-ink-900', hideLabel && 'sr-only')}>
        {label}
      </label>
      {hint && !hasError && (
        <p id={`${id}-hint`} className="text-small text-ink-500">
          {hint}
        </p>
      )}
      <div className="relative">
        <input
          ref={ref}
          id={id}
          aria-invalid={hasError || undefined}
          aria-describedby={describedBy}
          className={cn(
            'w-full min-h-[48px] rounded-md border px-4 text-body bg-bg text-ink-900',
            'focus:outline-none focus:border-primary focus:shadow-focus',
            hasError ? 'border-danger' : 'border-ink-300',
            unit && 'pr-12',
            'disabled:bg-bg-inset disabled:text-ink-500 disabled:cursor-not-allowed',
            className,
          )}
          {...props}
        />
        {unit && (
          <span aria-hidden className="absolute right-4 top-1/2 -translate-y-1/2 text-small text-ink-500">
            {unit}
          </span>
        )}
      </div>
      {hasError && (
        <p id={`${id}-error`} role="alert" className="text-small text-danger">
          {error}
        </p>
      )}
    </div>
  );
});
