import { useEffect, useMemo } from 'react';
import { Film } from 'lucide-react';
import { cn } from '../utils/cn.js';

function toVtt(captions) {
  const ts = (s) => {
    const ms = Math.round(s * 1000);
    const h = String(Math.floor(ms / 3_600_000)).padStart(2, '0');
    const m = String(Math.floor((ms % 3_600_000) / 60_000)).padStart(2, '0');
    const sec = String(Math.floor((ms % 60_000) / 1000)).padStart(2, '0');
    return `${h}:${m}:${sec}.${String(ms % 1000).padStart(3, '0')}`;
  };
  return `WEBVTT\n\n${captions.map((c, i) => `${i + 1}\n${ts(c.start)} --> ${ts(c.end)}\n${c.text}`).join('\n\n')}\n`;
}

/** Native video player with the generated captions attached as a real text track. */
export function VideoPlayer({ src, poster, captions = [], className, aspect = 'aspect-[3/4]', autoPlay = false }) {
  const trackUrl = useMemo(() => {
    if (!captions.length) return null;
    return URL.createObjectURL(new Blob([toVtt(captions)], { type: 'text/vtt' }));
  }, [captions]);

  useEffect(() => () => trackUrl && URL.revokeObjectURL(trackUrl), [trackUrl]);

  if (!src) {
    return (
      <div className={cn('grid place-items-center rounded-2xl bg-slate-900 text-slate-400', aspect, className)}>
        <div className="flex flex-col items-center gap-2 text-sm">
          <Film className="size-8" />
          Video not available yet
        </div>
      </div>
    );
  }

  return (
    <div className={cn('overflow-hidden rounded-2xl bg-slate-950 shadow-float ring-1 ring-slate-900/10', aspect, className)}>
      <video
        key={src}
        className="size-full object-cover"
        src={src}
        poster={poster ?? undefined}
        controls
        playsInline
        preload="metadata"
        autoPlay={autoPlay}
      >
        {trackUrl && <track kind="captions" src={trackUrl} srcLang="en" label="English" default />}
      </video>
    </div>
  );
}
