import { Coins } from 'lucide-react';
import { cn } from '../utils/cn.js';
import { formatMoney, formatNumber } from '../utils/format.js';
import { Badge } from './ui/Badge.jsx';

/** Credit package tile (landing, pricing and billing pages). */
export function PackageCard({ pkg, action, perMinute, className }) {
  const perCredit = pkg.priceCents / pkg.credits;
  return (
    <div
      className={cn(
        'relative flex flex-col rounded-2xl bg-white p-5 ring-1 transition',
        pkg.popular ? 'shadow-float ring-2 ring-brand-500' : 'shadow-card ring-slate-200',
        className,
      )}
    >
      {pkg.popular && (
        <Badge tone="brand" className="absolute -top-2.5 left-5 bg-brand-600 text-white ring-brand-600">
          Most popular
        </Badge>
      )}
      <div className="flex items-center justify-between">
        <p className="text-sm font-semibold text-slate-700">{pkg.name}</p>
        <Coins className="size-4 text-brand-500" />
      </div>
      <p className="mt-3 text-3xl font-bold tracking-tight tabular-nums">{formatNumber(pkg.credits)}</p>
      <p className="text-sm text-slate-500">credits</p>
      <div className="mt-4 flex items-baseline gap-2">
        <span className="text-xl font-semibold text-slate-900">{formatMoney(pkg.priceCents, pkg.currency)}</span>
        <span className="text-xs text-slate-500">{formatMoney(Math.round(perCredit * 100) / 100, pkg.currency)} / credit</span>
      </div>
      {perMinute ? (
        <p className="mt-2 text-xs text-slate-500">
          ≈ {formatNumber(Math.floor((pkg.credits / perMinute) * 10) / 10)} min of video at {perMinute} credits/min
        </p>
      ) : null}
      {action && <div className="mt-5">{action}</div>}
    </div>
  );
}
