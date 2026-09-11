import { Check, ShieldCheck, Sparkles, UserRound } from 'lucide-react';
import { cn } from '../utils/cn.js';
import { Badge } from './ui/Badge.jsx';

/** Starter / Growth description card. Pricing is credit-based, so the card shows usage rates. */
export function PlanCard({ plan, current = false, highlighted = false, action, className }) {
  if (!plan) return null;
  const growth = plan.id === 'GROWTH';
  const Icon = growth ? Sparkles : UserRound;
  return (
    <div
      className={cn(
        'relative flex flex-col rounded-3xl p-6 ring-1 transition sm:p-7',
        highlighted ? 'bg-slate-950 text-white ring-slate-900 shadow-float' : 'bg-white text-slate-900 ring-slate-200 shadow-card',
        className,
      )}
    >
      <div className="flex items-center justify-between gap-2">
        <span className={cn('grid size-10 place-items-center rounded-xl', highlighted ? 'bg-white/10 text-brand-300' : 'bg-brand-50 text-brand-600')}>
          <Icon className="size-5" />
        </span>
        {current ? <Badge tone={highlighted ? 'dark' : 'brand'}>Current plan</Badge> : growth ? <Badge tone="brand">Your own spokesperson</Badge> : null}
      </div>
      <h3 className="mt-5 text-xl font-bold tracking-tight">{plan.name}</h3>
      <p className={cn('mt-1 text-[15px]', highlighted ? 'text-slate-300' : 'text-slate-600')}>{plan.tagline}</p>

      <div className={cn('mt-5 rounded-2xl p-4', highlighted ? 'bg-white/5 ring-1 ring-white/10' : 'bg-slate-50 ring-1 ring-slate-100')}>
        <p className="text-3xl font-bold tracking-tight tabular-nums">
          {plan.creditsPerMinute}
          <span className={cn('ml-1 text-sm font-medium', highlighted ? 'text-slate-400' : 'text-slate-500')}>credits / minute of video</span>
        </p>
        <p className={cn('mt-1 text-xs', highlighted ? 'text-slate-400' : 'text-slate-500')}>Up to {plan.resolution} · pay only for what you generate</p>
      </div>

      {plan.requiresConsent && (
        <div className={cn('mt-4 flex items-start gap-2 rounded-xl px-3 py-2.5 text-[13px]', highlighted ? 'bg-amber-400/10 text-amber-200' : 'bg-amber-50 text-amber-900')}>
          <ShieldCheck className="mt-0.5 size-4 shrink-0" />
          Consent required before your avatar can be generated.
        </div>
      )}

      <ul className="mt-5 space-y-2.5 text-sm">
        {plan.features.map((f) => (
          <li key={f} className="flex items-start gap-2.5">
            <Check className={cn('mt-0.5 size-4 shrink-0', highlighted ? 'text-brand-300' : 'text-brand-600')} strokeWidth={2.5} />
            <span className={highlighted ? 'text-slate-200' : 'text-slate-700'}>{f}</span>
          </li>
        ))}
      </ul>
      {action && <div className="mt-7 pt-1">{action}</div>}
    </div>
  );
}
