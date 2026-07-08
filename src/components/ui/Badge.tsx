import { cn } from '@/lib/utils';

type BadgeVariant = 'success' | 'muted' | 'warning' | 'info';

export function Badge({ variant, children }: { variant: BadgeVariant; children: React.ReactNode }) {
  const showDot = variant === 'success' || variant === 'muted';
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 rounded-pill px-2.5 py-0.5 text-caption font-semibold whitespace-nowrap',
        variant === 'success' && 'bg-success-tint text-success',
        variant === 'muted' && 'bg-muted-tint text-muted',
        variant === 'warning' && 'bg-warning-tint text-warning',
        variant === 'info' && 'bg-primary-tint text-primary',
      )}
    >
      {showDot && <span aria-hidden className="h-2 w-2 rounded-full bg-current" />}
      {children}
    </span>
  );
}
