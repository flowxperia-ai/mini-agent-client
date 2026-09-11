import { useState } from 'react';
import { ArrowDownRight, ArrowUpRight, Coins, Hourglass, Plus, ReceiptText, TrendingUp } from 'lucide-react';
import { PageHeader } from '../../components/PageHeader.jsx';
import { Badge } from '../../components/ui/Badge.jsx';
import { Button } from '../../components/ui/Button.jsx';
import { Card, CardHeader } from '../../components/ui/Card.jsx';
import { DataTable, Pagination } from '../../components/ui/DataTable.jsx';
import { Select } from '../../components/ui/Field.jsx';
import { ErrorState, Skeleton } from '../../components/ui/States.jsx';
import { useApi } from '../../hooks/useApi.js';
import { useDocumentTitle } from '../../hooks/useDocumentTitle.js';
import { creditService } from '../../services/index.js';
import { cn } from '../../utils/cn.js';
import { formatDateTime, formatNumber } from '../../utils/format.js';

const TYPE_META = {
  PURCHASE: { tone: 'green', label: 'Purchase' },
  RESERVATION: { tone: 'amber', label: 'Reserved' },
  RELEASE: { tone: 'blue', label: 'Released' },
  GENERATION: { tone: 'brand', label: 'Generation' },
  REFUND: { tone: 'red', label: 'Refund' },
  ADJUSTMENT: { tone: 'gray', label: 'Adjustment' },
};

function Stat({ icon: Icon, label, value, hint, accent }) {
  return (
    <Card className={cn('p-5', accent && 'bg-gradient-to-br from-brand-600 to-brand-800 text-white ring-0')}>
      <p className={cn('flex items-center gap-1.5 text-sm font-medium', accent ? 'text-white/75' : 'text-slate-500')}>
        <Icon className="size-4" /> {label}
      </p>
      <p className="mt-2 text-3xl font-bold tracking-tight tabular-nums">{value}</p>
      {hint && <p className={cn('mt-1 text-xs', accent ? 'text-white/70' : 'text-slate-500')}>{hint}</p>}
    </Card>
  );
}

export default function CreditsPage() {
  useDocumentTitle('Credits');
  const [page, setPage] = useState(1);
  const [type, setType] = useState('');
  const summary = useApi(() => creditService.summary(), []);
  const ledger = useApi(() => creditService.ledger({ page, limit: 15, ...(type ? { type } : {}) }), [page, type]);

  const s = summary.data;
  return (
    <div className="animate-rise">
      <PageHeader
        title="Credits"
        description="Your balance and the complete, immutable history of every credit movement."
        actions={
          <Button to="/dashboard/billing" icon={Plus}>
            Buy credits
          </Button>
        }
      />

      {summary.error ? (
        <ErrorState error={summary.error} onRetry={summary.refetch} />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {!s ? (
            Array.from({ length: 4 }, (_, i) => <Skeleton key={i} className="h-32 rounded-2xl" />)
          ) : (
            <>
              <Stat accent icon={Coins} label="Available credits" value={formatNumber(s.available)} hint={`${s.pricing.creditsPerMinute} credits per minute of video`} />
              <Stat icon={Hourglass} label="Reserved" value={formatNumber(s.reserved)} hint="Held for videos being generated" />
              <Stat icon={TrendingUp} label="Purchased" value={formatNumber(s.lifetimePurchased)} hint="All time" />
              <Stat icon={ReceiptText} label="Spent on videos" value={formatNumber(s.lifetimeSpent)} hint={`A 30-second video costs ${s.pricing.exampleThirtySeconds} credits`} />
            </>
          )}
        </div>
      )}

      <Card className="mt-6">
        <CardHeader
          title="Transaction history"
          description="Credits are reserved when a video starts, then released and charged at the actual length when it finishes."
          actions={
            <Select
              aria-label="Filter by type"
              value={type}
              onChange={(e) => {
                setType(e.target.value);
                setPage(1);
              }}
              className="w-44"
              options={[{ value: '', label: 'All types' }, ...Object.entries(TYPE_META).map(([value, m]) => ({ value, label: m.label }))]}
            />
          }
        />
        {ledger.error ? (
          <div className="p-5">
            <ErrorState error={ledger.error} onRetry={ledger.refetch} />
          </div>
        ) : (
          <>
            <DataTable
              loading={ledger.loading}
              rows={ledger.data?.items}
              empty="No credit transactions yet."
              columns={[
                { key: 'createdAt', header: 'Date', className: 'whitespace-nowrap text-slate-500', render: (r) => formatDateTime(r.createdAt) },
                { key: 'description', header: 'Description', render: (r) => <span className="font-medium text-slate-800">{r.description}</span> },
                { key: 'type', header: 'Type', render: (r) => <Badge tone={TYPE_META[r.type]?.tone}>{TYPE_META[r.type]?.label ?? r.type}</Badge> },
                {
                  key: 'amount',
                  header: 'Amount',
                  className: 'text-right',
                  render: (r) => (
                    <span className={cn('inline-flex items-center justify-end gap-1 font-semibold tabular-nums', r.amount > 0 ? 'text-emerald-600' : r.amount < 0 ? 'text-slate-900' : 'text-slate-400')}>
                      {r.amount > 0 ? <ArrowUpRight className="size-3.5" /> : r.amount < 0 ? <ArrowDownRight className="size-3.5" /> : null}
                      {r.amount > 0 ? '+' : ''}
                      {formatNumber(r.amount)}
                    </span>
                  ),
                },
                { key: 'balanceAfter', header: 'Balance', className: 'text-right tabular-nums text-slate-500', render: (r) => formatNumber(r.balanceAfter) },
              ]}
            />
            <Pagination pagination={ledger.data?.pagination} onPage={setPage} />
          </>
        )}
      </Card>
    </div>
  );
}
