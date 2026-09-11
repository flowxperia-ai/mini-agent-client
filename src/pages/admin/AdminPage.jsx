import { useState } from 'react';
import { Activity, AlertTriangle, CreditCard, Film, RefreshCw, Search, ShieldCheck, Users, Webhook, XCircle } from 'lucide-react';
import { PageHeader } from '../../components/PageHeader.jsx';
import { StatusBadge } from '../../components/StatusBadge.jsx';
import { Badge } from '../../components/ui/Badge.jsx';
import { Button } from '../../components/ui/Button.jsx';
import { Card, CardHeader } from '../../components/ui/Card.jsx';
import { DataTable, Pagination } from '../../components/ui/DataTable.jsx';
import { Input, Select, Textarea } from '../../components/ui/Field.jsx';
import { Modal } from '../../components/ui/Modal.jsx';
import { ErrorState, InlineAlert, Skeleton } from '../../components/ui/States.jsx';
import { useApi } from '../../hooks/useApi.js';
import { useDocumentTitle } from '../../hooks/useDocumentTitle.js';
import { adminService } from '../../services/index.js';
import { toast } from '../../store/toastStore.js';
import { cn } from '../../utils/cn.js';
import { formatDateTime, formatMoney, formatNumber, formatRelative } from '../../utils/format.js';

const TABS = [
  { key: 'overview', label: 'Overview', icon: Activity },
  { key: 'users', label: 'Users', icon: Users },
  { key: 'generations', label: 'Generations', icon: Film },
  { key: 'webhooks', label: 'Webhooks', icon: Webhook },
  { key: 'payments', label: 'Payments', icon: CreditCard },
  { key: 'avatars', label: 'Avatars', icon: ShieldCheck },
];

const mono = (v) => (v ? <code className="rounded bg-slate-100 px-1.5 py-0.5 text-[11px] text-slate-600">{v}</code> : '—');

function Overview() {
  const { data, error, refetch } = useApi(() => adminService.overview(), []);
  if (error) return <ErrorState error={error} onRetry={refetch} />;
  if (!data) return <Skeleton className="h-48 rounded-2xl" />;
  const cards = [
    { label: 'Users', value: formatNumber(data.users), sub: Object.entries(data.usersByPlan).map(([k, v]) => `${v} ${k.toLowerCase()}`).join(' · ') },
    { label: 'Completed videos', value: formatNumber(data.videosByStatus.COMPLETED ?? 0), sub: `${(data.videosByStatus.PROCESSING ?? 0) + (data.videosByStatus.QUEUED ?? 0)} in progress` },
    { label: 'Failed (24h)', value: formatNumber(data.failedLast24h), sub: `${data.videosByStatus.FAILED ?? 0} failed all time`, warn: data.failedLast24h > 0 },
    { label: 'Webhook failures', value: formatNumber(data.webhookFailures), sub: 'Events needing attention', warn: data.webhookFailures > 0 },
    { label: 'Revenue', value: data.revenue.map((r) => formatMoney(r.totalCents, r.currency)).join(' + ') || '$0', sub: `${data.revenue.reduce((n, r) => n + r.payments, 0)} completed payments` },
    { label: 'Credits outstanding', value: formatNumber(data.creditsOutstanding), sub: 'Sum of all balances' },
    { label: 'Pending consent', value: formatNumber(data.pendingConsent), sub: 'Digital twins awaiting approval' },
  ];
  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {cards.map((c) => (
        <Card key={c.label} className={cn('p-5', c.warn && 'ring-1 ring-rose-200')}>
          <p className="text-sm text-slate-500">{c.label}</p>
          <p className={cn('mt-2 text-2xl font-bold tracking-tight', c.warn && 'text-rose-600')}>{c.value}</p>
          <p className="mt-1 text-xs text-slate-500">{c.sub}</p>
        </Card>
      ))}
    </div>
  );
}

