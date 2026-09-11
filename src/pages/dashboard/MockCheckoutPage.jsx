import { useState } from 'react';
import { CreditCard, FlaskConical, Lock } from 'lucide-react';
import { useNavigate, useSearchParams } from 'react-router';
import { StatusBadge } from '../../components/StatusBadge.jsx';
import { Button } from '../../components/ui/Button.jsx';
import { Card, CardBody } from '../../components/ui/Card.jsx';
import { ErrorState, LoadingState } from '../../components/ui/States.jsx';
import { useApi } from '../../hooks/useApi.js';
import { useDocumentTitle } from '../../hooks/useDocumentTitle.js';
import { devService } from '../../services/index.js';
import { toast } from '../../store/toastStore.js';
import { formatMoney } from '../../utils/format.js';

/**
 * Stand-in for a hosted payment page in mock mode. Collects no card data. "Paying" makes the
 * API emit a signed mock webhook, so credits still arrive through the webhook pipeline.
 */
export default function MockCheckoutPage() {
  useDocumentTitle('Mock checkout');
  const [params] = useSearchParams();
  const session = params.get('session');
  const navigate = useNavigate();
  const [busy, setBusy] = useState(null);
  const { data, error, loading } = useApi(() => devService.getMockCheckout(session), [session], { enabled: Boolean(session) });

  const complete = async (outcome) => {
    setBusy(outcome);
    try {
      await devService.completeMockCheckout(session, outcome);
      if (outcome === 'success') navigate('/dashboard/billing?checkout=success', { replace: true });
      else {
        toast.error('Simulated card decline — no credits were added.');
        navigate('/dashboard/billing', { replace: true });
      }
    } catch (err) {
      toast.fromError(err);
      setBusy(null);
    }
  };

  if (!session) return <ErrorState error={{ message: 'Missing checkout session.' }} />;
  if (error) return <ErrorState error={error} />;
  if (loading || !data) return <LoadingState />;
  const { payment } = data;
  const settled = payment.status !== 'PENDING';

  return (
    <div className="mx-auto max-w-md animate-rise py-6">
      <div className="mb-4 flex items-center justify-center gap-2 rounded-full bg-amber-50 px-4 py-1.5 text-xs font-semibold text-amber-900 ring-1 ring-amber-200">
        <FlaskConical className="size-3.5" /> Mock payment provider — no real money moves
      </div>
      <Card>
        <CardBody className="space-y-6">
          <div>
            <p className="text-sm text-slate-500">Pay Website Mini Agent</p>
            <p className="mt-1 text-3xl font-bold tracking-tight">{formatMoney(payment.amountCents, payment.currency)}</p>
            <p className="mt-1 text-sm text-slate-600">{payment.packageName}</p>
          </div>
          <div className="flex items-center justify-between rounded-xl bg-slate-50 p-4 ring-1 ring-slate-200">
            <div className="flex items-center gap-3">
              <CreditCard className="size-5 text-slate-500" />
              <div>
                <p className="text-sm font-semibold text-slate-800">Test card •••• 4242</p>
                <p className="text-xs text-slate-500">Simulated — nothing to enter</p>
              </div>
            </div>
            <StatusBadge kind="payment" status={payment.status} />
          </div>
          {settled ? (
            <Button className="w-full" to="/dashboard/billing">
              Back to billing
            </Button>
          ) : (
            <div className="space-y-2">
              <Button size="lg" className="w-full" icon={Lock} loading={busy === 'success'} disabled={Boolean(busy)} onClick={() => complete('success')}>
                Pay {formatMoney(payment.amountCents, payment.currency)}
              </Button>
              <Button variant="secondary" className="w-full" loading={busy === 'failed'} disabled={Boolean(busy)} onClick={() => complete('failed')}>
                Simulate a declined card
              </Button>
              <Button variant="ghost" className="w-full" to="/dashboard/billing?checkout=cancelled">
                Cancel
              </Button>
            </div>
          )}
        </CardBody>
      </Card>
    </div>
  );
}
