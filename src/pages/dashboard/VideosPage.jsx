import { useState } from 'react';
import { Film, Plus } from 'lucide-react';
import { useNavigate } from 'react-router';
import { DeleteVideoModal } from '../../components/DeleteVideoModal.jsx';
import { PageHeader } from '../../components/PageHeader.jsx';
import { VideoCard } from '../../components/VideoCard.jsx';
import { Button } from '../../components/ui/Button.jsx';
import { EmptyState, ErrorState, Skeleton } from '../../components/ui/States.jsx';
import { useApi } from '../../hooks/useApi.js';
import { useCopy } from '../../hooks/useCopy.js';
import { useDocumentTitle } from '../../hooks/useDocumentTitle.js';
import { videoService, widgetService } from '../../services/index.js';
import { toast } from '../../store/toastStore.js';
import { cn } from '../../utils/cn.js';

const FILTERS = [
  { key: 'all', label: 'All' },
  { key: 'processing', label: 'Processing' },
  { key: 'completed', label: 'Completed' },
  { key: 'failed', label: 'Failed' },
];
const PAGE_SIZE = 12;

export default function VideosPage() {
  useDocumentTitle('Videos');
  const navigate = useNavigate();
  const { copy } = useCopy();
  const [filter, setFilter] = useState('all');
  const [page, setPage] = useState(1);
  const [toDelete, setToDelete] = useState(null);

  const { data, loading, error, refetch } = useApi(() => videoService.list({ status: filter, page, limit: PAGE_SIZE }), [filter, page], {
    poll: (d) => (d?.items?.some((v) => v.status === 'QUEUED' || v.status === 'PROCESSING') ? 4000 : null),
  });

  const handleEmbed = async (video) => {
    try {
      const existing = video.widgets[0];
      if (existing) {
        const { widget } = await widgetService.get(existing.id);
        await copy(widget.embedCode, 'Embed code copied');
      } else {
        const { widget } = await widgetService.create({ videoId: video.id });
        toast.success('Widget created — customise it, then copy the embed code');
        navigate(`/dashboard/widgets/${widget.id}`);
      }
    } catch (err) {
      toast.fromError(err);
    }
  };

  return (
    <div className="animate-rise">
      <PageHeader
        title="Video library"
        description="Every spokesperson video you have generated. Embed any completed video on your website."
        actions={
          <Button to="/dashboard/create" icon={Plus}>
            Create video
          </Button>
        }
      />

      <div className="mb-6 flex gap-1 overflow-x-auto border-b border-slate-200" role="tablist">
        {FILTERS.map((f) => {
          const active = filter === f.key;
          const count = data?.counts?.[f.key];
          return (
            <button
              key={f.key}
              type="button"
              role="tab"
              aria-selected={active}
              onClick={() => {
                setFilter(f.key);
                setPage(1);
              }}
              className={cn(
                '-mb-px flex items-center gap-2 border-b-2 px-3 py-2.5 text-sm font-medium whitespace-nowrap transition',
                active ? 'border-brand-600 text-slate-900' : 'border-transparent text-slate-500 hover:text-slate-800',
              )}
            >
              {f.label}
              {count !== undefined && (
                <span className={cn('rounded-full px-1.5 py-0.5 text-[11px] font-semibold tabular-nums', active ? 'bg-brand-50 text-brand-700' : 'bg-slate-100 text-slate-500')}>
                  {count}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {error ? (
        <ErrorState error={error} onRetry={refetch} />
      ) : loading && !data ? (
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {Array.from({ length: 8 }, (_, i) => (
            <Skeleton key={i} className="aspect-[4/6] rounded-2xl" />
          ))}
        </div>
      ) : data.items.length === 0 ? (
        <EmptyState
          icon={Film}
          title={filter === 'all' ? 'No videos yet' : `No ${filter} videos`}
          description={filter === 'all' ? 'Generate your first spokesperson video to see it here.' : 'Try another filter.'}
          action={
            filter === 'all' && (
              <Button to="/dashboard/create" icon={Plus}>
                Create video
              </Button>
            )
          }
        />
      ) : (
        <>
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {data.items.map((video) => (
              <VideoCard key={video.id} video={video} onCopyEmbed={handleEmbed} onDelete={setToDelete} />
            ))}
          </div>
          {data.pagination.pages > 1 && (
            <div className="mt-8 flex items-center justify-center gap-3">
              <Button variant="secondary" size="sm" disabled={page <= 1} onClick={() => setPage((p) => p - 1)}>
                Previous
              </Button>
              <span className="text-sm text-slate-500">
                Page {page} of {data.pagination.pages}
              </span>
              <Button variant="secondary" size="sm" disabled={page >= data.pagination.pages} onClick={() => setPage((p) => p + 1)}>
                Next
              </Button>
            </div>
          )}
        </>
      )}

      <DeleteVideoModal video={toDelete} onClose={() => setToDelete(null)} onDeleted={() => refetch({ silent: true })} />
    </div>
  );
}
