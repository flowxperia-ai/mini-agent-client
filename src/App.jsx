import { lazy, Suspense, useEffect } from 'react';
import { Route, Routes, useLocation } from 'react-router';
import { RouteErrorBoundary } from './components/RouteErrorBoundary.jsx';
import { Toaster } from './components/ui/Toast.jsx';
import { LoadingState } from './components/ui/States.jsx';
import { AuthLayout } from './layouts/AuthLayout.jsx';
import { DashboardLayout } from './layouts/DashboardLayout.jsx';
import { MarketingLayout } from './layouts/MarketingLayout.jsx';
import { AdminRoute, GuestRoute, ProtectedRoute } from './routes/guards.jsx';
import { useAuthStore } from './store/authStore.js';
import { useConfigStore } from './store/configStore.js';

const LandingPage = lazy(() => import('./pages/LandingPage.jsx'));
const PricingPage = lazy(() => import('./pages/PricingPage.jsx'));
const LoginPage = lazy(() => import('./pages/auth/LoginPage.jsx'));
const RegisterPage = lazy(() => import('./pages/auth/RegisterPage.jsx'));
const DashboardHome = lazy(() => import('./pages/dashboard/DashboardHome.jsx'));
const CreateVideoPage = lazy(() => import('./pages/dashboard/CreateVideoPage.jsx'));
const VideosPage = lazy(() => import('./pages/dashboard/VideosPage.jsx'));
const VideoDetailPage = lazy(() => import('./pages/dashboard/VideoDetailPage.jsx'));
const AvatarsPage = lazy(() => import('./pages/dashboard/AvatarsPage.jsx'));
const CreditsPage = lazy(() => import('./pages/dashboard/CreditsPage.jsx'));
const BillingPage = lazy(() => import('./pages/dashboard/BillingPage.jsx'));
const MockCheckoutPage = lazy(() => import('./pages/dashboard/MockCheckoutPage.jsx'));
const SettingsPage = lazy(() => import('./pages/dashboard/SettingsPage.jsx'));
const WidgetEditorPage = lazy(() => import('./pages/dashboard/WidgetEditorPage.jsx'));
const AdminPage = lazy(() => import('./pages/admin/AdminPage.jsx'));
const MockConsentPage = lazy(() => import('./pages/mock/MockConsentPage.jsx'));
const NotFoundPage = lazy(() => import('./pages/NotFoundPage.jsx'));

function ScrollToTop() {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);
  return null;
}

export default function App() {
  const initAuth = useAuthStore((s) => s.init);
  const loadConfig = useConfigStore((s) => s.load);

  useEffect(() => {
    loadConfig();
    initAuth();
  }, [initAuth, loadConfig]);

  return (
    <>
      <ScrollToTop />
      <RouteErrorBoundary>
        <Suspense fallback={<LoadingState className="min-h-[60vh]" />}>
          <Routes>
            <Route element={<MarketingLayout />}>
              <Route index element={<LandingPage />} />
              <Route path="pricing" element={<PricingPage />} />
            </Route>

            <Route element={<GuestRoute />}>
              <Route element={<AuthLayout />}>
                <Route path="login" element={<LoginPage />} />
                <Route path="register" element={<RegisterPage />} />
              </Route>
            </Route>

            <Route element={<ProtectedRoute />}>
              <Route path="dashboard" element={<DashboardLayout />}>
                <Route index element={<DashboardHome />} />
                <Route path="create" element={<CreateVideoPage />} />
                <Route path="videos" element={<VideosPage />} />
                <Route path="videos/:id" element={<VideoDetailPage />} />
                <Route path="avatars" element={<AvatarsPage />} />
                <Route path="credits" element={<CreditsPage />} />
                <Route path="billing" element={<BillingPage />} />
                <Route path="billing/mock-checkout" element={<MockCheckoutPage />} />
                <Route path="settings" element={<SettingsPage />} />
                <Route path="widgets/:id" element={<WidgetEditorPage />} />
              </Route>
              <Route element={<AdminRoute />}>
                <Route path="admin" element={<DashboardLayout />}>
                  <Route index element={<AdminPage />} />
                </Route>
              </Route>
              <Route path="mock/heygen-consent" element={<MockConsentPage />} />
            </Route>

            <Route path="*" element={<NotFoundPage />} />
          </Routes>
        </Suspense>
      </RouteErrorBoundary>
      <Toaster />
    </>
  );
}
