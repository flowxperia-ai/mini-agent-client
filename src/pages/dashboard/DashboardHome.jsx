import { ArrowRight, CheckCircle2, Circle, Coins, CreditCard, Film, Plus, Sparkles, UserRound } from 'lucide-react';
import { Link } from 'react-router';
import { PageHeader } from '../../components/PageHeader.jsx';
import { StatusBadge } from '../../components/StatusBadge.jsx';
import { VideoThumb } from '../../components/VideoCard.jsx';
import { Button } from '../../components/ui/Button.jsx';
import { Card, CardHeader } from '../../components/ui/Card.jsx';
import { EmptyState, ErrorState, Skeleton } from '../../components/ui/States.jsx';
import { useApi } from '../../hooks/useApi.js';
import { useDocumentTitle } from '../../hooks/useDocumentTitle.js';
import { avatarService, userService } from '../../services/index.js';
import { cn } from '../../utils/cn.js';
import { formatDuration, formatNumber, formatRelative } from '../../utils/format.js';

function greeting() {
  const h = new Date().getHours();
  return h < 12 ? 'Good morning' : h < 18 ? 'Good afternoon' : 'Good evening';
}

function StatCard({ icon: Icon, label, value, sub, to, tone = 'brand' }) {
  const tones = { brand: 'bg-brand-50 text-brand-600', green: 'bg-emerald-50 text-emerald-600', amber: 'bg-amber-50 text-amber-600', slate: 'bg-slate-100 text-slate-600' };
  const body = (
    <Card className="h-full p-5 transition hover:shadow-float">
      <div className="flex items-center justify-between">
        <p className="text-sm font-medium text-slate-500">{label}</p>
        <span className={cn('grid size-9 place-items-center rounded-xl', tones[tone])}>
          <Icon className="size-[18px]" />
        </span>
      </div>
      <div className="mt-3 text-2xl font-bold tracking-tight text-slate-900">{value}</div>
      {sub && <div className="mt-1 text-[13px] text-slate-500">{sub}</div>}
    </Card>
  );
  return to ? <Link to={to} className="block">{body}</Link> : body;
}

function avatarStatus(plan, avatars) {
  const list = avatars?.avatars;
  if (!list) return { value: '—', sub: null, tone: 'slate' };
  if (plan === 'STARTER') return { value: `${list.length} avatars`, sub: 'Stock library ready to use', tone: 'green' };
  const twin = list[0];
  if (!twin) return { value: 'Not created', sub: 'Create your digital twin', tone: 'amber' };
  if (twin.isReady) return { value: 'Ready', sub: `${twin.name} · consent approved`, tone: 'green' };
  return { value: <StatusBadge kind="consent" status={twin.consent?.status} size="md" />, sub: `${twin.name} · finish consent to generate`, tone: 'amber' };
}