function AdjustCreditsModal({ user, onClose, onDone }) {
  const [amount, setAmount] = useState('');
  const [reason, setReason] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState(null);
  const submit = async () => {
    setBusy(true);
    setError(null);
    try {
      const { balance } = await adminService.adjustCredits(user.id, { amount: Number(amount), reason });
      toast.success(`Balance is now ${balance} credits`);
      onDone();
      onClose();
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  };
  return (
    <Modal
      open={Boolean(user)}
      onClose={onClose}
      title={`Adjust credits — ${user?.email}`}
      description={`Current balance: ${user?.credits} credits`}
      size="sm"
      footer={
        <>
          <Button variant="secondary" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={submit} loading={busy} disabled={!amount || reason.trim().length < 3}>
            Record adjustment
          </Button>
        </>
      }
    >
      <div className="space-y-4">
        <Input label="Amount" type="number" placeholder="e.g. 50 or -20" value={amount} onChange={(e) => setAmount(e.target.value)} hint="Positive adds credits, negative removes them. Balances cannot go below zero." />
        <Textarea label="Reason" rows={3} value={reason} onChange={(e) => setReason(e.target.value)} placeholder="Goodwill credit for failed render" hint="Recorded on the immutable ledger." />
        {error && <p className="text-sm font-medium text-rose-600">{error}</p>}
      </div>
    </Modal>
  );
}

function LedgerModal({ user, onClose }) {
  const { data, loading } = useApi(() => adminService.userLedger(user.id, { limit: 50 }), [user?.id], { enabled: Boolean(user) });
  return (
    <Modal open={Boolean(user)} onClose={onClose} title={`Ledger — ${user?.email}`} size="xl">
      {data?.reconciliation && (
        <InlineAlert tone={data.reconciliation.consistent ? 'success' : 'danger'} icon={data.reconciliation.consistent ? ShieldCheck : AlertTriangle} className="mb-4">
          Balance {data.reconciliation.balance} · ledger sum {data.reconciliation.ledgerTotal} — {data.reconciliation.consistent ? 'consistent' : 'MISMATCH, investigate'}
        </InlineAlert>
      )}
      <DataTable
        loading={loading}
        rows={data?.items}
        columns={[
          { key: 'createdAt', header: 'Date', render: (r) => formatDateTime(r.createdAt) },
          { key: 'type', header: 'Type', render: (r) => <Badge>{r.type}</Badge> },
          { key: 'description', header: 'Description' },
          { key: 'amount', header: 'Amount', className: 'text-right tabular-nums', render: (r) => (r.amount > 0 ? `+${r.amount}` : r.amount) },
          { key: 'balanceAfter', header: 'Balance', className: 'text-right tabular-nums' },
        ]}
      />
    </Modal>
  );
}

function UsersTab() {
  const [q, setQ] = useState('');
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [adjusting, setAdjusting] = useState(null);
  const [ledger, setLedger] = useState(null);
  const { data, loading, error, refetch } = useApi(() => adminService.users({ page, limit: 20, ...(search ? { q: search } : {}) }), [page, search]);
  if (error) return <ErrorState error={error} onRetry={refetch} />;
  return (
    <Card>
      <CardHeader
        title="Users"
        actions={
          <form
            onSubmit={(e) => {
              e.preventDefault();
              setSearch(q);
              setPage(1);
            }}
          >
            <Input icon={Search} placeholder="Search name or email" value={q} onChange={(e) => setQ(e.target.value)} className="w-64" aria-label="Search users" />
          </form>
        }
      />
      <DataTable
        loading={loading}
        rows={data?.items}
        columns={[
          { key: 'email', header: 'User', render: (u) => (<div><p className="font-medium text-slate-900">{u.name}</p><p className="text-xs text-slate-500">{u.email}</p></div>) },
          { key: 'plan', header: 'Plan', render: (u) => (<span className="flex gap-1"><Badge tone={u.plan === 'GROWTH' ? 'brand' : 'gray'}>{u.plan}</Badge>{u.role === 'admin' && <Badge tone="dark">admin</Badge>}</span>) },
          { key: 'credits', header: 'Credits', className: 'tabular-nums font-semibold', render: (u) => formatNumber(u.credits) },
          { key: 'videos', header: 'Videos', className: 'tabular-nums' },
          { key: 'avatarSlots', header: 'Slots', className: 'tabular-nums' },
          { key: 'createdAt', header: 'Joined', render: (u) => formatRelative(u.createdAt) },
          {
            key: 'actions',
            header: '',
            className: 'text-right',
            render: (u) => (
              <div className="flex justify-end gap-1">
                <Button size="xs" variant="ghost" onClick={() => setLedger(u)}>Ledger</Button>
                <Button size="xs" variant="subtle" onClick={() => setAdjusting(u)}>Adjust credits</Button>
              </div>
            ),
          },
        ]}
      />
      <Pagination pagination={data?.pagination} onPage={setPage} />
      <AdjustCreditsModal user={adjusting} onClose={() => setAdjusting(null)} onDone={() => refetch({ silent: true })} />
      {ledger && <LedgerModal user={ledger} onClose={() => setLedger(null)} />}
    </Card>
  );
}

function GenerationsTab() {
  const [status, setStatus] = useState('all');
  const [page, setPage] = useState(1);
  const { data, loading, error, refetch } = useApi(() => adminService.generations({ status, page, limit: 20 }), [status, page], {
    poll: (d) => (d?.items.some((g) => ['QUEUED', 'PROCESSING'].includes(g.status)) ? 5000 : null),
  });
  const act = async (fn, id, message) => {
    try {
      await fn(id);
      toast.success(message);
      refetch({ silent: true });
    } catch (err) {
      toast.fromError(err);
    }
  };
  if (error) return <ErrorState error={error} onRetry={refetch} />;
  return (
    <Card>
      <CardHeader
        title="Video generations"
        description="Failed jobs, stuck jobs and credit state for every generation."
        actions={
          <Select
            aria-label="Status"
            value={status}
            onChange={(e) => {
              setStatus(e.target.value);
              setPage(1);
            }}
            className="w-44"
            options={['all', 'QUEUED', 'PROCESSING', 'COMPLETED', 'FAILED', 'CANCELLED'].map((s) => ({ value: s, label: s === 'all' ? 'All statuses' : s }))}
          />
        }
      />
      <DataTable
        loading={loading}
        rows={data?.items}
        columns={[
          { key: 'title', header: 'Video', render: (g) => (<div><p className="font-medium text-slate-900">{g.title}</p><p className="text-xs text-slate-500">{g.user?.email} · {g.avatar?.name}</p></div>) },
          { key: 'status', header: 'Status', render: (g) => (<div className="space-y-1"><StatusBadge status={g.status} />{g.providerStatus && <p className="text-[11px] text-slate-400">provider: {g.providerStatus}</p>}</div>) },
          { key: 'credits', header: 'Credits', render: (g) => (<span className="text-xs tabular-nums">{g.creditsCharged}/{g.creditsReserved} · <span className="text-slate-500">{g.creditState}</span></span>) },
          { key: 'heygen', header: 'Provider job', render: (g) => mono(g.heygenGenerationId) },
          { key: 'error', header: 'Error', render: (g) => (g.error?.message ? <span className="text-xs text-rose-600">{g.error.message}</span> : '—') },
          { key: 'createdAt', header: 'Created', render: (g) => formatRelative(g.createdAt) },
          {
            key: 'actions',
            header: '',
            className: 'text-right',
            render: (g) =>
              ['QUEUED', 'PROCESSING'].includes(g.status) ? (
                <div className="flex justify-end gap-1">
                  <Button size="xs" variant="ghost" icon={RefreshCw} onClick={() => act(adminService.resyncGeneration, g.id, 'Status re-synced')}>Resync</Button>
                  <Button size="xs" variant="danger-ghost" icon={XCircle} onClick={() => act(adminService.cancelGeneration, g.id, 'Cancelled and credits released')}>Cancel</Button>
                </div>
              ) : null,
          },
        ]}
      />
      <Pagination pagination={data?.pagination} onPage={setPage} />
    </Card>
  );
}

function WebhooksTab() {
  const [status, setStatus] = useState('all');
  const [page, setPage] = useState(1);
  const { data, loading, error, refetch } = useApi(() => adminService.webhookEvents({ status, page, limit: 25 }), [status, page]);
  if (error) return <ErrorState error={error} onRetry={refetch} />;
  const tone = { PROCESSED: 'green', FAILED: 'red', IGNORED: 'gray', RECEIVED: 'amber' };
  return (
    <Card>
      <CardHeader
        title="Webhook events"
        description="Every inbound HeyGen and payment webhook. Duplicates are recorded once and never re-applied."
        actions={
          <Select aria-label="Status" value={status} onChange={(e) => { setStatus(e.target.value); setPage(1); }} className="w-40"
            options={['all', 'PROCESSED', 'FAILED', 'IGNORED', 'RECEIVED'].map((s) => ({ value: s, label: s === 'all' ? 'All' : s }))} />
        }
      />
      <DataTable
        loading={loading}
        rows={data?.items}
        columns={[
          { key: 'provider', header: 'Provider', render: (e) => <Badge>{e.provider}</Badge> },
          { key: 'type', header: 'Type', render: (e) => mono(e.type) },
          { key: 'eventId', header: 'Event id', render: (e) => <span className="block max-w-56 truncate text-xs text-slate-500" title={e.eventId}>{e.eventId}</span> },
          { key: 'status', header: 'Status', render: (e) => <Badge tone={tone[e.status]} dot>{e.status}</Badge> },
          { key: 'attempts', header: 'Attempts', className: 'tabular-nums' },
          { key: 'error', header: 'Error', render: (e) => (e.error ? <span className="text-xs text-rose-600">{e.error}</span> : '—') },
          { key: 'createdAt', header: 'Received', render: (e) => formatDateTime(e.createdAt) },
        ]}
      />
      <Pagination pagination={data?.pagination} onPage={setPage} />
    </Card>
  );
}

function PaymentsTab() {
  const [page, setPage] = useState(1);
  const { data, loading, error, refetch } = useApi(() => adminService.payments({ page, limit: 25 }), [page]);
  if (error) return <ErrorState error={error} onRetry={refetch} />;
  return (
    <Card>
      <CardHeader title="Payments" />
      <DataTable
        loading={loading}
        rows={data?.items}
        columns={[
          { key: 'user', header: 'User' },
          { key: 'packageName', header: 'Item' },
          { key: 'amount', header: 'Amount', render: (p) => formatMoney(p.amountCents, p.currency) },
          { key: 'provider', header: 'Provider', render: (p) => <Badge>{p.provider}</Badge> },
          { key: 'status', header: 'Status', render: (p) => <StatusBadge kind="payment" status={p.status} /> },
          { key: 'session', header: 'Session', render: (p) => mono(p.providerSessionId) },
          { key: 'createdAt', header: 'Created', render: (p) => formatDateTime(p.createdAt) },
        ]}
      />
      <Pagination pagination={data?.pagination} onPage={setPage} />
    </Card>
  );
}

function AvatarsTab() {
  const [page, setPage] = useState(1);
  const [syncing, setSyncing] = useState(false);
  const { data, loading, error, refetch } = useApi(() => adminService.avatars({ page, limit: 25 }), [page]);
  const sync = async () => {
    setSyncing(true);
    try {
      const res = await adminService.syncStock();
      toast.success(res.synced ? `Synced ${res.count} stock avatars` : 'Stock library already up to date');
    } catch (err) {
      toast.fromError(err);
    } finally {
      setSyncing(false);
    }
  };
  if (error) return <ErrorState error={error} onRetry={refetch} />;
  return (
    <Card>
      <CardHeader title="Digital twins" description="Consent and training status of every Growth avatar." actions={<Button size="sm" variant="secondary" icon={RefreshCw} loading={syncing} onClick={sync}>Sync stock library</Button>} />
      <DataTable
        loading={loading}
        rows={data?.items}
        columns={[
          { key: 'name', header: 'Avatar', render: (a) => <span className="font-medium text-slate-900">{a.name}</span> },
          { key: 'user', header: 'Owner' },
          { key: 'consent', header: 'Consent', render: (a) => <StatusBadge kind="consent" status={a.consentStatus} /> },
          { key: 'training', header: 'Training', render: (a) => <Badge>{a.trainingStatus ?? '—'}</Badge> },
          { key: 'group', header: 'Provider group', render: (a) => mono(a.providerGroupId) },
          { key: 'lastSyncedAt', header: 'Last sync', render: (a) => formatRelative(a.lastSyncedAt) },
        ]}
      />
      <Pagination pagination={data?.pagination} onPage={setPage} />
    </Card>
  );
}

const PANELS = { overview: Overview, users: UsersTab, generations: GenerationsTab, webhooks: WebhooksTab, payments: PaymentsTab, avatars: AvatarsTab };

export default function AdminPage() {
  useDocumentTitle('Admin');
  const [tab, setTab] = useState('overview');
  const Panel = PANELS[tab];
  return (
    <div className="animate-rise">
      <PageHeader eyebrow="Operations" title="Admin" description="Users, credits, generation jobs, webhooks and payments. Every credit change goes through the ledger." />
      <div className="mb-6 flex gap-1 overflow-x-auto rounded-2xl bg-white p-1 shadow-card ring-1 ring-slate-200/80" role="tablist">
        {TABS.map((t) => (
          <button
            key={t.key}
            type="button"
            role="tab"
            aria-selected={tab === t.key}
            onClick={() => setTab(t.key)}
            className={cn(
              'flex items-center gap-2 rounded-xl px-3.5 py-2 text-sm font-medium whitespace-nowrap transition',
              tab === t.key ? 'bg-slate-900 text-white' : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900',
            )}
          >
            <t.icon className="size-4" /> {t.label}
          </button>
        ))}
      </div>
      <Panel />
    </div>
  );
}
