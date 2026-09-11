import { AlertTriangle, Inbox, Loader2, RefreshCw, WifiOff } from 'lucide-react';
import { cn } from '../../utils/cn.js';
import { Button } from './Button.jsx';

export function Spinner({ className }) {
  return <Loader2 className={cn('size-5 animate-spin text-brand-600', className)} />;
}

export function LoadingState({ label = 'Loading…', className, compact = false }) {
  return (
    <div className={cn('flex flex-col items-center justify-center gap-3 text-sm text-slate-500', compact ? 'py-8' : 'py-20', className)} role="status">
      <Spinner />
      <span>{label}</span>
    </div>
  );
}

export function Skeleton({ className }) {
  return <div className={cn('skeleton', className)} />;
}

export function EmptyState({ icon: Icon = Inbox, title, description, action, className }) {
  return (
    <div className={cn('flex flex-col items-center justify-center rounded-2xl border border-dashed border-slate-300 bg-white/60 px-6 py-14 text-center', className)}>
      <span className="grid size-12 place-items-center rounded-2xl bg-brand-50 text-brand-600 ring-8 ring-brand-50/50">
        <Icon className="size-6" />
      </span>
      <h3 className="mt-5 text-base font-semibold text-slate-900">{title}</h3>
      {description && <p className="mt-1.5 max-w-sm text-sm text-slate-500">{description}</p>}
      {action && <div className="mt-6">{action}</div>}
    </div>
  );
}

export function ErrorState({ error, title, onRetry, className }) {
  const offline = error?.code === 'NETWORK_ERROR' || error?.code === 'TIMEOUT';
  const Icon = offline ? WifiOff : AlertTriangle;
  return (
    <div className={cn('flex flex-col items-center justify-center rounded-2xl border border-rose-100 bg-rose-50/40 px-6 py-12 text-center', className)} role="alert">
      <span className="grid size-12 place-items-center rounded-2xl bg-rose-100 text-rose-600">
        <Icon className="size-6" />
      </span>
      <h3 className="mt-4 text-base font-semibold text-slate-900">{title ?? (offline ? 'You appear to be offline' : 'Something went wrong')}</h3>
      <p className="mt-1 max-w-md text-sm text-slate-600">{error?.message ?? 'Please try again.'}</p>
      {onRetry && (
        <Button variant="secondary" size="sm" icon={RefreshCw} className="mt-5" onClick={() => onRetry()}>
          Try again
        </Button>
      )}
    </div>
  );
}

export function InlineAlert({ tone = 'info', title, children, icon: Icon, action, className }) {
  const tones = {
    info: 'bg-sky-50 text-sky-900 ring-sky-200',
    warning: 'bg-amber-50 text-amber-900 ring-amber-200',
    danger: 'bg-rose-50 text-rose-900 ring-rose-200',
    success: 'bg-emerald-50 text-emerald-900 ring-emerald-200',
    brand: 'bg-brand-50 text-brand-950 ring-brand-200',
  };
  return (
    <div className={cn('flex gap-3 rounded-xl px-4 py-3 text-sm ring-1 ring-inset', tones[tone], className)} role={tone === 'danger' ? 'alert' : 'status'}>
      {Icon && <Icon className="mt-0.5 size-4 shrink-0" />}
      <div className="min-w-0 flex-1">
        {title && <p className="font-semibold">{title}</p>}
        {children && <div className={cn(title && 'mt-0.5', 'opacity-90')}>{children}</div>}
      </div>
      {action && <div className="shrink-0 self-center">{action}</div>}
    </div>
  );
}
