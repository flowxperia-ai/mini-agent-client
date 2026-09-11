import { useEffect, useState } from 'react';
import { Menu as MenuIcon, X } from 'lucide-react';
import { Link, NavLink } from 'react-router';
import { useAuthStore } from '../store/authStore.js';
import { cn } from '../utils/cn.js';
import { Logo } from './Logo.jsx';
import { Button } from './ui/Button.jsx';

const LINKS = [
  { href: '/#how-it-works', label: 'How it works' },
  { href: '/#example', label: 'Example' },
  { to: '/pricing', label: 'Pricing' },
  { href: '/#faq', label: 'FAQ' },
];

/** Marketing site navigation. */
export function Navbar() {
  const user = useAuthStore((s) => s.user);
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <header
      className={cn(
        'sticky top-0 z-40 transition duration-200',
        scrolled || open ? 'border-b border-slate-200/70 bg-white/85 backdrop-blur-xl' : 'bg-transparent',
      )}
    >
      <nav className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6">
        <Logo />
        <div className="hidden items-center gap-1 md:flex">
          {LINKS.map((l) =>
            l.to ? (
              <NavLink
                key={l.label}
                to={l.to}
                className={({ isActive }) => cn('rounded-lg px-3 py-2 text-sm font-medium transition', isActive ? 'text-slate-900' : 'text-slate-600 hover:text-slate-900')}
              >
                {l.label}
              </NavLink>
            ) : (
              <a key={l.label} href={l.href} className="rounded-lg px-3 py-2 text-sm font-medium text-slate-600 transition hover:text-slate-900">
                {l.label}
              </a>
            ),
          )}
        </div>
        <div className="hidden items-center gap-2 md:flex">
          {user ? (
            <Button to="/dashboard" size="sm">
              Open dashboard
            </Button>
          ) : (
            <>
              <Button to="/login" variant="ghost" size="sm">
                Sign in
              </Button>
              <Button to="/register" size="sm">
                Create your spokesperson
              </Button>
            </>
          )}
        </div>
        <button type="button" className="rounded-lg p-2 text-slate-700 md:hidden" onClick={() => setOpen((o) => !o)} aria-label="Toggle menu" aria-expanded={open}>
          {open ? <X className="size-5" /> : <MenuIcon className="size-5" />}
        </button>
      </nav>
      {open && (
        <div className="animate-rise border-t border-slate-100 px-4 pt-2 pb-5 md:hidden">
          {LINKS.map((l) =>
            l.to ? (
              <Link key={l.label} to={l.to} onClick={() => setOpen(false)} className="block rounded-lg px-3 py-2.5 text-[15px] font-medium text-slate-700">
                {l.label}
              </Link>
            ) : (
              <a key={l.label} href={l.href} onClick={() => setOpen(false)} className="block rounded-lg px-3 py-2.5 text-[15px] font-medium text-slate-700">
                {l.label}
              </a>
            ),
          )}
          <div className="mt-3 grid gap-2">
            {user ? (
              <Button to="/dashboard">Open dashboard</Button>
            ) : (
              <>
                <Button to="/register">Create your spokesperson</Button>
                <Button to="/login" variant="secondary">
                  Sign in
                </Button>
              </>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
