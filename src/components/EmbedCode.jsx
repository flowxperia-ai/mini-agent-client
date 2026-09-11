import { Check, Copy } from 'lucide-react';
import { useCopy } from '../hooks/useCopy.js';
import { cn } from '../utils/cn.js';

/** Copyable embed snippet with a short install note. */
export function EmbedCode({ code, className, showHelp = true }) {
  const { copied, copy } = useCopy();
  return (
    <div className={cn('space-y-3', className)}>
      <div className="group relative overflow-hidden rounded-xl bg-slate-950 ring-1 ring-slate-800">
        <div className="flex items-center justify-between border-b border-white/5 px-4 py-2">
          <span className="text-[11px] font-medium tracking-wide text-slate-400 uppercase">HTML</span>
          <button
            type="button"
            onClick={() => copy(code, 'Embed code copied')}
            className="flex items-center gap-1.5 rounded-md px-2 py-1 text-xs font-semibold text-slate-300 transition hover:bg-white/10 hover:text-white"
          >
            {copied ? <Check className="size-3.5 text-emerald-400" /> : <Copy className="size-3.5" />}
            {copied ? 'Copied' : 'Copy'}
          </button>
        </div>
        <pre className="overflow-x-auto px-4 py-3.5 text-[12.5px] leading-relaxed text-slate-100">
          <code>{code}</code>
        </pre>
      </div>
      {showHelp && (
        <p className="text-[13px] text-slate-500">
          Paste this just before the closing <code className="rounded bg-slate-100 px-1 text-slate-700">&lt;/body&gt;</code> tag on every page where the
          spokesperson should appear. It loads asynchronously and never blocks your site.
        </p>
      )}
    </div>
  );
}
