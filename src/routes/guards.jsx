import { Navigate, Outlet, useLocation } from 'react-router';
import { LoadingState } from '../components/ui/States.jsx';
import { useAuthStore } from '../store/authStore.js';

function FullPageLoader() {
  return <LoadingState label="Loading your workspace…" className="min-h-screen" />;
}

/** Requires a signed-in user; remembers where they were going. */
export function ProtectedRoute() {
  const { status } = useAuthStore();
  const location = useLocation();
  if (status === 'idle' || status === 'loading') return <FullPageLoader />;
  if (status !== 'authenticated') {
    const next = encodeURIComponent(location.pathname + location.search);
    return <Navigate to={`/login?next=${next}`} replace />;
  }
  return <Outlet />;
}

/** Login/register: signed-in users go straight to the dashboard. */
export function GuestRoute() {
  const { status } = useAuthStore();
  const location = useLocation();
  if (status === 'idle' || status === 'loading') return <FullPageLoader />;
  if (status === 'authenticated') {
    const next = new URLSearchParams(location.search).get('next');
    return <Navigate to={next && next.startsWith('/') && !next.startsWith('//') ? next : '/dashboard'} replace />;
  }
  return <Outlet />;
}

/** UI gate only — the API enforces admin access independently. */
export function AdminRoute() {
  const user = useAuthStore((s) => s.user);
  if (user?.role !== 'admin') return <Navigate to="/dashboard" replace />;
  return <Outlet />;
}
