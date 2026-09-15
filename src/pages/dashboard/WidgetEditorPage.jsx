import { useMemo, useState } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { Code2, Eye, Film, Palette, Save, Settings2, Timer, Trash2 } from 'lucide-react';
import { Controller, useForm } from 'react-hook-form';
import { useNavigate, useParams } from 'react-router';
import { WIDGET_OFFSET, WIDGET_WIDTH } from '#shared/constants';
import { widgetFormSchema } from '#shared/schemas';
import { EmbedCode } from '../../components/EmbedCode.jsx';
import { PageHeader } from '../../components/PageHeader.jsx';
import { WidgetPreview, buildPreviewConfig } from '../../components/WidgetPreview.jsx';
import { Button } from '../../components/ui/Button.jsx';
import { Card, CardBody, CardHeader } from '../../components/ui/Card.jsx';
import { Input, Segmented, Select, Switch } from '../../components/ui/Field.jsx';
import { Modal } from '../../components/ui/Modal.jsx';
import { EmptyState, ErrorState, LoadingState } from '../../components/ui/States.jsx';
import { useApi } from '../../hooks/useApi.js';
import { useDocumentTitle } from '../../hooks/useDocumentTitle.js';
import { videoService, widgetService } from '../../services/index.js';
import { toast } from '../../store/toastStore.js';
import { cn } from '../../utils/cn.js';

const SWATCHES = ['#6d5dfc', '#2563eb', '#0ea5e9', '#10b981', '#f97316', '#e11d48', '#0f172a'];

function toForm(widget) {
  return {
    videoId: widget.videoId ?? '',
    name: widget.name,
    position: widget.position,
    delay: widget.delay,
    autoplay: widget.autoplay,
    muted: widget.muted,
    showCaptions: widget.showCaptions,
    showLiveIndicator: widget.showLiveIndicator,
    primaryCtaText: widget.primaryCtaText ?? '',
    primaryCtaUrl: widget.primaryCtaUrl ?? '',
    theme: widget.theme,
    accentColor: widget.accentColor,
    width: widget.width,
    mobileBehavior: widget.mobileBehavior,
    attentionAnimation: widget.attentionAnimation,
    offsetX: widget.offsetX ?? 0,
    offsetY: widget.offsetY ?? 0,
    enabled: widget.enabled,
  };
}

