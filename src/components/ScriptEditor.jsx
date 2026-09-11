import { Clock, Coins, Lightbulb, Link2, Type } from 'lucide-react';
import { countWords, estimateDurationSeconds } from '#shared/utils';
import { cn } from '../utils/cn.js';
import { formatDuration } from '../utils/format.js';
import { Input, Textarea } from './ui/Field.jsx';

/**
 * Starting points the customer can edit. Scripts are customer-written today; a template library
 * or AI writer can later plug in here by supplying more entries (see SCRIPT_SOURCES).
 */
export const EXAMPLE_SCRIPTS = [
  {
    label: 'Homepage welcome',
    text: 'Hi there, and welcome! I am here to give you a quick tour. In under a minute, you will see how we help teams like yours save hours every week. Scroll down to explore, or click below to get started.',
  },
  {
    label: 'Pricing page',
    text: 'Thanks for checking out our pricing. Every plan comes with friendly support and no long-term contract. Not sure which plan is right for you? Book a quick call and we will help you choose.',
  },
  {
    label: 'Product launch',
    text: 'Big news! Our newest feature just landed, and it makes your daily workflow faster than ever. Take a look around this page to see it in action, then start your free trial today.',
  },
];

export function estimateCredits(seconds, creditsPerMinute, minCredits = 1) {
  if (!seconds || !creditsPerMinute) return minCredits;
  return Math.max(minCredits, Math.ceil(Number(((seconds * creditsPerMinute) / 60).toFixed(6))));
}

function Stat({ icon: Icon, label, value, warn }) {
  return (
    <div className={cn('flex items-center gap-2 rounded-xl px-3 py-2 ring-1 ring-inset', warn ? 'bg-amber-50 ring-amber-200 text-amber-900' : 'bg-slate-50 ring-slate-200 text-slate-700')}>
      <Icon className="size-4 shrink-0 opacity-70" />
      <div className="leading-tight">
        <p className="text-[11px] font-medium tracking-wide uppercase opacity-70">{label}</p>
        <p className="text-sm font-semibold tabular-nums">{value}</p>
      </div>
    </div>
  );
}

/**
 * Script + call-to-action fields with live word count, duration and credit estimates.
 * Designed for react-hook-form: pass `register`, `errors`, `setValue` and the watched `script`.
 */
export function ScriptEditor({ register, errors = {}, setValue, script = '', limits, creditsPerMinute, minCredits = 1, mockFailToken }) {
  const chars = script.length;
  const words = countWords(script);
  const seconds = estimateDurationSeconds(script, limits.wordsPerMinute);
  const credits = estimateCredits(seconds, creditsPerMinute, minCredits);
  const tooLong = seconds > limits.maxSeconds || chars > limits.maxChars;

  return (
    <div className="space-y-5">
      <Textarea
        label="Script"
        required
        rows={8}
        placeholder="Write what your spokesperson will say. Keep it short, friendly and end with a clear next step."
        maxLength={limits.maxChars + 200}
        error={errors.script?.message}
        trailing={
          <span className={cn('text-xs tabular-nums', chars > limits.maxChars ? 'font-semibold text-rose-600' : 'text-slate-400')}>
            {chars.toLocaleString()} / {limits.maxChars.toLocaleString()}
          </span>
        }
        {...register('script')}
      />

      <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-4">
        <Stat icon={Type} label="Words" value={words} />
        <Stat icon={Clock} label="Est. duration" value={formatDuration(seconds)} warn={tooLong} />
        <Stat icon={Coins} label="Est. credits" value={words ? credits : '—'} />
        <Stat icon={Clock} label="Max length" value={formatDuration(limits.maxSeconds)} />
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <span className="flex items-center gap-1.5 text-xs font-medium text-slate-500">
          <Lightbulb className="size-3.5" /> Start from an example:
        </span>
        {EXAMPLE_SCRIPTS.map((example) => (
          <button
            key={example.label}
            type="button"
            onClick={() => setValue('script', example.text, { shouldValidate: true, shouldDirty: true })}
            className="rounded-full bg-white px-3 py-1 text-xs font-medium text-slate-700 ring-1 ring-slate-200 transition hover:bg-brand-50 hover:text-brand-700 hover:ring-brand-200"
          >
            {example.label}
          </button>
        ))}
      </div>
      {mockFailToken && (
        <p className="text-xs text-slate-400">
          Mock mode tip: include <code className="rounded bg-slate-100 px-1 py-0.5 text-slate-600">{mockFailToken}</code> in the script to simulate a
          provider failure and see credits returned.
        </p>
      )}

      <Input
        label="Call-to-action URL"
        placeholder="https://yourwebsite.com/demo"
        icon={Link2}
        inputMode="url"
        error={errors.ctaUrl?.message}
        hint="Saved with the video. Not shown as a button in the widget."
        {...register('ctaUrl')}
      />
    </div>
  );
}
