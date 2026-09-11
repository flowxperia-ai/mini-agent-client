import { cn } from '../../utils/cn.js';

export function ProgressBar({ value = 0, indeterminate = false, tone = 'brand', size = 'md', className, label }) {
  const tones = { brand: 'bg-brand-600', green: 'bg-emerald-500', amber: 'bg-amber-500', red: 'bg-rose-500' };
  return (
    <div
      className={cn('relative w-full overflow-hidden rounded-full bg-slate-100', size === 'sm' ? 'h-1.5' : 'h-2.5', className)}
      role="progressbar"
      aria-label={label}
      aria-valuemin={0}
      aria-valuemax={100}
      aria-valuenow={indeterminate ? undefined : Math.round(value)}
    >
      {indeterminate ? (
        <div className={cn('absolute inset-y-0 w-1/3 animate-[indeterminate_1.4s_ease-in-out_infinite] rounded-full', tones[tone])} />
      ) : (
        <div
          className={cn('h-full rounded-full transition-[width] duration-700 ease-out', tones[tone])}
          style={{ width: `${Math.min(100, Math.max(0, value))}%` }}
        />
      )}
      <style>{'@keyframes indeterminate{0%{left:-35%}100%{left:100%}}'}</style>
    </div>
  );
}
