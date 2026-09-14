import { useState } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { AlertCircle, Check, Lock, Mail, Sparkles, User, UserRound } from 'lucide-react';
import { Controller, useForm } from 'react-hook-form';
import { Link, useNavigate, useSearchParams } from 'react-router';
import { registerSchema } from '#shared/schemas';
import { Button } from '../../components/ui/Button.jsx';
import { Input } from '../../components/ui/Field.jsx';
import { InlineAlert } from '../../components/ui/States.jsx';
import { useDocumentTitle } from '../../hooks/useDocumentTitle.js';
import { useAuthStore } from '../../store/authStore.js';
import { toast } from '../../store/toastStore.js';
import { cn } from '../../utils/cn.js';

const PLAN_OPTIONS = [
  { id: 'STARTER', name: 'Starter', icon: UserRound, text: 'Choose from our stock avatar library.' },
  { id: 'GROWTH', name: 'Growth', icon: Sparkles, text: 'Create a digital twin of yourself.' },
];

export default function RegisterPage() {
  useDocumentTitle('Create account');
  const registerUser = useAuthStore((s) => s.register);
  const navigate = useNavigate();
  const [serverError, setServerError] = useState(null);
  const [searchParams] = useSearchParams();
  const requestedPlan = searchParams.get('plan');
  const initialPlan = PLAN_OPTIONS.some((o) => o.id === requestedPlan) ? requestedPlan : 'STARTER';

  const {
    register,
    control,
    handleSubmit,
    setError,
    watch,
    formState: { errors, isSubmitting },
  } = useForm({ resolver: zodResolver(registerSchema), defaultValues: { name: '', email: '', password: '', plan: initialPlan } });
  const plan = watch('plan');

  const onSubmit = async (values) => {
    setServerError(null);
    try {
      await registerUser(values);
      toast.success('Welcome aboard! Your account is ready.');
      navigate(values.plan === 'GROWTH' ? '/dashboard/avatars' : '/dashboard', { replace: true });
    } catch (error) {
      const fields = error.fieldErrors?.() ?? {};
      Object.entries(fields).forEach(([name, message]) => setError(name, { message }));
      if (error.code === 'EMAIL_IN_USE') setError('email', { message: error.message });
      else if (!Object.keys(fields).length) setServerError(error);
    }
  };

  return (
    <div className="animate-rise">
      <h1 className="text-2xl font-bold tracking-tight text-slate-900">Create your account</h1>
      <p className="mt-1.5 text-sm text-slate-500">Put a spokesperson on your website in minutes.</p>

      <form onSubmit={handleSubmit(onSubmit)} className="mt-8 space-y-4" noValidate>
        {serverError && (
          <InlineAlert tone="danger" icon={AlertCircle}>
            {serverError.message}
          </InlineAlert>
        )}

        <fieldset>
          <legend className="mb-2 text-sm font-medium text-slate-800">Plan</legend>
          <Controller
            control={control}
            name="plan"
            render={({ field }) => (
              <div className="grid grid-cols-2 gap-2.5" role="radiogroup">
                {PLAN_OPTIONS.map((option) => {
                  const active = field.value === option.id;
                  return (
                    <button
                      key={option.id}
                      type="button"
                      role="radio"
                      aria-checked={active}
                      onClick={() => field.onChange(option.id)}
                      className={cn(
                        'relative rounded-xl p-3 text-left ring-1 transition',
                        active ? 'bg-brand-50/60 ring-2 ring-brand-600' : 'bg-white ring-slate-200 hover:ring-slate-300',
                      )}
                    >
                      {active && (
                        <span className="absolute top-2.5 right-2.5 grid size-4 place-items-center rounded-full bg-brand-600 text-white">
                          <Check className="size-3" strokeWidth={3} />
                        </span>
                      )}
                      <option.icon className={cn('size-5', active ? 'text-brand-600' : 'text-slate-400')} />
                      <p className="mt-2 text-sm font-semibold text-slate-900">{option.name}</p>
                      <p className="mt-0.5 text-xs leading-snug text-slate-500">{option.text}</p>
                    </button>
                  );
                })}
              </div>
            )}
          />
        </fieldset>

        <Input label="Full name" autoComplete="name" icon={User} placeholder="Jordan Lee" error={errors.name?.message} {...register('name')} />
        <Input label="Work email" type="email" autoComplete="email" icon={Mail} placeholder="you@company.com" error={errors.email?.message} {...register('email')} />
        <Input
          label="Password"
          type="password"
          autoComplete="new-password"
          icon={Lock}
          placeholder="At least 8 characters"
          hint="Use 8+ characters with a letter and a number."
          error={errors.password?.message}
          {...register('password')}
        />
        <Button type="submit" size="lg" className="w-full" loading={isSubmitting}>
          Create account
        </Button>
        <p className="text-center text-xs text-slate-400">New accounts start with 0 credits — buy a credit pack when you are ready to generate.</p>
      </form>

      <p className="mt-6 text-center text-sm text-slate-500">
        Already have an account?{' '}
        <Link to="/login" className="font-semibold text-brand-600 hover:text-brand-700">
          Sign in
        </Link>
      </p>
    </div>
  );
}
