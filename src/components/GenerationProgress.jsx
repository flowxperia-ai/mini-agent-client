import { useEffect, useState } from 'react';
import { CheckCircle2, CircleDashed, Clapperboard, CloudUpload, Loader2, Timer, XCircle } from 'lucide-react';
import { cn } from '../utils/cn.js';
import { formatDuration } from '../utils/format.js';
import { ProgressBar } from './ui/ProgressBar.jsx';

const STAGES = [
  { key: 'queued', label: 'Queued', description: 'Submitted to the avatar provider', icon: CircleDashed },
  { key: 'rendering', label: 'Rendering', description: 'Generating your avatar video', icon: Clapperboard },
  { key: 'finalizing', label: 'Saving', description: 'Copying to secure storage & building captions', icon: CloudUpload },
  { key: 'ready', label: 'Ready', description: 'Your video is ready to embed', icon: CheckCircle2 },
];
const ORDER = STAGES.map((s) => s.key);

/**
 * Visual tracker for an asynchronous generation job. Progress within "rendering" is time-based
 * (providers do not report percentages) and eases toward 90% so it never looks stuck.
 */
export function GenerationProgress({ video }) {
  const [now, setNow] = useState(Date.now());
  useEffect(() => {
    const t = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(t);
  }, []);

  if (video.stage === 'failed') {
    return (
      <div className="rounded-2xl bg-rose-50 p-6 ring-1 ring-rose-200">
        <div className="flex items-start gap-3">
          <XCircle className="mt-0.5 size-6 shrink-0 text-rose-500" />
          <div>
            <p className="font-semibold text-rose-950">{video.status === 'CANCELLED' ? 'Generation cancelled' : 'Generation failed'}</p>
            <p className="mt-1 text-sm text-rose-800">{video.error?.message ?? 'The provider could not generate this video.'}</p>
            <p className="mt-2 text-sm font-medium text-rose-900">All {video.creditsReserved} reserved credits were returned to your balance.</p>
          </div>
        </div>
      </div>
    );
  }

  const index = ORDER.indexOf(video.stage);
  const elapsed = Math.max(0, (now - new Date(video.submittedAt ?? video.createdAt).getTime()) / 1000);
  const expected = Math.max(30, (video.estimatedDuration ?? 20) * 4);
  const renderShare = 1 - Math.exp(-elapsed / expected);
  const percent =
    video.stage === 'ready' ? 100 : video.stage === 'finalizing' ? 94 : video.stage === 'rendering' ? 20 + renderShare * 68 : 8 + Math.min(10, elapsed);

  return (
    <div className="rounded-2xl bg-surface p-6 shadow-card ring-1 ring-slate-200/80">
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-2.5">
          {video.stage === 'ready' ? <CheckCircle2 className="size-5 text-emerald-500" /> : <Loader2 className="size-5 animate-spin text-brand-600" />}
          <p className="font-semibold text-slate-900">{STAGES[index]?.description ?? 'Working…'}</p>
        </div>
        <span className="flex items-center gap-1 text-xs font-medium text-slate-500 tabular-nums">
          <Timer className="size-3.5" /> {formatDuration(elapsed)}
        </span>
      </div>
      <ProgressBar value={percent} className="mt-4" label="Generation progress" tone={video.stage === 'ready' ? 'green' : 'brand'} />
      <ol className="mt-5 grid grid-cols-4 gap-2">
        {STAGES.map((stage, i) => {
          const done = i < index || video.stage === 'ready';
          const active = i === index && video.stage !== 'ready';
          return (
            <li key={stage.key} className="flex flex-col items-center gap-1.5 text-center">
              <span
                className={cn(
                  'grid size-8 place-items-center rounded-full ring-4 transition',
                  done ? 'bg-emerald-500 text-white ring-emerald-50' : active ? 'bg-brand-600 text-white ring-brand-100' : 'bg-slate-100 text-slate-400 ring-white',
                )}
              >
                <stage.icon className={cn('size-4', active && 'animate-pulse')} />
              </span>
              <span className={cn('text-xs font-medium', done || active ? 'text-slate-800' : 'text-slate-400')}>{stage.label}</span>
            </li>
          );
        })}
      </ol>
      {video.stage !== 'ready' && (
        <p className="mt-5 text-center text-xs text-slate-500">
          You can leave this page — we will keep working and your video will appear in the library. {video.creditsReserved} credits are reserved.
        </p>
      )}
    </div>
  );
}
