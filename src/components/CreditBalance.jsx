import { Coins, Plus } from 'lucide-react';
import { Link } from 'react-router';
import { cn } from '../utils/cn.js';
import { formatNumber } from '../utils/format.js';

/** Compact balance widget used in the sidebar and page headers. */
export function CreditBalance({ credits = 0, reserved = 0, className, compact = false }) {
  if (compact) {
    return (
      <Link
        to="/dashboard/credits"
        className={cn('inline-flex items-center gap-1.5 rounded-full bg-brand-50 px-3 py-1.5 text-sm font-semibold text-brand-700 ring-1 ring-brand-200 hover:bg-brand-100', className)}
      >
        <Coins className="size-4" />
        <span className="tabular-nums">{formatNumber(credits)}</span>
      </Link>
    );
  }
  const low = credits < 20;
  return (
    <div className={cn('relative overflow-hidden rounded-2xl bg-gradient-to-br from-brand-600 to-brand-800 p-4 text-white shadow-lg shadow-brand-900/20', className)}>
      <div className="absolute -top-8 -right-8 size-28 rounded-full bg-white/10" />
      <div className="absolute -right-4 -bottom-10 size-24 rounded-full bg-white/5" />
      <p className="flex items-center gap-1.5 text-xs font-medium text-white/70">
        <Coins className="size-3.5" /> Available credits
      </p>
      <p className="mt-1 text-2xl font-bold tracking-tight tabular-nums">{formatNumber(credits)}</p>
      {reserved > 0 && <p className="text-xs text-white/70">{formatNumber(reserved)} reserved for videos in progress</p>}
      {low && reserved === 0 && <p className="text-xs text-white/80">Running low — top up to keep generating.</p>}
      <Link
        to="/dashboard/billing"
        className="relative mt-3 inline-flex items-center gap-1 rounded-lg bg-white/15 px-2.5 py-1.5 text-xs font-semibold backdrop-blur transition hover:bg-white/25"
      >
        <Plus className="size-3.5" /> Buy credits
      </Link>
    </div>
  );
}
