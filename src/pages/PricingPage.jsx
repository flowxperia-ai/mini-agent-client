import { ArrowRight, Info, UserPlus } from 'lucide-react';
import { PackageCard } from '../components/PackageCard.jsx';
import { PlanCard } from '../components/PlanCard.jsx';
import { Button } from '../components/ui/Button.jsx';
import { ErrorState, LoadingState } from '../components/ui/States.jsx';
import { useApi } from '../hooks/useApi.js';
import { useDocumentTitle } from '../hooks/useDocumentTitle.js';
import { billingService } from '../services/index.js';
import { useAuthStore } from '../store/authStore.js';
import { formatMoney } from '../utils/format.js';

export default function PricingPage() {
  useDocumentTitle('Pricing');
  const user = useAuthStore((s) => s.user);
  const { data, loading, error, refetch } = useApi(() => billingService.packages(), []);

  return (
    <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6 sm:py-20">
      <div className="mx-auto max-w-2xl text-center">
        <p className="text-sm font-semibold text-brand-600">Pricing</p>
        <h1 className="mt-2 text-4xl font-bold tracking-tight text-slate-950 sm:text-5xl">Simple, credit-based pricing</h1>
        <p className="mt-4 text-lg text-slate-600">Choose a plan, buy credits, and only pay for the videos you generate.</p>
      </div>

      {loading && <LoadingState />}
      {error && <ErrorState error={error} onRetry={refetch} className="mt-12" />}

      {data && (
        <>
          <div className="mx-auto mt-14 grid max-w-4xl gap-6 md:grid-cols-2">
            {data.plans.map((plan) => (
              <PlanCard
                key={plan.id}
                plan={plan}
                highlighted={plan.id === 'GROWTH'}
                current={user?.plan === plan.id}
                action={
                  <Button
                    to={user ? '/dashboard/billing' : `/register?plan=${plan.id}`}
                    variant={plan.id === 'GROWTH' ? 'white' : 'primary'}
                    className="w-full"
                    iconRight={ArrowRight}
                  >
                    {user ? 'Manage plan' : `Start with ${plan.name}`}
                  </Button>
                }
              />
            ))}
          </div>

          <div className="mt-20">
            <h2 className="text-2xl font-bold tracking-tight">Credit packs</h2>
            <p className="mt-1 text-slate-600">Credits never expire while your account is active. Bigger packs cost less per credit.</p>
            <div className="mt-8 grid gap-5 sm:grid-cols-3">
              {data.creditPackages.map((pkg) => (
                <PackageCard
                  key={pkg.id}
                  pkg={pkg}
                  perMinute={data.plans.find((p) => p.id === (user?.plan ?? 'STARTER'))?.creditsPerMinute}
                  action={
                    <Button to={user ? '/dashboard/billing' : '/register'} variant={pkg.popular ? 'primary' : 'secondary'} className="w-full">
                      {user ? 'Buy credits' : 'Get started'}
                    </Button>
                  }
                />
              ))}
            </div>
          </div>

          <div className="mt-10 grid gap-4 md:grid-cols-2">
            <div className="flex gap-4 rounded-2xl bg-surface p-5 ring-1 ring-slate-200">
              <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-brand-50 text-brand-600">
                <UserPlus className="size-5" />
              </span>
              <div>
                <p className="font-semibold text-slate-900">
                  {data.avatarSlot.name} · {formatMoney(data.avatarSlot.priceCents, data.avatarSlot.currency)}
                </p>
                <p className="mt-1 text-sm text-slate-600">{data.avatarSlot.description}</p>
              </div>
            </div>
            <div className="flex gap-4 rounded-2xl bg-surface p-5 ring-1 ring-slate-200">
              <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-slate-100 text-slate-600">
                <Info className="size-5" />
              </span>
              <div>
                <p className="font-semibold text-slate-900">How credits are charged</p>
                <p className="mt-1 text-sm text-slate-600">
                  We estimate a video&apos;s length from your script and reserve credits up front. When the video is ready you are charged for its real length
                  (never more than the reservation). If generation fails, every reserved credit is returned.
                </p>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
