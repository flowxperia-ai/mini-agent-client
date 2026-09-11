import { useState } from 'react';
import { AlertTriangle } from 'lucide-react';
import { videoService } from '../services/index.js';
import { toast } from '../store/toastStore.js';
import { Button } from './ui/Button.jsx';
import { Modal } from './ui/Modal.jsx';
import { InlineAlert } from './ui/States.jsx';

export function DeleteVideoModal({ video, onClose, onDeleted }) {
  const [busy, setBusy] = useState(false);
  const widgets = video?.widgets?.length ?? 0;

  const confirm = async () => {
    setBusy(true);
    try {
      await videoService.remove(video.id);
      toast.success('Video deleted');
      onDeleted?.(video);
      onClose();
    } catch (error) {
      toast.fromError(error);
    } finally {
      setBusy(false);
    }
  };

  return (
    <Modal
      open={Boolean(video)}
      onClose={onClose}
      title="Delete video?"
      size="sm"
      footer={
        <>
          <Button variant="secondary" onClick={onClose}>
            Cancel
          </Button>
          <Button variant="danger" onClick={confirm} loading={busy}>
            Delete video
          </Button>
        </>
      }
    >
      <p className="text-sm text-slate-600">
        <strong className="text-slate-900">{video?.title}</strong> and its stored files will be permanently removed. Credits already spent are not refunded.
      </p>
      {widgets > 0 && (
        <InlineAlert tone="warning" icon={AlertTriangle} className="mt-4">
          {widgets === 1 ? 'Its widget' : `Its ${widgets} widgets`} will also be deleted and disappear from any website where it is embedded.
        </InlineAlert>
      )}
    </Modal>
  );
}
