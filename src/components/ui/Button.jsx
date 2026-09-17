import { forwardRef } from 'react';
import { Link } from 'react-router';
import { Loader2 } from 'lucide-react';
import { cn } from '../../utils/cn.js';

const VARIANTS = {
  primary:
    'bg-grad-brand text-white shadow-sm shadow-brand-600/25 hover:brightness-110 focus-visible:outline-brand-600',
  secondary: 'bg-surface text-slate-800 ring-1 ring-inset ring-slate-200 shadow-xs hover:bg-white/5 hover:ring-slate-300',
  ghost: 'text-slate-600 hover:bg-slate-100 hover:text-slate-900',
  subtle: 'bg-brand-50 text-brand-700 hover:bg-brand-100',
  danger: 'bg-rose-600 text-white shadow-sm hover:bg-rose-700 focus-visible:outline-rose-600',
  'danger-ghost': 'text-rose-600 hover:bg-rose-500/10',
  dark: 'bg-zinc-900 text-white shadow-sm hover:bg-zinc-800',
  // Deliberately literal white (not the dark `surface` token) — meant to stand out as a bright
  // button against a colourful/dark backdrop (e.g. a hero CTA), not blend in as another card.
  white: 'bg-white text-zinc-900 shadow-sm hover:bg-white/90',
};

const SIZES = {
  xs: 'h-7 px-2.5 text-xs gap-1 rounded-lg',
  sm: 'h-8 px-3 text-[13px] gap-1.5 rounded-lg',
  md: 'h-10 px-4 text-sm gap-2 rounded-xl',
  lg: 'h-12 px-6 text-[15px] gap-2 rounded-xl',
  icon: 'size-9 rounded-lg',
  'icon-sm': 'size-8 rounded-lg',
};

export const Button = forwardRef(function Button(
  { variant = 'primary', size = 'md', loading = false, disabled, className, to, href, icon: Icon, iconRight: IconRight, children, type = 'button', ...props },
  ref,
) {
  const classes = cn(
    'inline-flex shrink-0 select-none items-center justify-center font-semibold whitespace-nowrap transition duration-150 ease-out',
    'focus-visible:outline-2 focus-visible:outline-offset-2 active:scale-[0.98] disabled:pointer-events-none disabled:opacity-50',
    VARIANTS[variant],
    SIZES[size],
    className,
  );
  const iconClass = size === 'xs' || size === 'sm' ? 'size-3.5' : 'size-4';
  const content = (
    <>
      {loading ? <Loader2 className={cn(iconClass, 'animate-spin')} /> : Icon ? <Icon className={iconClass} /> : null}
      {children}
      {IconRight && !loading ? <IconRight className={iconClass} /> : null}
    </>
  );

  if (to) {
    return (
      <Link ref={ref} to={to} className={classes} {...props}>
        {content}
      </Link>
    );
  }
  if (href) {
    return (
      <a ref={ref} href={href} className={classes} {...props}>
        {content}
      </a>
    );
  }
  return (
    <button ref={ref} type={type} disabled={disabled || loading} className={classes} {...props}>
      {content}
    </button>
  );
});
