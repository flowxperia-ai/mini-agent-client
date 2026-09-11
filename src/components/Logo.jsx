import { Link } from 'react-router';
import { cn } from '../utils/cn.js';

export function LogoMark({ className }) {
  return (
    <svg viewBox="0 0 32 32" className={cn('size-8', className)} aria-hidden="true">
      <defs>
        <linearGradient id="wma-logo" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#8b7bff" />
          <stop offset="1" stopColor="#5a45e6" />
        </linearGradient>
      </defs>
      <rect width="32" height="32" rx="9" fill="url(#wma-logo)" />
      <circle cx="16" cy="13" r="5" fill="#fff" />
      <path d="M7 26c1-5.2 4.6-8 9-8s8 2.8 9 8" fill="#fff" />
      <circle cx="25" cy="7" r="3.2" fill="#22c55e" stroke="#6d5dfc" strokeWidth="1.6" />
    </svg>
  );
}

export function Logo({ to = '/', className, light = false }) {
  return (
    <Link to={to} className={cn('flex items-center gap-2.5 font-semibold tracking-tight', className)}>
      <LogoMark />
      <span className={cn('text-[15px] leading-none', light ? 'text-white' : 'text-slate-900')}>
        Mini Agent
        <span className={cn('block text-[10.5px] font-medium tracking-wide uppercase', light ? 'text-white/60' : 'text-slate-400')}>
          Website spokesperson
        </span>
      </span>
    </Link>
  );
}
