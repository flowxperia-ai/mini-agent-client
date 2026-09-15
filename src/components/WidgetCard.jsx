import { useState } from 'react';
import { Code2, ExternalLink, Settings2, Sparkles, UserRound } from 'lucide-react';
import { useNavigate } from 'react-router';
import { useCopy } from '../hooks/useCopy.js';
import { useApi } from '../hooks/useApi.js';
import { widgetService, videoService } from '../services/index.js';
import { toast } from '../store/toastStore.js';
import { formatRelative } from '../utils/format.js';
import { Badge } from './ui/Badge.jsx';
import { Button } from './ui/Button.jsx';
import { Select } from './ui/Field.jsx';
import { Menu } from './ui/Menu.jsx';
import { Modal } from './ui/Modal.jsx';

/** Small modal to pick a different completed video for this widget — "make it primary" from the list. */
function ChangeVideoModal({ widget, open, onClose, onChanged }) {
  const { data } = useApi(() => videoService.list({ status: 'completed', limit: 100 }), [], { enabled: open });
  const [videoId, setVideoId] = useState(widget.videoId ?? '');
  const [saving, setSaving] = useState(false);

  const save = async () => {
    setSaving(true);
    try {
      await widgetService.update(widget.id, { videoId: videoId || null });
      toast.success('This video is now live on your site');
      onChanged();
      onClose();
    } catch (err) {
      toast.fromError(err);
    } finally {
      setSaving(false);
    }
  };

  const options = data?.items ?? (widget.video ? [{ id: widget.videoId, title: widget.video.title }] : []);

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Change video"
      description="Pick which completed video this widget shows — goes live on the customer's site as soon as you save."
      size="sm"
      footer={
        <>
          <Button variant="secondary" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={save} loading={saving}>
            Save
          </Button>
        </>
      }
    >
      <Select label="Video" value={videoId} onChange={(e) => setVideoId(e.target.value)}>
        <option value="">— No video selected —</option>
        {options.map((v) => (
          <option key={v.id} value={v.id}>
            {v.title}
          </option>
        ))}
      </Select>
    </Modal>
  );
}

/** Library tile for a single widget — its source video, status, and quick actions. */
export function WidgetCard({ widget, onChanged }) {
  const navigate = useNavigate();
  const { copy } = useCopy();
  const [changingVideo, setChangingVideo] = useState(false);
  const video = widget.video;
  const open = () => navigate(`/dashboard/widgets/${widget.id}`);

  return (
    // No overflow-hidden here — it would clip the "..." menu's dropdown, which needs to render
    // outside the card's bounds. The thumbnail rounds its own top corners instead.
    <article className="group flex flex-col rounded-2xl bg-white shadow-card ring-1 ring-slate-200/80 transition hover:-translate-y-0.5 hover:shadow-float">
      <button type="button" onClick={open} className="relative block text-left" aria-label={`Edit ${widget.name}`}>
        <div className="relative aspect-[4/5] overflow-hidden rounded-t-2xl bg-slate-100">
          {video?.thumbnailUrl ? (
            <img src={video.thumbnailUrl} alt="" loading="lazy" className="size-full object-cover" />
          ) : (
            <div className="grid size-full place-items-center text-slate-300">
              <UserRound className="size-12" />
            </div>
          )}
        </div>
      </button>

      <div className="flex flex-1 flex-col gap-2 p-3.5">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0">
            <h3 className="truncate text-sm font-semibold text-slate-900">{widget.name}</h3>
            <p className="truncate text-xs text-slate-500">
              {video?.title ?? (widget.videoId ? 'Video removed' : 'No video selected yet')} · {formatRelative(widget.createdAt)}
            </p>
          </div>
          <Menu
            items={[
              { label: 'Make primary (change video)', icon: Sparkles, onClick: () => setChangingVideo(true) },
              { label: 'Edit widget settings', icon: Settings2, onClick: open },
              { label: 'Copy embed code', icon: Code2, onClick: () => copy(widget.embedCode, 'Embed code copied') },
              video && { label: 'Open source video', icon: ExternalLink, onClick: () => navigate(`/dashboard/videos/${video.id}`) },
            ]}
          />
        </div>
        <div className="mt-auto flex flex-wrap items-center gap-1.5">
          <Badge tone={widget.enabled ? 'green' : 'gray'} dot>
            {widget.enabled ? 'Embedded' : 'Widget off'}
          </Badge>
        </div>
      </div>

      <ChangeVideoModal widget={widget} open={changingVideo} onClose={() => setChangingVideo(false)} onChanged={() => onChanged?.()} />
    </article>
  );
}
