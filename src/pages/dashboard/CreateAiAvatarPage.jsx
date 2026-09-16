import { useRef, useState } from 'react';
import { Image as ImageIcon, Sparkles, Upload } from 'lucide-react';
import { useNavigate } from 'react-router';
import { PageHeader } from '../../components/PageHeader.jsx';
import { Button } from '../../components/ui/Button.jsx';
import { Card, CardBody, CardHeader } from '../../components/ui/Card.jsx';
import { Input } from '../../components/ui/Field.jsx';
import { ProgressBar } from '../../components/ui/ProgressBar.jsx';
import { ErrorState, LoadingState } from '../../components/ui/States.jsx';
import { useApi } from '../../hooks/useApi.js';
import { useDocumentTitle } from '../../hooks/useDocumentTitle.js';
import { avatarService } from '../../services/index.js';
import { toast } from '../../store/toastStore.js';
import { useAppConfig } from '../../store/configStore.js';
import { cn } from '../../utils/cn.js';
import { NoSlotNotice } from './AvatarsPage.jsx';

const ACCEPT = 'image/jpeg,image/png,image/webp,.jpg,.jpeg,.png,.webp';

export default function CreateAiAvatarPage() {
  useDocumentTitle('Create my avatar');
  const navigate = useNavigate();
  const config = useAppConfig();
  const inputRef = useRef(null);
  const { data, error, refetch } = useApi(() => avatarService.list(), []);
  const [name, setName] = useState('');
  const [file, setFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [progress, setProgress] = useState(null);
  const [formError, setFormError] = useState(null);
  const [dragging, setDragging] = useState(false);
  const maxMb = Math.round(config.uploads.maxAvatarPhotoBytes / 1024 / 1024);

  const pick = (f) => {
    setFormError(null);
    if (!f) return;
    if (!/\.(jpe?g|png|webp)$/i.test(f.name)) return setFormError('Upload a JPG, PNG or WebP image.');
    if (f.size > config.uploads.maxAvatarPhotoBytes) return setFormError(`The file is larger than ${maxMb} MB.`);
    setFile(f);
    setPreviewUrl(URL.createObjectURL(f));
  };

  const submit = async (e) => {
    e.preventDefault();
    if (name.trim().length < 2) return setFormError('Give your avatar a name.');
    if (!file) return setFormError('Choose an image to create your avatar from.');
    setFormError(null);
    setProgress(0);
    try {
      const { avatar } = await avatarService.createPhoto(
        { name: name.trim(), file },
        (evt) => setProgress(evt.total ? (evt.loaded / evt.total) * 100 : 50),
      );
      toast.success(`“${avatar.name}” is being created — it'll appear in My avatars shortly`);
      navigate('/dashboard/avatars');
    } catch (err) {
      setFormError(err.message);
    } finally {
      setProgress(null);
    }
  };

  if (error) return <ErrorState error={error} onRetry={refetch} />;
  if (!data) return <LoadingState />;

  const noSlot = data.slots.used >= data.slots.available;

  return (
    <div className="animate-rise max-w-2xl">
      <PageHeader
        back={{ to: '/dashboard/avatars', label: 'Back to avatars' }}
        eyebrow="AI avatar"
        title="Create my avatar"
        description="Upload a photo — an AI-generated portrait works great, no real person needed — and we'll turn it into a spokesperson avatar you can use in videos. No consent step required."
      />

      {noSlot ? (
        <NoSlotNotice slots={data.slots} itemLabel="avatar" />
      ) : (
        <Card>
          <CardHeader icon={Sparkles} title="Upload a photo" description="A clear, front-facing portrait works best — real or AI-generated." />
          <CardBody>
            <form onSubmit={submit} className="space-y-4">
              <Input label="Avatar name" placeholder="e.g. Maya" value={name} onChange={(e) => setName(e.target.value)} maxLength={60} hint="Shown to visitors in the widget." />
              <div
                onDragOver={(e) => {
                  e.preventDefault();
                  setDragging(true);
                }}
                onDragLeave={() => setDragging(false)}
                onDrop={(e) => {
                  e.preventDefault();
                  setDragging(false);
                  pick(e.dataTransfer.files?.[0]);
                }}
                onClick={() => inputRef.current?.click()}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ') && inputRef.current?.click()}
                className={cn(
                  'flex cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed px-6 py-10 text-center transition',
                  dragging ? 'border-brand-500 bg-brand-50' : 'border-slate-300 bg-slate-50/60 hover:border-brand-400 hover:bg-brand-50/40',
                )}
              >
                <input ref={inputRef} type="file" accept={ACCEPT} className="hidden" onChange={(e) => pick(e.target.files?.[0])} />
                {previewUrl ? (
                  <>
                    <img src={previewUrl} alt="" className="size-24 rounded-xl object-cover" />
                    <p className="mt-3 text-sm font-semibold text-slate-900">{file.name}</p>
                    <p className="text-xs text-slate-500">{(file.size / 1024 / 1024).toFixed(1)} MB · click to replace</p>
                  </>
                ) : (
                  <>
                    <ImageIcon className="size-8 text-slate-400" />
                    <p className="mt-3 text-sm font-semibold text-slate-900">Drop an image here, or click to browse</p>
                    <p className="text-xs text-slate-500">JPG, PNG or WebP · up to {maxMb} MB</p>
                  </>
                )}
              </div>
              {progress !== null && <ProgressBar value={progress} label="Upload progress" />}
              {formError && <p className="text-sm font-medium text-rose-600">{formError}</p>}
              <Button type="submit" icon={Upload} loading={progress !== null}>
                Create avatar
              </Button>
            </form>
          </CardBody>
        </Card>
      )}
    </div>
  );
}
