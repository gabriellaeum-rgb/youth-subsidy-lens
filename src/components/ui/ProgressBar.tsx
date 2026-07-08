export function ProgressBar({ step, total = 8 }: { step: number; total?: number }) {
  return (
    <div className="flex flex-col gap-1">
      <div className="flex justify-end">
        <span className="text-small text-ink-500 font-mono">{`${step} / ${total}`}</span>
      </div>
      <div
        role="progressbar"
        aria-valuenow={step}
        aria-valuemin={1}
        aria-valuemax={total}
        aria-label={`${total}단계 중 ${step}단계`}
        className="h-1 w-full bg-ink-100 rounded-pill overflow-hidden"
      >
        <div
          className="h-full bg-primary rounded-pill transition-[width] duration-normal ease-out"
          style={{ width: `${(step / total) * 100}%` }}
        />
      </div>
    </div>
  );
}
