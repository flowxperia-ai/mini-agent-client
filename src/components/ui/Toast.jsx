import { CheckCircle2, Info, X, XCircle } from 'lucide-react';
import { useToastStore } from '../../store/toastStore.js';
import { cn } from '../../utils/cn.js';

const ICONS = { success: CheckCircle2, error: XCircle, info: Info };
const TONES = { success: 'text-emerald-500', error: 'text-rose-500', info: 'text-brand-500' };

/** Renders the global toast stack (see store/toastStore.js). */
export function Toaster() {
  const { toasts, dismiss } = useToastStore();
  return (
    <div className="pointer-events-none fixed inset-x-0 bottom-0 z-[60] flex flex-col items-center gap-2 p-4 sm:items-end sm:p-6" aria-live="polite">
      {toasts.map((t) => {
        const Icon = ICONS[t.tone] ?? Info;
        return (
          <div
            key={t.id}
            className="pointer-events-auto flex w-full max-w-sm animate-rise items-start gap-3 rounded-2xl bg-surface p-4 shadow-float ring-1 ring-slate-900/5"
            role={t.tone === 'error' ? 'alert' : 'status'}
          >
            <Icon className={cn('mt-0.5 size-5 shrink-0', TONES[t.tone])} />
            <div className="min-w-0 flex-1">
              {t.title && <p className="text-sm font-semibold text-slate-900">{t.title}</p>}
              <p className="text-sm text-slate-700">{t.message}</p>
            </div>
            <button type="button" onClick={() => dismiss(t.id)} className="rounded-md p-0.5 text-slate-400 hover:text-slate-700" aria-label="Dismiss">
              <X className="size-4" />
            </button>
          </div>
        );
      })}
    </div>
  );
}
