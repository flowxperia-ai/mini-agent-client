import { ArrowLeft } from 'lucide-react';
import { Link } from 'react-router';
import { cn } from '../utils/cn.js';

export function PageHeader({ title, description, actions, back, className, eyebrow }) {
  return (
    <div className={cn('mb-6 flex flex-col gap-4 sm:mb-8 sm:flex-row sm:items-end sm:justify-between', className)}>
      <div className="min-w-0">
        {back && (
          <Link to={back.to} className="mb-3 inline-flex items-center gap-1.5 text-sm font-medium text-slate-500 hover:text-slate-900">
            <ArrowLeft className="size-4" /> {back.label}
          </Link>
        )}
        {eyebrow && <p className="mb-1 text-xs font-semibold tracking-wide text-brand-600 uppercase">{eyebrow}</p>}
        <h1 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-[28px]">{title}</h1>
        {description && <p className="mt-1.5 max-w-2xl text-[15px] text-slate-500">{description}</p>}
      </div>
      {actions && <div className="flex flex-wrap items-center gap-2">{actions}</div>}
    </div>
  );
}
