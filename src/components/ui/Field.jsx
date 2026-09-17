import { forwardRef, useId } from 'react';
import { ChevronDown } from 'lucide-react';
import { cn } from '../../utils/cn.js';

const control =
  'block w-full rounded-xl border-0 bg-surface text-sm text-slate-900 shadow-xs ring-1 ring-inset ring-slate-200 placeholder:text-slate-400 transition focus:ring-2 focus:ring-inset focus:ring-brand-500 focus:outline-none disabled:cursor-not-allowed disabled:bg-slate-50 disabled:text-slate-500';
const invalid = 'ring-rose-300 focus:ring-rose-500';

export function FieldShell({ id, label, hint, error, required, children, className, trailing }) {
  return (
    <div className={cn('space-y-1.5', className)}>
      {(label || trailing) && (
        <div className="flex items-center justify-between gap-2">
          {label && (
            <label htmlFor={id} className="text-sm font-medium text-slate-800">
              {label}
              {required && <span className="ml-0.5 text-rose-500">*</span>}
            </label>
          )}
          {trailing}
        </div>
      )}
      {children}
      {error ? (
        <p id={`${id}-error`} className="text-[13px] font-medium text-rose-600">
          {error}
        </p>
      ) : hint ? (
        <p id={`${id}-hint`} className="text-[13px] text-slate-500">
          {hint}
        </p>
      ) : null}
    </div>
  );
}

export const Input = forwardRef(function Input({ label, hint, error, required, className, inputClassName, icon: Icon, trailing, id, ...props }, ref) {
  const autoId = useId();
  const fieldId = id ?? autoId;
  return (
    <FieldShell id={fieldId} label={label} hint={hint} error={error} required={required} className={className} trailing={trailing}>
      <div className="relative">
        {Icon && <Icon className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-slate-400" />}
        <input
          ref={ref}
          id={fieldId}
          aria-invalid={Boolean(error)}
          aria-describedby={error ? `${fieldId}-error` : hint ? `${fieldId}-hint` : undefined}
          className={cn(control, 'h-10 px-3', Icon && 'pl-9', error && invalid, inputClassName)}
          {...props}
        />
      </div>
    </FieldShell>
  );
});

export const Textarea = forwardRef(function Textarea({ label, hint, error, required, className, textareaClassName, trailing, id, rows = 5, ...props }, ref) {
  const autoId = useId();
  const fieldId = id ?? autoId;
  return (
    <FieldShell id={fieldId} label={label} hint={hint} error={error} required={required} className={className} trailing={trailing}>
      <textarea
        ref={ref}
        id={fieldId}
        rows={rows}
        aria-invalid={Boolean(error)}
        className={cn(control, 'resize-y px-3 py-2.5 leading-relaxed', error && invalid, textareaClassName)}
        {...props}
      />
    </FieldShell>
  );
});

export const Select = forwardRef(function Select({ label, hint, error, required, className, options = [], id, children, ...props }, ref) {
  const autoId = useId();
  const fieldId = id ?? autoId;
  return (
    <FieldShell id={fieldId} label={label} hint={hint} error={error} required={required} className={className}>
      <div className="relative">
        <select
          ref={ref}
          id={fieldId}
          aria-invalid={Boolean(error)}
          className={cn(control, 'h-10 appearance-none pr-9 pl-3', error && invalid)}
          {...props}
        >
          {children ??
            options.map((o) => (
              <option key={String(o.value)} value={o.value}>
                {o.label}
              </option>
            ))}
        </select>
        <ChevronDown className="pointer-events-none absolute top-1/2 right-3 size-4 -translate-y-1/2 text-slate-400" />
      </div>
    </FieldShell>
  );
});

/** Accessible switch; works with react-hook-form via Controller or value/onChange. */
export function Switch({ checked, onChange, label, description, disabled, id }) {
  const autoId = useId();
  const fieldId = id ?? autoId;
  return (
    <div className="flex items-start justify-between gap-4">
      <div className="min-w-0">
        <label htmlFor={fieldId} className="text-sm font-medium text-slate-800">
          {label}
        </label>
        {description && <p className="text-[13px] text-slate-500">{description}</p>}
      </div>
      <button
        id={fieldId}
        type="button"
        role="switch"
        aria-checked={checked}
        disabled={disabled}
        onClick={() => onChange(!checked)}
        className={cn(
          'relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full transition-colors duration-200 disabled:opacity-50',
          checked ? 'bg-brand-600' : 'bg-zinc-700',
        )}
      >
        <span
          className={cn(
            // Deliberately literal white — the sliding knob needs contrast against the track
            // (brand purple or zinc-700) regardless of theme, not the page's dark card colour.
            'pointer-events-none mt-0.5 ml-0.5 inline-block size-5 rounded-full bg-white shadow-sm ring-0 transition-transform duration-200',
            checked ? 'translate-x-5' : 'translate-x-0',
          )}
        />
      </button>
    </div>
  );
}

/** Pill-style single choice (segmented control). */
export function Segmented({ value, onChange, options, className, size = 'md' }) {
  return (
    <div className={cn('inline-flex rounded-xl bg-slate-100 p-1', className)} role="radiogroup">
      {options.map((o) => {
        const active = String(o.value) === String(value);
        return (
          <button
            key={String(o.value)}
            type="button"
            role="radio"
            aria-checked={active}
            onClick={() => onChange(o.value)}
            className={cn(
              'flex items-center gap-1.5 rounded-lg font-medium transition',
              size === 'sm' ? 'px-2.5 py-1 text-xs' : 'px-3 py-1.5 text-[13px]',
              active ? 'bg-surface text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-800',
            )}
          >
            {o.icon && <o.icon className="size-3.5" />}
            {o.label}
          </button>
        );
      })}
    </div>
  );
}
