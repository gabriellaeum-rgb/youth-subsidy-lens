import { cn } from '@/lib/utils';

export function Skeleton({ className }: { className?: string }) {
  return <div aria-hidden className={cn('animate-pulse rounded-sm bg-ink-100', className)} />;
}

export function ResultCardSkeleton() {
  return (
    <div className="rounded-card border border-ink-100 bg-bg p-5 shadow-card flex flex-col gap-4">
      <Skeleton className="h-6 w-2/5" />
      <Skeleton className="h-8 w-3/5" />
      <div className="flex flex-col gap-2">
        <Skeleton className="h-3.5 w-full" />
        <Skeleton className="h-3.5 w-[90%]" />
      </div>
      <Skeleton className="h-12 w-full" />
    </div>
  );
}
