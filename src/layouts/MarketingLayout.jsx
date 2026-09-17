import { Link, Outlet } from 'react-router';
import { Logo } from '../components/Logo.jsx';
import { Navbar } from '../components/Navbar.jsx';

export function MarketingLayout() {
  return (
    <div className="flex min-h-screen flex-col bg-surface">
      <Navbar />
      <main className="flex-1">
        <Outlet />
      </main>
      <footer className="border-t border-slate-100 bg-slate-50">
        <div className="mx-auto flex max-w-6xl flex-col gap-6 px-4 py-10 sm:flex-row sm:items-center sm:justify-between sm:px-6">
          <div>
            <Logo />
            <p className="mt-3 max-w-xs text-sm text-slate-500">Pre-recorded AI spokesperson videos for your website. No chatbots, no live calls — just a clear message.</p>
          </div>
          <div className="flex flex-wrap gap-x-6 gap-y-2 text-sm text-slate-600">
            <Link to="/pricing" className="hover:text-slate-900">Pricing</Link>
            <a href="/#how-it-works" className="hover:text-slate-900">How it works</a>
            <a href="/#faq" className="hover:text-slate-900">FAQ</a>
            <Link to="/login" className="hover:text-slate-900">Sign in</Link>
          </div>
        </div>
        <div className="border-t border-slate-200/70 py-5 text-center text-xs text-slate-400">© {new Date().getFullYear()} Website Mini Agent. All rights reserved.</div>
      </footer>
    </div>
  );
}
