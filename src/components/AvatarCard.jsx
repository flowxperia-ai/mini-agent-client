import { useState } from 'react';
import { Check, Eye, Sparkles, UserRound } from 'lucide-react';
import { cn } from '../utils/cn.js';
import { StatusBadge } from './StatusBadge.jsx';
import { Badge } from './ui/Badge.jsx';
import { Modal } from './ui/Modal.jsx';

const GENDER_LABEL = { male: 'Male', female: 'Female', other: 'Other', unknown: '—' };

function AvatarImage({ avatar, className }) {
  return avatar.thumbnailUrl ? (
    <img src={avatar.thumbnailUrl} alt={avatar.name} loading="lazy" className={cn('size-full object-cover', className)} />
  ) : (
    <div className={cn('grid size-full place-items-center bg-gradient-to-br from-brand-100 to-brand-200 text-brand-500', className)}>
      <UserRound className="size-12" />
    </div>
  );
}

/**
 * Selectable avatar tile. Stock avatars show gender/style; digital twins show consent status.
 */
export function AvatarCard({ avatar, selected = false, onSelect, disabled = false, showConsent = false }) {
  const [preview, setPreview] = useState(false);
  const selectable = Boolean(onSelect) && !disabled;

  return (
    <>
      <div
        role={onSelect ? 'radio' : undefined}
        aria-checked={onSelect ? selected : undefined}
        aria-disabled={disabled || undefined}
        tabIndex={selectable ? 0 : undefined}
        onClick={() => selectable && onSelect(avatar)}
        onKeyDown={(e) => {
          if (selectable && (e.key === 'Enter' || e.key === ' ')) {
            e.preventDefault();
            onSelect(avatar);
          }
        }}
        className={cn(
          'group relative overflow-hidden rounded-2xl bg-white text-left ring-1 transition duration-200',
          selectable && 'cursor-pointer hover:-translate-y-0.5 hover:shadow-float',
          selected ? 'ring-2 ring-brand-600 shadow-float' : 'ring-slate-200 shadow-card',
          disabled && 'opacity-60',
        )}
      >
        <div className="relative aspect-[4/5] overflow-hidden bg-slate-100">
          <AvatarImage avatar={avatar} className="transition duration-500 group-hover:scale-[1.03]" />
          <div className="absolute inset-x-0 bottom-0 h-1/3 bg-gradient-to-t from-slate-950/40 to-transparent" />
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              setPreview(true);
            }}
            className="absolute right-2 bottom-2 flex items-center gap-1 rounded-full bg-white/90 px-2.5 py-1 text-xs font-semibold text-slate-800 opacity-0 shadow-sm backdrop-blur transition group-hover:opacity-100 focus-visible:opacity-100"
          >
            <Eye className="size-3.5" /> Preview
          </button>
          {selected && (
            <span className="absolute top-2 right-2 grid size-7 place-items-center rounded-full bg-brand-600 text-white shadow-lg ring-2 ring-white">
              <Check className="size-4" strokeWidth={3} />
            </span>
          )}
        </div>
        <div className="space-y-2 p-3">
          <p className="truncate text-sm font-semibold text-slate-900">{avatar.name}</p>
          <div className="flex flex-wrap gap-1.5">
            {showConsent && avatar.consent ? (
              <StatusBadge kind="consent" status={avatar.consent.status} />
            ) : (
              <>
                {avatar.gender && avatar.gender !== 'unknown' && <Badge>{GENDER_LABEL[avatar.gender]}</Badge>}
                {avatar.style && <Badge tone="brand">{avatar.style}</Badge>}
                {avatar.supportsExpressive && (
                  <Badge tone="amber">
                    <Sparkles className="size-3" /> Expressive
                  </Badge>
                )}
              </>
            )}
          </div>
        </div>
      </div>

      <Modal open={preview} onClose={() => setPreview(false)} title={avatar.name} description={[GENDER_LABEL[avatar.gender], avatar.style].filter((x) => x && x !== '—').join(' · ')} size="sm">
        <div className="overflow-hidden rounded-xl bg-slate-100">
          {avatar.previewVideoUrl ? (
            <video src={avatar.previewVideoUrl} poster={avatar.thumbnailUrl ?? undefined} className="aspect-[4/5] w-full object-cover" autoPlay muted loop playsInline controls />
          ) : (
            <div className="aspect-[4/5]">
              <AvatarImage avatar={avatar} />
            </div>
          )}
        </div>
      </Modal>
    </>
  );
}
