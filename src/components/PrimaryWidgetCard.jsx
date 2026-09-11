import { useState } from 'react';
import { Code2, Sparkles } from 'lucide-react';
import { EmbedCode } from './EmbedCode.jsx';
import { Button } from './ui/Button.jsx';
import { Card, CardHeader } from './ui/Card.jsx';
import { Select } from './ui/Field.jsx';
import { LoadingState } from './ui/States.jsx';
import { useApi } from '../hooks/useApi.js';
import { videoService, widgetService } from '../services/index.js';
import { toast } from '../store/toastStore.js';

/**
 * "Paste once, swap forever" card: the account's one auto-created widget, plus a picker to
 * change which completed video it shows. A dashboard extra — stays quiet on error/loading
 * rather than disrupting the rest of the page.
 */
export function PrimaryWidgetCard() {
  const { data, error, setData } = useApi(() => widgetService.getPrimary(), []);
  const { data: videos } = useApi(() => videoService.list({ status: 'completed', limit: 100 }), []);
  const [switching, setSwitching] = useState(false);

  if (error) return null;
  if (!data) {
    return (
      <Card className="p-5">
        <LoadingState compact />
      </Card>
    );
  }

  const widget = data.widget;

  if (!widget) {
    return (
      <Card className="p-5">
        <CardHeader
          icon={Sparkles}
          title="Your website code"
          description="Generate your first video and your permanent embed code appears here automatically."
        />
        <Button className="mt-4" to="/dashboard/create">
          Create your first video
        </Button>
      </Card>
    );
  }

  const completedVideos = videos?.items ?? [];

  const switchVideo = async (videoId) => {
    if (!videoId || videoId === widget.videoId) return;
    setSwitching(true);
    try {
      const { widget: updated } = await widgetService.update(widget.id, { videoId });
      setData({ widget: updated });
      toast.success('Your website now shows the new video');
    } catch (err) {
      toast.fromError(err);
    } finally {
      setSwitching(false);
    }
  };

  return (
    <Card className="p-5">
      <CardHeader icon={Code2} title="Your website code" description="Paste this once — swap the video below any time, no code changes needed." />
      <div className="mt-4 space-y-4">
        <EmbedCode code={widget.embedCode} />
        {completedVideos.length > 1 && (
          <Select
            label="Live video"
            value={widget.videoId}
            disabled={switching}
            onChange={(e) => switchVideo(e.target.value)}
            options={completedVideos.map((v) => ({ value: v.id, label: v.title }))}
          />
        )}
      </div>
    </Card>
  );
}
