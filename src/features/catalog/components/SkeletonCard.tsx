export function SkeletonCard() {
  return (
    <div
      className="flex flex-col justify-between rounded-xl border border-[var(--color-border-subtle)] bg-[var(--color-bg-surface)] p-2.5 shadow-xs sm:p-3.5"
      aria-hidden="true"
    >
      <div>
        <div className="aspect-square w-full animate-pulse rounded-lg bg-blue-100/70" />
        <div className="mt-2.5 flex items-center justify-between gap-2">
          <div className="h-4 w-20 animate-pulse rounded-full bg-blue-100" />
          <div className="h-4 w-12 animate-pulse rounded bg-slate-100" />
        </div>
        <div className="mt-2 h-3 w-16 animate-pulse rounded bg-slate-200" />
        <div className="mt-1.5 h-4 w-full animate-pulse rounded bg-slate-200" />
        <div className="mt-1 h-4 w-3/4 animate-pulse rounded bg-slate-200" />
      </div>

      <div className="mt-3 pt-2 border-t border-slate-100">
        <div className="h-3 w-14 animate-pulse rounded bg-slate-100" />
        <div className="mt-1 h-6 w-24 animate-pulse rounded bg-blue-100" />
        <div className="mt-2.5 h-11 w-full animate-pulse rounded-lg bg-blue-100/80" />
      </div>
    </div>
  );
}
