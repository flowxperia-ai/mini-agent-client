import { useEffect, useRef, useState } from 'react';
import { FlaskConical, Menu, X } from 'lucide-react';
import { Outlet, useLocation } from 'react-router';
import { CreditBalance } from '../components/CreditBalance.jsx';
import { Logo } from '../components/Logo.jsx';
import { Sidebar } from '../components/Sidebar.jsx';
import { useAuthStore } from '../store/authStore.js';
import { useAppConfig } from '../store/configStore.js';

export function DashboardLayout() {
  const [drawer, setDrawer] = useState(false);
  const location = useLocation();
  const user = useAuthStore((s) => s.user);
  const refreshUser = useAuthStore((s) => s.refreshUser);
  const config = useAppConfig();
  const lastRefresh = useRef(0);

  // Keep the credit balance fresh as the user moves around (throttled).
  useEffect(() => {
    setDrawer(false);
    if (Date.now() - lastRefresh.current > 5000) {
      lastRefresh.current = Date.now();
      refreshUser();
    }
  }, [location.pathname, refreshUser]);

  useEffect(() => {
    document.body.style.overflow = drawer ? 'hidden' : '';
    return () => {
      document.body.style.overflow = '';
    };
  }, [drawer]);

  return (
    <div className="min-h-screen bg-slate-50">
      <aside className="fixed inset-y-0 left-0 z-30 hidden w-64 border-r border-slate-200/70 bg-slate-100/60 backdrop-blur lg:block">
        <Sidebar />
      </aside>

      {/* Mobile top bar */}
      <header className="sticky top-0 z-30 flex h-14 items-center justify-between border-b border-slate-200/70 bg-white/85 px-4 backdrop-blur-xl lg:hidden">
        <button type="button" onClick={() => setDrawer(true)} className="-ml-1 rounded-lg p-2 text-slate-700" aria-label="Open navigation">
          <Menu className="size-5" />
        </button>
        <Logo to="/dashboard" />
        <CreditBalance compact credits={user?.credits ?? 0} />
      </header>

      {drawer && (
        <div className="fixed inset-0 z-50 lg:hidden" role="dialog" aria-modal="true">
          <div className="absolute inset-0 animate-fade-in bg-slate-950/40" onClick={() => setDrawer(false)} />
          <div className="absolute inset-y-0 left-0 w-72 max-w-[85vw] animate-rise overflow-y-auto bg-slate-50 shadow-2xl">
            <button type="button" onClick={() => setDrawer(false)} className="absolute top-4 right-3 rounded-lg p-2 text-slate-500" aria-label="Close navigation">
              <X className="size-5" />
            </button>
            <Sidebar onNavigate={() => setDrawer(false)} />
          </div>
        </div>
      )}

      <div className="lg:pl-64">
        {config.mockMode && (
          <div className="flex items-center justify-center gap-2 border-b border-amber-200/70 bg-amber-50 px-4 py-1.5 text-center text-xs font-medium text-amber-900">
            <FlaskConical className="size-3.5 shrink-0" />
            Mock mode — avatar generation, payments and storage are simulated locally.
          </div>
        )}
        <main className="mx-auto w-full max-w-6xl px-4 py-6 sm:px-6 sm:py-8 lg:px-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