function Editor({ widget, onSaved }) {
  const navigate = useNavigate();
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const form = useForm({ resolver: zodResolver(widgetFormSchema), defaultValues: toForm(widget) });
  const {
    control,
    register,
    watch,
    handleSubmit,
    reset,
    formState: { errors, isDirty, isSubmitting },
  } = form;
  const values = watch();

  const { data: completed } = useApi(() => videoService.list({ status: 'completed', limit: 100 }), []);
  const { data: videoData } = useApi(() => videoService.get(values.videoId), [values.videoId], { enabled: Boolean(values.videoId) });
  const video = videoData?.video;

  const previewConfig = useMemo(() => (video ? buildPreviewConfig({ widget: values, video }) : null), [values, video]);

  const save = async (data) => {
    try {
      const { widget: updated } = await widgetService.update(widget.id, data);
      reset(toForm(updated));
      onSaved(updated);
      toast.success('Widget saved — changes are live on your website');
    } catch (err) {
      Object.entries(err.fieldErrors?.() ?? {}).forEach(([name, message]) => form.setError(name, { message }));
      toast.fromError(err);
    }
  };

  const remove = async () => {
    setDeleting(true);
    try {
      await widgetService.remove(widget.id);
      toast.success('Widget deleted');
      navigate(widget.videoId ? `/dashboard/videos/${widget.videoId}` : '/dashboard/widgets');
    } catch (err) {
      toast.fromError(err);
      setDeleting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(save)} noValidate>
      <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_minmax(0,1.1fr)]">
        <div className="space-y-6">
          <Card>
            <CardHeader icon={Settings2} title="General" />
            <CardBody className="space-y-4">
              <Input label="Widget name" error={errors.name?.message} {...register('name')} />
              <Select
                label="Video"
                hint={
                  values.videoId
                    ? "Whichever video you pick here becomes the one shown on the customer's website — this is how you make a different video primary."
                    : 'Pick a completed video to start showing this widget on your website.'
                }
                error={errors.videoId?.message}
                {...register('videoId')}
              >
                <option value="">— No video selected —</option>
                {(completed?.items ?? (widget.videoId ? [{ id: widget.videoId, title: widget.video?.title ?? 'Current video' }] : [])).map((v) => (
                  <option key={v.id} value={v.id}>
                    {v.title}
                  </option>
                ))}
              </Select>
              <Controller
                control={control}
                name="enabled"
                render={({ field }) => (
                  <Switch checked={field.value} onChange={field.onChange} label="Widget enabled" description="Turn off to hide it on every site without removing the code." />
                )}
              />
            </CardBody>
          </Card>

          <Card>
            <CardHeader icon={Palette} title="Appearance" />
            <CardBody className="space-y-5">
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-1.5">
                  <p className="text-sm font-medium text-slate-800">Position</p>
                  <Controller
                    control={control}
                    name="position"
                    render={({ field }) => (
                      <Segmented value={field.value} onChange={field.onChange} options={[{ value: 'bottom-left', label: 'Bottom left' }, { value: 'bottom-right', label: 'Bottom right' }]} />
                    )}
                  />
                </div>
                <div className="space-y-1.5">
                  <p className="text-sm font-medium text-slate-800">Theme</p>
                  <Controller
                    control={control}
                    name="theme"
                    render={({ field }) => <Segmented value={field.value} onChange={field.onChange} options={[{ value: 'light', label: 'Light' }, { value: 'dark', label: 'Dark' }]} />}
                  />
                </div>
              </div>
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-medium text-slate-800">Corner offset</p>
                  <span className="text-xs text-slate-500 tabular-nums">
                    {values.offsetX}px across · {values.offsetY}px up
                  </span>
                </div>
                <p className="text-xs text-slate-500">Nudge the widget away from something else already in that corner of your site (a chat bubble, a cookie banner).</p>
                <div className="grid gap-3 sm:grid-cols-2">
                  <div>
                    <label className="text-xs text-slate-500">Across</label>
                    <input type="range" min={WIDGET_OFFSET.MIN} max={WIDGET_OFFSET.MAX} step={5} className="w-full accent-brand-600" {...register('offsetX', { valueAsNumber: true })} />
                  </div>
                  <div>
                    <label className="text-xs text-slate-500">Up</label>
                    <input type="range" min={WIDGET_OFFSET.MIN} max={WIDGET_OFFSET.MAX} step={5} className="w-full accent-brand-600" {...register('offsetY', { valueAsNumber: true })} />
                  </div>
                </div>
              </div>
              <div className="space-y-1.5">
                <p className="text-sm font-medium text-slate-800">Accent colour</p>
                <Controller
                  control={control}
                  name="accentColor"
                  render={({ field }) => (
                    <div className="flex flex-wrap items-center gap-2">
                      {SWATCHES.map((c) => (
                        <button
                          key={c}
                          type="button"
                          aria-label={`Use ${c}`}
                          onClick={() => field.onChange(c)}
                          className={cn('size-8 rounded-full ring-offset-2 transition', field.value.toLowerCase() === c ? 'ring-2 ring-slate-900' : 'ring-1 ring-black/10 hover:scale-110')}
                          style={{ background: c }}
                        />
                      ))}
                      <label className="relative ml-1 flex h-9 items-center gap-2 rounded-xl px-2 ring-1 ring-slate-200">
                        <input type="color" value={/^#[0-9a-f]{6}$/i.test(field.value) ? field.value : '#6d5dfc'} onChange={(e) => field.onChange(e.target.value)} className="size-6 cursor-pointer rounded border-0 bg-transparent p-0" aria-label="Custom colour" />
                        <input value={field.value} onChange={(e) => field.onChange(e.target.value)} className="w-20 border-0 bg-transparent p-0 font-mono text-sm uppercase focus:ring-0 focus:outline-none" aria-label="Hex colour" maxLength={7} />
                      </label>
                    </div>
                  )}
                />
                {errors.accentColor && <p className="text-[13px] font-medium text-rose-600">{errors.accentColor.message}</p>}
              </div>
              <div className="space-y-1.5">
                <div className="flex justify-between text-sm">
                  <span className="font-medium text-slate-800">Card width</span>
                  <span className="text-slate-500 tabular-nums">{values.width}px</span>
                </div>
                <input type="range" min={WIDGET_WIDTH.MIN} max={WIDGET_WIDTH.MAX} step={10} className="w-full accent-brand-600" {...register('width', { valueAsNumber: true })} />
              </div>
              <Select
                label="On phones"
                {...register('mobileBehavior')}
                options={[
                  { value: 'compact', label: 'Compact card' },
                  { value: 'bubble', label: 'Bubble only — visitor taps to open' },
                  { value: 'hidden', label: 'Hidden on phones' },
                ]}
              />
            </CardBody>
          </Card>

          <Card>
            <CardHeader icon={Timer} title="Behaviour" />
            <CardBody className="space-y-5">
              <div className="space-y-1.5">
                <p className="text-sm font-medium text-slate-800">Appear after page load</p>
                <Controller
                  control={control}
                  name="delay"
                  render={({ field }) => (
                    <Segmented
                      value={field.value}
                      onChange={(v) => field.onChange(Number(v))}
                      options={[
                        { value: 0, label: 'Immediately' },
                        { value: 3, label: '3 sec' },
                        { value: 5, label: '5 sec' },
                        { value: 10, label: '10 sec' },
                      ]}
                    />
                  )}
                />
              </div>
              <Select
                label="Attention grabber"
                {...register('attentionAnimation')}
                options={[
                  { value: 'wave', label: '👋 Wave' },
                  { value: 'pulse', label: 'Pulse ring' },
                  { value: 'bounce', label: 'Bounce' },
                  { value: 'none', label: 'None' },
                ]}
              />
              <div className="space-y-4 rounded-xl bg-slate-50 p-4 ring-1 ring-slate-100">
                <Controller control={control} name="autoplay" render={({ field }) => <Switch checked={field.value} onChange={field.onChange} label="Autoplay" description="Start playing when the card opens." />} />
                <Controller
                  control={control}
                  name="muted"
                  render={({ field }) => <Switch checked={field.value} onChange={field.onChange} label="Start muted" description="Recommended — browsers block autoplay with sound. Visitors get a “tap for sound” prompt." />}
                />
                <Controller control={control} name="showCaptions" render={({ field }) => <Switch checked={field.value} onChange={field.onChange} label="Captions" description="Show captions synced with the script." />} />
                <Controller control={control} name="showLiveIndicator" render={({ field }) => <Switch checked={field.value} onChange={field.onChange} label="“Live” indicator" description="Small pulsing badge on the card and bubble." />} />
              </div>
            </CardBody>
          </Card>

        </div>

        <div className="space-y-6 xl:sticky xl:top-6 xl:self-start">
          <Card>
            <CardHeader icon={Eye} title="Live preview" description="Exactly what visitors see — rendered by the real widget script." />
            <CardBody>
              {previewConfig ? (
                <WidgetPreview config={previewConfig} height={520} />
              ) : values.videoId ? (
                <LoadingState compact />
              ) : (
                <EmptyState icon={Film} title="No video selected yet" description="Pick a completed video above to see a live preview and start showing this widget." />
              )}
            </CardBody>
          </Card>
          <Card>
            <CardHeader icon={Code2} title="Embed code" description={isDirty ? 'Save your changes — the snippet itself never changes.' : 'Settings update live; you only paste this once.'} />
            <CardBody>
              <EmbedCode code={widget.embedCode} />
            </CardBody>
          </Card>
        </div>
      </div>

      <div className="sticky bottom-0 z-10 -mx-4 mt-8 flex items-center justify-between gap-3 border-t border-slate-200/70 bg-slate-50/90 px-4 py-4 backdrop-blur sm:-mx-6 sm:px-6 lg:-mx-8 lg:px-8">
        <Button variant="danger-ghost" icon={Trash2} onClick={() => setConfirmDelete(true)}>
          Delete widget
        </Button>
        <div className="flex items-center gap-3">
          {isDirty && <span className="hidden text-sm text-amber-700 sm:block">Unsaved changes</span>}
          <Button variant="secondary" disabled={!isDirty} onClick={() => reset()}>
            Discard
          </Button>
          <Button type="submit" icon={Save} loading={isSubmitting} disabled={!isDirty}>
            Save changes
          </Button>
        </div>
      </div>

      <Modal
        open={confirmDelete}
        onClose={() => setConfirmDelete(false)}
        title="Delete this widget?"
        size="sm"
        footer={
          <>
            <Button variant="secondary" onClick={() => setConfirmDelete(false)}>
              Cancel
            </Button>
            <Button variant="danger" onClick={remove} loading={deleting}>
              Delete widget
            </Button>
          </>
        }
      >
        <p className="text-sm text-slate-600">The widget disappears from every website where its embed code is installed. The video itself is kept.</p>
      </Modal>
    </form>
  );
}

export default function WidgetEditorPage() {
  const { id } = useParams();
  const { data, error, loading, refetch, setData } = useApi(() => widgetService.get(id), [id]);
  useDocumentTitle(data?.widget?.name ?? 'Widget');

  if (error) return <ErrorState error={error} onRetry={refetch} title={error.status === 404 ? 'Widget not found' : undefined} />;
  if (loading || !data) return <LoadingState />;
  const { widget } = data;

  return (
    <div className="animate-rise">
      <PageHeader
        back={widget.videoId ? { to: `/dashboard/videos/${widget.videoId}`, label: 'Back to video' } : { to: '/dashboard/widgets', label: 'Back to widgets' }}
        eyebrow="Widget"
        title={widget.name}
        description={`Public id ${widget.publicWidgetId}`}
      />
      <Editor key={widget.id} widget={widget} onSaved={(w) => setData({ widget: w })} />
    </div>
  );
}
