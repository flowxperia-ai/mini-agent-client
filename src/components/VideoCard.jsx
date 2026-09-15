import { Code2, ExternalLink, Eye, MousePointerClick, Settings2, Sparkles, Trash2, UserRound } from 'lucide-react';
import { useNavigate } from 'react-router';
import { cn } from '../utils/cn.js';
import { formatDuration, formatRelative } from '../utils/format.js';
import { StatusBadge } from './StatusBadge.jsx';
import { Badge } from './ui/Badge.jsx';
import { Menu } from './ui/Menu.jsx';
import { ProgressBar } from './ui/ProgressBar.jsx';

export const STAGE_PROGRESS = { queued: 12, rendering: 55, finalizing: 90, ready: 100, failed: 100 };
export const STAGE_LABEL = {
  queued: 'Queued at the provider',
  rendering: 'Rendering your avatar video',
  finalizing: 'Saving to your library',
  ready: 'Ready',
  failed: 'Failed',
};

export function VideoThumb({ video, className }) {
  const src = video.thumbnailUrl ?? video.avatar?.thumbnailUrl;
  return (
    <div className={cn('relative aspect-[4/5] overflow-hidden bg-slate-100', className)}>
      {src ? (
        <img src={src} alt="" loading="lazy" className={cn('size-full object-cover', video.status !== 'COMPLETED' && 'opacity-70 saturate-50')} />
      ) : (
        <div className="grid size-full place-items-center text-slate-300">
          <UserRound className="size-12" />
        </div>
      )}
      {(video.status === 'QUEUED' || video.status === 'PROCESSING') && <div className="skeleton absolute inset-0 rounded-none opacity-40" />}
    </div>
  );
}

/**
 * Library tile with status, embed state and actions (preview, copy embed, edit widget, open, delete).
 */
export function VideoCard({ video, onCopyEmbed, onDelete, onMakePrimary }) {
  const navigate = useNavigate();
  const widget = video.widgets?.[0];
  // isPrimary reflects the account's ONE stable embed link — whether THIS video is what it
  // currently shows. A video can still have its own separate leftover widget (from before this
  // feature existed) without being primary, so this is deliberately not just "widget truthy".
  const isPrimary = video.isPrimary;
  const active = video.status === 'QUEUED' || video.status === 'PROCESSING';
  const open = () => navigate(`/dashboard/videos/${video.id}`);

  return (
    // No overflow-hidden here — it would clip the "..." menu's dropdown, which needs to render
    // outside the card's bounds. VideoThumb rounds its own top corners instead.
    <article className="group flex flex-col rounded-2xl bg-white shadow-card ring-1 ring-slate-200/80 transition hover:-translate-y-0.5 hover:shadow-float">
      <button type="button" onClick={open} className="relative block text-left" aria-label={`Open ${video.title}`}>
        <VideoThumb video={video} className="rounded-t-2xl" />
        <div className="absolute inset-x-0 top-0 flex items-start justify-between p-2.5">
          <StatusBadge status={video.status} />
          {video.duration || video.estimatedDuration ? (
            <span className="rounded-md bg-slate-950/70 px-1.5 py-0.5 text-[11px] font-semibold text-white tabular-nums backdrop-blur">
              {formatDuration(video.duration ?? video.estimatedDuration)}
            </span>
          ) : null}
        </div>
        {active && (
          <div className="absolute inset-x-3 bottom-3 rounded-xl bg-white/90 p-2.5 shadow-sm backdrop-blur">
            <p className="mb-1.5 text-[11px] font-medium text-slate-600">{STAGE_LABEL[video.stage]}</p>
            <ProgressBar value={STAGE_PROGRESS[video.stage]} size="sm" />
          </div>
        )}
      </button>

      <div className="flex flex-1 flex-col gap-2 p-3.5">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0">
            <h3 className="truncate text-sm font-semibold text-slate-900">{video.title}</h3>
            <p className="truncate text-xs text-slate-500">
              {video.avatar?.name ?? 'Avatar'} · {formatRelative(video.createdAt)}
            </p>
          </div>
          <Menu
            items={[
              { label: 'Preview', icon: Eye, onClick: open },
              video.status === 'COMPLETED' && !isPrimary && { label: 'Make primary (show on my site)', icon: Sparkles, onClick: () => onMakePrimary?.(video) },
              video.status === 'COMPLETED' && { label: 'Copy embed code', icon: Code2, onClick: () => onCopyEmbed?.(video) },
              widget && { label: 'Edit widget settings', icon: Settings2, onClick: () => navigate(`/dashboard/widgets/${widget.id}`) },
              video.videoUrl && { label: 'Open video file', icon: ExternalLink, onClick: () => window.open(video.videoUrl, '_blank', 'noopener') },
              { divider: true, key: 'd' },
              { label: 'Delete', icon: Trash2, danger: true, disabled: active, onClick: () => onDelete?.(video) },
            ]}
          />
        </div>
        <div className="mt-auto flex flex-wrap items-center gap-1.5">
          {video.ctaText && (
            <Badge tone="gray">
              <MousePointerClick className="size-3" /> {video.ctaText}
            </Badge>
          )}
          {isPrimary ? (
            <Badge tone={widget?.enabled ? 'green' : 'gray'} dot>
              {widget?.enabled ? 'Primary — live on site' : 'Primary (widget off)'}
            </Badge>
          ) : video.status === 'COMPLETED' ? (
            <Badge tone="amber">Not primary</Badge>
          ) : null}
        </div>
      </div>
    </article>
  );
}
