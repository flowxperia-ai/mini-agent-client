import { useState } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { AlertCircle, Lock, Mail } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { Link, useNavigate, useSearchParams } from 'react-router';
import { loginSchema } from '#shared/schemas';
import { Button } from '../../components/ui/Button.jsx';
import { Input } from '../../components/ui/Field.jsx';
import { InlineAlert } from '../../components/ui/States.jsx';
import { useDocumentTitle } from '../../hooks/useDocumentTitle.js';
import { useAuthStore } from '../../store/authStore.js';
import { useAppConfig } from '../../store/configStore.js';

const DEMO_ACCOUNTS = [
  { email: 'demo@example.com', label: 'Starter demo' },
  { email: 'growth@example.com', label: 'Growth demo' },
  { email: 'admin@example.com', label: 'Admin' },
];

export default function LoginPage() {
  useDocumentTitle('Sign in');
  const login = useAuthStore((s) => s.login);
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const config = useAppConfig();
  const [serverError, setServerError] = useState(null);
  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm({ resolver: zodResolver(loginSchema), defaultValues: { email: '', password: '' } });

  const onSubmit = async (values) => {
    setServerError(null);
    try {
      await login(values);
      const next = params.get('next');
      navigate(next && next.startsWith('/') && !next.startsWith('//') ? next : '/dashboard', { replace: true });
    } catch (error) {
      setServerError(error);
    }
  };

  return (
    <div className="animate-rise">
      <h1 className="text-2xl font-bold tracking-tight text-slate-900">Welcome back</h1>
      <p className="mt-1.5 text-sm text-slate-500">Sign in to manage your spokesperson videos and widgets.</p>

      <form onSubmit={handleSubmit(onSubmit)} className="mt-8 space-y-4" noValidate>
        {serverError && (
          <InlineAlert tone="danger" icon={AlertCircle}>
            {serverError.message}
          </InlineAlert>
        )}
        <Input label="Email" type="email" autoComplete="email" icon={Mail} placeholder="you@company.com" error={errors.email?.message} {...register('email')} />
        <Input label="Password" type="password" autoComplete="current-password" icon={Lock} placeholder="••••••••" error={errors.password?.message} {...register('password')} />
        <Button type="submit" size="lg" className="w-full" loading={isSubmitting}>
          Sign in
        </Button>
      </form>

      <p className="mt-6 text-center text-sm text-slate-500">
        New here?{' '}
        <Link to="/register" className="font-semibold text-brand-600 hover:text-brand-700">
          Create an account
        </Link>
      </p>

      {config.mockMode && (
        <div className="mt-8 rounded-2xl bg-slate-50 p-4 ring-1 ring-slate-200">
          <p className="text-xs font-semibold tracking-wide text-slate-500 uppercase">Seeded demo accounts</p>
          <p className="mt-1 text-xs text-slate-500">
            Password <code className="rounded bg-white px-1 py-0.5 ring-1 ring-slate-200">Password123!</code> — run <code>npm run seed</code> first.
          </p>
          <div className="mt-3 flex flex-wrap gap-2">
            {DEMO_ACCOUNTS.map((a) => (
              <button
                key={a.email}
                type="button"
                onClick={() => {
                  setValue('email', a.email);
                  setValue('password', 'Password123!');
                }}
                className="rounded-full bg-white px-3 py-1 text-xs font-medium text-slate-700 ring-1 ring-slate-200 hover:ring-brand-300 hover:text-brand-700"
              >
                {a.label}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
