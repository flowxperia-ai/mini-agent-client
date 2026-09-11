import { useState } from 'react';
import { Captions, Clock, Coins, ExternalLink, MousePointerClick, Settings2, Trash2, UserRound, Wand2 } from 'lucide-react';
import { useNavigate, useParams } from 'react-router';
import { DeleteVideoModal } from '../../components/DeleteVideoModal.jsx';
import { EmbedCode } from '../../components/EmbedCode.jsx';
import { GenerationProgress } from '../../components/GenerationProgress.jsx';
import { PageHeader } from '../../components/PageHeader.jsx';
import { StatusBadge } from '../../components/StatusBadge.jsx';
import { VideoPlayer } from '../../components/VideoPlayer.jsx';
import { WidgetPreview, buildPreviewConfig } from '../../components/WidgetPreview.jsx';
import { Button } from '../../components/ui/Button.jsx';
import { Card, CardBody, CardHeader } from '../../components/ui/Card.jsx';
import { ErrorState, LoadingState } from '../../components/ui/States.jsx';
import { useApi } from '../../hooks/useApi.js';
import { useDocumentTitle } from '../../hooks/useDocumentTitle.js';
import { videoService, widgetService } from '../../services/index.js';
import { toast } from '../../store/toastStore.js';
import { formatDateTime, formatDuration } from '../../utils/format.js';

function Detail({ icon: Icon, label, children }) {
  return (
    <div className="flex items-start gap-3 py-2.5">
      <Icon className="mt-0.5 size-4 shrink-0 text-slate-400" />
      <dt className="w-28 shrink-0 text-sm text-slate-500">{label}</dt>
      <dd className="min-w-0 flex-1 text-sm font-medium text-slate-900">{children}</dd>
    </div>
  );
}

export default function VideoDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [deleting, setDeleting] = useState(null);
  const [creating, setCreating] = useState(false);

  const { data, loading, error, refetch } = useApi(() => videoService.get(id), [id], {
    poll: (d) => (d?.video && ['QUEUED', 'PROCESSING'].includes(d.video.status) ? 3000 : null),
  });
  const video = data?.video;
  const widgetRef = video?.widgets?.[0];
  const { data: widgetData } = useApi(() => widgetService.get(widgetRef.id), [widgetRef?.id], { enabled: Boolean(widgetRef) });
  useDocumentTitle(video?.title ?? 'Video');

  if (error) return <ErrorState error={error} onRetry={refetch} title={error.status === 404 ? 'Video not found' : undefined} />;
  if (loading || !video) return <LoadingState />;

  const widget = widgetData?.widget;
  const createWidget = async () => {
    setCreating(true);
    try {
      const { widget: created } = await widgetService.create({ videoId: video.id });
      toast.success('Widget created');
      navigate(`/dashboard/widgets/${created.id}`);
    } catch (err) {
      toast.fromError(err);
      setCreating(false);
    }
  };

  return (
    <div className="animate-rise">
      <PageHeader
        back={{ to: '/dashboard/videos', label: 'Video library' }}
        title={
          <span className="flex flex-wrap items-center gap-3">
            {video.title} <StatusBadge status={video.status} size="md" />
          </span>
        }
        actions={
          <>
            {video.videoUrl && (
              <Button variant="secondary" icon={ExternalLink} href={video.videoUrl} target="_blank" rel="noopener noreferrer">
                Open video
              </Button>
            )}
            <Button variant="danger-ghost" icon={Trash2} onClick={() => setDeleting(video)} disabled={['QUEUED', 'PROCESSING'].includes(video.status)}>
              Delete
            </Button>
          </>
        }
      />

      <div className="grid gap-6 lg:grid-cols-[minmax(0,340px)_1fr]">
        <div className="space-y-4">
          {video.status === 'COMPLETED' ? (
            <VideoPlayer src={video.videoUrl} poster={video.thumbnailUrl} captions={video.captions} />
          ) : (
            <GenerationProgress video={video} />
          )}
          <Card>
            <CardBody className="py-2">
              <dl className="divide-y divide-slate-100">
                <Detail icon={UserRound} label="Avatar">
                  <span className="flex items-center gap-2">
                    {video.avatar?.thumbnailUrl && <img src={video.avatar.thumbnailUrl} alt="" className="size-6 rounded-full object-cover" />}
                    {video.avatar?.name ?? '—'}
                  </span>
                </Detail>
                <Detail icon={Clock} label="Duration">
                  {formatDuration(video.duration ?? video.estimatedDuration)}
                  {!video.duration && <span className="ml-1 text-xs font-normal text-slate-400">(estimated)</span>}
                </Detail>
                <Detail icon={Coins} label="Credits">
                  {video.status === 'COMPLETED' ? `${video.creditsCharged} charged` : video.stage === 'failed' ? `${video.creditsReserved} returned` : `${video.creditsReserved} reserved`}
                </Detail>
                <Detail icon={MousePointerClick} label="Call to action">
                  {video.ctaText ? (
                    <a href={video.ctaUrl} target="_blank" rel="noopener noreferrer" className="text-brand-700 hover:underline">
                      {video.ctaText}
                    </a>
                  ) : (
                    '—'
                  )}
                </Detail>
                <Detail icon={Clock} label="Created">
                  {formatDateTime(video.createdAt)}
                </Detail>
              </dl>
            </CardBody>
          </Card>
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader title="Script" icon={Captions} description={video.captions?.length ? `${video.captions.length} caption segments` : undefined} />
            <CardBody>
              <p className="text-[15px] leading-relaxed whitespace-pre-line text-slate-700">{video.script}</p>
            </CardBody>
          </Card>

          {video.status === 'COMPLETED' && (
            <Card>
              <CardHeader
                title="Embed on your website"
                icon={Wand2}
                description={widget ? `Widget “${widget.name}” · ${widget.enabled ? 'enabled' : 'disabled'}` : 'Create a widget to get your embed code.'}
                actions={
                  widget ? (
                    <Button variant="secondary" size="sm" icon={Settings2} to={`/dashboard/widgets/${widget.id}`}>
                      Edit widget settings
                    </Button>
                  ) : null
                }
              />
              <CardBody className="space-y-6">
                {widget ? (
                  <EmbedCode code={widget.embedCode} />
                ) : (
                  <Button icon={Wand2} onClick={createWidget} loading={creating}>
                    Create embeddable widget
                  </Button>
                )}
                <WidgetPreview config={buildPreviewConfig({ widget: widget ?? { primaryCtaText: video.ctaText, primaryCtaUrl: video.ctaUrl }, video })} height={500} />
              </CardBody>
            </Card>
          )}
        </div>
      </div>

      <DeleteVideoModal video={deleting} onClose={() => setDeleting(null)} onDeleted={() => navigate('/dashboard/videos')} />
    </div>
  );
}
