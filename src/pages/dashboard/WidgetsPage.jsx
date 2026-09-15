import { Code2, Film } from 'lucide-react';
import { WidgetCard } from '../../components/WidgetCard.jsx';
import { PageHeader } from '../../components/PageHeader.jsx';
import { Button } from '../../components/ui/Button.jsx';
import { EmptyState, ErrorState, Skeleton } from '../../components/ui/States.jsx';
import { useApi } from '../../hooks/useApi.js';
import { useDocumentTitle } from '../../hooks/useDocumentTitle.js';
import { widgetService } from '../../services/index.js';

export default function WidgetsPage() {
  useDocumentTitle('Widgets');
  const { data, error, loading, refetch } = useApi(() => widgetService.list(), []);

  return (
    <div className="animate-rise">
      <PageHeader
        title="Widgets"
        description="Every embeddable widget you've created. Open one to change its video or settings — updates go live on the customer's site automatically."
        actions={
          <Button to="/dashboard/videos" icon={Film}>
            Go to videos
          </Button>
        }
      />

      {error ? (
        <ErrorState error={error} onRetry={refetch} />
      ) : loading || !data ? (
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {Array.from({ length: 8 }, (_, i) => (
            <Skeleton key={i} className="aspect-[4/6] rounded-2xl" />
          ))}
        </div>
      ) : data.items.length === 0 ? (
        <EmptyState
          icon={Code2}
          title="No widgets yet"
          description="Create a widget from any completed video to get an embed code for your customer's website."
          action={
            <Button to="/dashboard/videos" icon={Film}>
              Go to videos
            </Button>
          }
        />
      ) : (
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {data.items.map((widget) => (
            <WidgetCard key={widget.id} widget={widget} onChanged={() => refetch({ silent: true })} />
          ))}
        </div>
      )}
    </div>
  );
}