export default function DashboardHome() {
  useDocumentTitle('Dashboard');
  const { data, error, refetch } = useApi(() => userService.dashboard(), [], {
    poll: (d) => (d?.stats?.videosProcessing ? 5000 : null),
  });
  const { data: avatars } = useApi(() => avatarService.list(), []);

  if (error) return <ErrorState error={error} onRetry={refetch} />;

  const user = data?.user;
  const status = avatarStatus(user?.plan, avatars);
  const hasCredits = (data?.credits?.available ?? 0) + (data?.credits?.lifetimeSpent ?? 0) > 0;
  const avatarReady = user?.plan === 'STARTER' ? true : Boolean(avatars?.avatars?.some((a) => a.isReady));
  const hasVideo = (data?.stats?.videosGenerated ?? 0) > 0;
  const hasWidget = data?.recentVideos?.some((v) => v.widgets.length > 0);
  const checklist = [
    { done: hasCredits, label: 'Buy credits', to: '/dashboard/billing' },
    { done: avatarReady, label: user?.plan === 'GROWTH' ? 'Create your digital twin & approve consent' : 'Pick a stock avatar', to: user?.plan === 'GROWTH' ? '/dashboard/avatars' : '/dashboard/create' },
    { done: hasVideo, label: 'Generate your first video', to: '/dashboard/create' },
    { done: hasWidget, label: 'Embed the widget on your site', to: '/dashboard/videos' },
  ];
  const showChecklist = data && checklist.some((c) => !c.done);

  return (
    <div className="animate-rise">
      <PageHeader
        eyebrow="Overview"
        title={user ? `${greeting()}, ${user.name.split(' ')[0]}` : 'Dashboard'}
        description="Create spokesperson videos, embed them on your site and keep an eye on your credits."
        actions={
          <Button to="/dashboard/create" icon={Plus} size="md">
            Create video
          </Button>
        }
      />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {!data ? (
          Array.from({ length: 4 }, (_, i) => <Skeleton key={i} className="h-[124px] rounded-2xl" />)
        ) : (
          <>
            <StatCard
              icon={Sparkles}
              label="Current plan"
              value={data.plan.name}
              sub={data.plan.tagline}
              to="/dashboard/billing"
            />
            <StatCard
              icon={Coins}
              label="Available credits"
              value={formatNumber(data.credits.available)}
              sub={data.credits.reserved ? `${formatNumber(data.credits.reserved)} reserved in progress` : `${data.plan.creditsPerMinute} credits per video minute`}
              to="/dashboard/credits"
              tone={data.credits.available < 20 ? 'amber' : 'brand'}
            />
            <StatCard
              icon={Film}
              label="Videos generated"
              value={formatNumber(data.stats.videosGenerated)}
              sub={data.stats.videosProcessing ? `${data.stats.videosProcessing} generating now` : 'All caught up'}
              to="/dashboard/videos"
              tone="green"
            />
            <StatCard icon={UserRound} label="Avatar status" value={status.value} sub={status.sub} to="/dashboard/avatars" tone={status.tone} />
          </>
        )}
      </div>

      <div className={cn('mt-6 grid gap-6', showChecklist && 'lg:grid-cols-[1.6fr_1fr]')}>
        <Card>
          <CardHeader
            title="Recent videos"
            description="Your latest generations"
            actions={
              <Button to="/dashboard/videos" variant="ghost" size="sm" iconRight={ArrowRight}>
                View all
              </Button>
            }
          />
          {!data ? (
            <div className="space-y-3 p-5">
              {Array.from({ length: 3 }, (_, i) => (
                <Skeleton key={i} className="h-16" />
              ))}
            </div>
          ) : data.recentVideos.length === 0 ? (
            <div className="p-5">
              <EmptyState
                icon={Film}
                title="No videos yet"
                description="Your spokesperson videos will appear here once you generate them."
                action={
                  <Button to="/dashboard/create" icon={Plus}>
                    Create your first video
                  </Button>
                }
              />
            </div>
          ) : (
            <ul className="divide-y divide-slate-100">
              {data.recentVideos.map((video) => (
                <li key={video.id}>
                  <Link to={`/dashboard/videos/${video.id}`} className="flex items-center gap-4 px-5 py-3.5 transition hover:bg-slate-50 sm:px-6">
                    <VideoThumb video={video} className="w-11 shrink-0 rounded-lg" />
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-semibold text-slate-900">{video.title}</p>
                      <p className="truncate text-xs text-slate-500">
                        {video.avatar?.name} · {formatDuration(video.duration ?? video.estimatedDuration)} · {formatRelative(video.createdAt)}
                      </p>
                    </div>
                    <StatusBadge status={video.status} />
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </Card>

        {showChecklist && (
          <Card className="h-fit">
            <CardHeader title="Get set up" description={`${checklist.filter((c) => c.done).length} of ${checklist.length} complete`} icon={CreditCard} />
            <ul className="space-y-1 p-3">
              {checklist.map((item) => (
                <li key={item.label}>
                  <Link to={item.to} className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm transition hover:bg-slate-50">
                    {item.done ? <CheckCircle2 className="size-5 text-emerald-500" /> : <Circle className="size-5 text-slate-300" />}
                    <span className={cn('flex-1', item.done ? 'text-slate-400 line-through' : 'font-medium text-slate-800')}>{item.label}</span>
                    {!item.done && <ArrowRight className="size-4 text-slate-400" />}
                  </Link>
                </li>
              ))}
            </ul>
          </Card>
        )}
      </div>
    </div>
  );
}
