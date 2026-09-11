import { Compass } from 'lucide-react';
import { Logo } from '../components/Logo.jsx';
import { Button } from '../components/ui/Button.jsx';
import { useDocumentTitle } from '../hooks/useDocumentTitle.js';

export default function NotFoundPage() {
  useDocumentTitle('Page not found');
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-slate-50 px-6 text-center">
      <Logo className="mb-12" />
      <span className="grid size-14 place-items-center rounded-2xl bg-brand-50 text-brand-600">
        <Compass className="size-7" />
      </span>
      <h1 className="mt-6 text-3xl font-bold tracking-tight">Page not found</h1>
      <p className="mt-2 max-w-sm text-slate-500">The page you are looking for does not exist or has moved.</p>
      <div className="mt-8 flex gap-3">
        <Button to="/">Back home</Button>
        <Button to="/dashboard" variant="secondary">
          Dashboard
        </Button>
      </div>
    </div>
  );
}
