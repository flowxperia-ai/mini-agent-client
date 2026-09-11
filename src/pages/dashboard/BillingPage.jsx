import { useEffect, useState } from 'react';
import { CheckCircle2, CreditCard, Info, UserPlus, XCircle } from 'lucide-react';
import { useSearchParams } from 'react-router';
import { PackageCard } from '../../components/PackageCard.jsx';
import { PageHeader } from '../../components/PageHeader.jsx';
import { PlanCard } from '../../components/PlanCard.jsx';
import { StatusBadge } from '../../components/StatusBadge.jsx';
import { Button } from '../../components/ui/Button.jsx';
import { Card, CardHeader } from '../../components/ui/Card.jsx';
import { DataTable, Pagination } from '../../components/ui/DataTable.jsx';
import { Modal } from '../../components/ui/Modal.jsx';
import { ErrorState, InlineAlert, LoadingState } from '../../components/ui/States.jsx';
import { useApi } from '../../hooks/useApi.js';
import { useDocumentTitle } from '../../hooks/useDocumentTitle.js';
import { billingService, userService } from '../../services/index.js';
import { useAuthStore } from '../../store/authStore.js';
import { toast } from '../../store/toastStore.js';
import { formatDateTime, formatMoney } from '../../utils/format.js';

export default function BillingPage() {
  useDocumentTitle('Billing');
  const { user, setUser, refreshUser } = useAuthStore();
  const [params, setParams] = useSearchParams();
  const checkout = params.get('checkout');
  const [buying, setBuying] = useState(null);
  const [planTarget, setPlanTarget] = useState(null);
  const [switching, setSwitching] = useState(false);
  const [page, setPage] = useState(1);

  const products = useApi(() => billingService.packages(), []);
  const history = useApi(() => billingService.transactions({ page, limit: 10 }), [page], {
    poll: (d) => (d?.items?.some((p) => p.status === 'PENDING') && checkout === 'success' ? 2500 : null),
  });

  // Credits are granted by the payment webhook, not the redirect — refresh until it lands.
  useEffect(() => {
    if (checkout !== 'success') return undefined;
    let n = 0;
    const t = setInterval(() => {
      refreshUser();
      if (++n >= 6) clearInterval(t);
    }, 2000);
    return () => clearInterval(t);
  }, [checkout, refreshUser]);

  const buy = async (packageId) => {
    setBuying(packageId);
    try {
      const { url } = await billingService.checkout(packageId);
      window.location.assign(url);
    } catch (err) {
      toast.fromError(err);
      setBuying(null);
    }
  };

  const switchPlan = async () => {
    setSwitching(true);
    try {
      const { user: updated } = await userService.updateMe({ plan: planTarget.id });
      setUser(updated);
      toast.success(`You are now on the ${planTarget.name} plan`);
      setPlanTarget(null);
      products.refetch({ silent: true });
    } catch (err) {
      toast.fromError(err);
    } finally {
      setSwitching(false);
    }
  };

  if (products.error) return <ErrorState error={products.error} onRetry={products.refetch} />;
  if (!products.data) return <LoadingState />;
  const { plans, creditPackages, avatarSlot } = products.data;
  const perMinute = plans.find((p) => p.id === user.plan)?.creditsPerMinute;

  return (
    <div className="animate-rise">
      <PageHeader title="Billing" description="Manage your plan, buy credits and review payments." />

      {checkout === 'success' && (
        <InlineAlert tone="success" icon={CheckCircle2} title="Payment received" className="mb-6" action={<Button size="sm" variant="ghost" onClick={() => setParams({})}>Dismiss</Button>}>
          Your credits appear as soon as the payment provider confirms the payment — usually within a few seconds.
        </InlineAlert>
      )}
      {checkout === 'cancelled' && (
        <InlineAlert tone="warning" icon={XCircle} title="Checkout cancelled" className="mb-6" action={<Button size="sm" variant="ghost" onClick={() => setParams({})}>Dismiss</Button>}>
          No payment was taken.
        </InlineAlert>
      )}

      <section>
        <h2 className="text-lg font-semibold text-slate-900">Plan</h2>
        <p className="mb-4 text-sm text-slate-500">Both plans are credit-based. Switching changes which avatars you can use and the credit rate for new videos.</p>
        <div className="grid gap-5 lg:grid-cols-2">
          {plans.map((plan) => (
            <PlanCard
              key={plan.id}
              plan={plan}
              current={user.plan === plan.id}
              highlighted={user.plan === plan.id}
              action={
                user.plan === plan.id ? (
                  <p className="text-center text-sm font-medium text-slate-400">This is your current plan</p>
                ) : (
                  <Button variant="secondary" className="w-full" onClick={() => setPlanTarget(plan)}>
                    Switch to {plan.name}
                  </Button>
                )
              }
            />
          ))}
        </div>
      </section>

      <section className="mt-10">
        <h2 className="text-lg font-semibold text-slate-900">Buy credits</h2>
        <p className="mb-4 text-sm text-slate-500">
          Your balance: <strong className="text-slate-900">{user.credits}</strong> credits · {perMinute} credits per minute on {user.plan === 'GROWTH' ? 'Growth' : 'Starter'}
        </p>
        <div className="grid gap-5 sm:grid-cols-3">
          {creditPackages.map((pkg) => (
            <PackageCard
              key={pkg.id}
              pkg={pkg}
              perMinute={perMinute}
              action={
                <Button className="w-full" variant={pkg.popular ? 'primary' : 'secondary'} icon={CreditCard} loading={buying === pkg.id} disabled={Boolean(buying)} onClick={() => buy(pkg.id)}>
                  Buy {pkg.credits} credits
                </Button>
              }
            />
          ))}
        </div>

        {user.plan === 'GROWTH' && (
          <Card className="mt-5 flex flex-col gap-4 p-5 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex gap-4">
              <span className="grid size-11 shrink-0 place-items-center rounded-xl bg-brand-50 text-brand-600">
                <UserPlus className="size-5" />
              </span>
              <div>
                <p className="font-semibold text-slate-900">
                  {avatarSlot.name} · {formatMoney(avatarSlot.priceCents, avatarSlot.currency)}
                </p>
                <p className="text-sm text-slate-500">{avatarSlot.description}</p>
                <p className="mt-1 text-xs text-slate-400">You currently have {user.avatarSlots} slot{user.avatarSlots === 1 ? '' : 's'}.</p>
              </div>
            </div>
            <Button variant="secondary" loading={buying === avatarSlot.id} disabled={Boolean(buying)} onClick={() => buy(avatarSlot.id)}>
              Buy avatar slot
            </Button>
          </Card>
        )}
      </section>

      <Card className="mt-10">
        <CardHeader title="Payment history" icon={CreditCard} />
        <DataTable
          loading={history.loading}
          rows={history.data?.items}
          empty="No payments yet."
          columns={[
            { key: 'createdAt', header: 'Date', className: 'whitespace-nowrap text-slate-500', render: (r) => formatDateTime(r.createdAt) },
            { key: 'packageName', header: 'Item', render: (r) => <span className="font-medium text-slate-800">{r.packageName}</span> },
            { key: 'amount', header: 'Amount', render: (r) => formatMoney(r.amountCents, r.currency) },
            { key: 'provider', header: 'Provider', render: (r) => <span className="capitalize">{r.provider}</span> },
            { key: 'status', header: 'Status', render: (r) => <StatusBadge kind="payment" status={r.status} /> },
          ]}
        />
        <Pagination pagination={history.data?.pagination} onPage={setPage} />
      </Card>

      <Modal
        open={Boolean(planTarget)}
        onClose={() => setPlanTarget(null)}
        title={`Switch to ${planTarget?.name}?`}
        size="sm"
        footer={
          <>
            <Button variant="secondary" onClick={() => setPlanTarget(null)}>
              Cancel
            </Button>
            <Button onClick={switchPlan} loading={switching}>
              Switch plan
            </Button>
          </>
        }
      >
        <div className="space-y-3 text-sm text-slate-600">
          <p>
            New videos will use the <strong className="text-slate-900">{planTarget?.name}</strong> rate of {planTarget?.creditsPerMinute} credits per minute. Existing videos and
            widgets are unaffected.
          </p>
          {planTarget?.id === 'STARTER' && (
            <InlineAlert tone="warning" icon={Info}>
              Starter uses stock avatars only — your digital twin stays saved but cannot be used until you switch back to Growth.
            </InlineAlert>
          )}
          {planTarget?.id === 'GROWTH' && (
            <InlineAlert tone="brand" icon={Info}>
              Growth videos use your own digital twin, which needs a custom avatar slot and approved consent.
            </InlineAlert>
          )}
        </div>
      </Modal>
    </div>
  );
}
