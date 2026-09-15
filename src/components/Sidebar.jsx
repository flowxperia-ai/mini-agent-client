import {
  Code2,
  Coins,
  CreditCard,
  Film,
  LayoutDashboard,
  LogOut,
  Plus,
  Settings,
  ShieldCheck,
  UserRound,
} from 'lucide-react';
import { NavLink, useNavigate } from 'react-router';
import { useAuthStore } from '../store/authStore.js';
import { cn } from '../utils/cn.js';
import { CreditBalance } from './CreditBalance.jsx';
import { Logo } from './Logo.jsx';
import { Badge } from './ui/Badge.jsx';
import { Button } from './ui/Button.jsx';

const NAV = [
  { to: '/dashboard', label: 'Overview', icon: LayoutDashboard, end: true },
  { to: '/dashboard/videos', label: 'Videos', icon: Film },
  { to: '/dashboard/widgets', label: 'Widgets', icon: Code2 },
  { to: '/dashboard/avatars', label: 'Avatars', icon: UserRound },
  { to: '/dashboard/credits', label: 'Credits', icon: Coins },
  { to: '/dashboard/billing', label: 'Billing', icon: CreditCard },
  { to: '/dashboard/settings', label: 'Settings', icon: Settings },
];

function NavItem({ item, onNavigate }) {
  return (
    <NavLink
      to={item.to}
      end={item.end}
      onClick={onNavigate}
      className={({ isActive }) =>
        cn(
          'group flex items-center gap-3 rounded-xl px-3 py-2 text-sm font-medium transition',
          isActive ? 'bg-white text-slate-900 shadow-sm ring-1 ring-slate-200/80' : 'text-slate-600 hover:bg-white/70 hover:text-slate-900',
        )
      }
    >
      {({ isActive }) => (
        <>
          <item.icon className={cn('size-[18px]', isActive ? 'text-brand-600' : 'text-slate-400 group-hover:text-slate-600')} />
          {item.label}
        </>
      )}
    </NavLink>
  );
}

/** Dashboard navigation — static on desktop, rendered inside a drawer on mobile. */
export function Sidebar({ onNavigate, reserved = 0 }) {
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  return (
    <div className="flex h-full flex-col gap-6 px-4 py-5">
      <Logo to="/dashboard" className="px-1" />

      <Button to="/dashboard/create" icon={Plus} onClick={onNavigate} className="w-full">
        Create video
      </Button>

      <nav className="space-y-1" aria-label="Dashboard">
        {NAV.map((item) => (
          <NavItem key={item.to} item={item} onNavigate={onNavigate} />
        ))}
        {user?.role === 'admin' && (
          <>
            <p className="px-3 pt-5 pb-1 text-[11px] font-semibold tracking-wider text-slate-400 uppercase">Operations</p>
            <NavItem item={{ to: '/admin', label: 'Admin', icon: ShieldCheck }} onNavigate={onNavigate} />
          </>
        )}
      </nav>

      <div className="mt-auto space-y-4">
        <CreditBalance credits={user?.credits ?? 0} reserved={reserved} />
        <div className="flex items-center gap-3 rounded-xl px-1">
          <span className="grid size-9 shrink-0 place-items-center rounded-full bg-gradient-to-br from-slate-700 to-slate-900 text-sm font-semibold text-white">
            {user?.name?.[0]?.toUpperCase() ?? '?'}
          </span>
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-semibold text-slate-900">{user?.name}</p>
            <Badge tone={user?.plan === 'GROWTH' ? 'brand' : 'gray'} className="mt-0.5">
              {user?.plan === 'GROWTH' ? 'Growth' : 'Starter'} plan
            </Badge>
          </div>
          <button type="button" onClick={handleLogout} className="rounded-lg p-2 text-slate-400 transition hover:bg-white hover:text-slate-700" aria-label="Sign out" title="Sign out">
            <LogOut className="size-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
