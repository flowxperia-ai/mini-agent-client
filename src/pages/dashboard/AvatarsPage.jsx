import { useEffect, useRef, useState } from 'react';
import {
  CheckCircle2,
  Circle,
  Copy,
  Download,
  ExternalLink,
  FileVideo,
  Loader2,
  Plus,
  RefreshCw,
  ShieldCheck,
  Sparkles,
  Upload,
  UserRound,
  XCircle,
} from 'lucide-react';
import { useNavigate, useSearchParams } from 'react-router';
import { AvatarCard } from '../../components/AvatarCard.jsx';
import { PageHeader } from '../../components/PageHeader.jsx';
import { StatusBadge } from '../../components/StatusBadge.jsx';
import { Button } from '../../components/ui/Button.jsx';
import { Card, CardBody, CardHeader } from '../../components/ui/Card.jsx';
import { Input, Segmented } from '../../components/ui/Field.jsx';
import { ProgressBar } from '../../components/ui/ProgressBar.jsx';
import { EmptyState, ErrorState, InlineAlert, Skeleton } from '../../components/ui/States.jsx';
import { useApi } from '../../hooks/useApi.js';
import { useCopy } from '../../hooks/useCopy.js';
import { useDocumentTitle } from '../../hooks/useDocumentTitle.js';
import { avatarService } from '../../services/index.js';
import { useAuthStore } from '../../store/authStore.js';
import { useAppConfig } from '../../store/configStore.js';
import { toast } from '../../store/toastStore.js';
import { cn } from '../../utils/cn.js';
import { formatRelative } from '../../utils/format.js';

const ACCEPT = 'video/mp4,video/quicktime,video/webm,.mp4,.mov,.webm';

/* ------------------------------------------------------------------ */
/* Starter: stock library                                              */
/* ------------------------------------------------------------------ */

function StockLibrary({ avatars }) {
  const navigate = useNavigate();
  return (
    <>
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
        {avatars.map((avatar) => (
          <AvatarCard key={avatar.id} avatar={avatar} onSelect={(a) => navigate(`/dashboard/create?avatar=${a.id}`)} />
        ))}
      </div>
    </>
  );
}

/* ------------------------------------------------------------------ */
/* Growth: create a digital twin, or import one already on HeyGen      */
/* ------------------------------------------------------------------ */

function NoSlotNotice({ slots, itemLabel }) {
  return (
    <InlineAlert tone="warning" icon={ShieldCheck} title="You need a custom avatar slot" action={<Button size="sm" to="/dashboard/billing">Buy a slot</Button>}>
      Each {itemLabel} uses one custom avatar slot, billed separately from generation credits. You have used {slots.used} of {slots.available}.
    </InlineAlert>
  );
}

function CreateTwinForm({ slots, onCreated }) {
  const config = useAppConfig();
  const inputRef = useRef(null);
  const [name, setName] = useState('');
  const [file, setFile] = useState(null);
  const [progress, setProgress] = useState(null);
  const [error, setError] = useState(null);
  const [dragging, setDragging] = useState(false);
  const maxMb = Math.round(config.uploads.maxBytes / 1024 / 1024);
  const noSlot = slots && slots.used >= slots.available;

  const pick = (f) => {
    setError(null);
    if (!f) return;
    if (!/\.(mp4|mov|webm)$/i.test(f.name)) return setError('Upload an MP4, MOV or WebM video.');
    if (f.size > config.uploads.maxBytes) return setError(`The file is larger than ${maxMb} MB.`);
    setFile(f);
  };

  const submit = async (e) => {
    e.preventDefault();
    if (name.trim().length < 2) return setError('Give your digital twin a name.');
    if (!file) return setError('Choose a video of your spokesperson.');
    setError(null);
    setProgress(0);
    try {
      const { avatar } = await avatarService.createCustom({ name: name.trim(), file }, (evt) => setProgress(evt.total ? (evt.loaded / evt.total) * 100 : 50));
      toast.success('Digital twin created — now complete the consent step');
      setName('');
      setFile(null);
      onCreated(avatar);
    } catch (err) {
      setError(err.message);
    } finally {
      setProgress(null);
    }
  };

  if (noSlot) return <NoSlotNotice slots={slots} itemLabel="digital twin" />;

  return (
    <form onSubmit={submit} className="grid gap-6 lg:grid-cols-[1fr_280px]">
      <div className="space-y-4">
        <Input label="Spokesperson name" placeholder="e.g. Jordan" value={name} onChange={(e) => setName(e.target.value)} maxLength={60} hint="Shown to visitors in the widget." />
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
          {file ? (
            <>
              <FileVideo className="size-8 text-brand-600" />
              <p className="mt-3 text-sm font-semibold text-slate-900">{file.name}</p>
              <p className="text-xs text-slate-500">{(file.size / 1024 / 1024).toFixed(1)} MB · click to replace</p>
            </>
          ) : (
            <>
              <Upload className="size-8 text-slate-400" />
              <p className="mt-3 text-sm font-semibold text-slate-900">Drop your recording here, or click to browse</p>
              <p className="text-xs text-slate-500">MP4, MOV or WebM · up to {maxMb} MB</p>
            </>
          )}
        </div>
        {progress !== null && <ProgressBar value={progress} label="Upload progress" />}
        {error && <p className="text-sm font-medium text-rose-600">{error}</p>}
        <Button type="submit" icon={Upload} loading={progress !== null}>
          Upload &amp; start consent
        </Button>
      </div>
      <div className="rounded-2xl bg-slate-50 p-5 text-sm ring-1 ring-slate-100">
        <p className="font-semibold text-slate-900">Recording tips</p>
        <ul className="mt-3 space-y-2 text-slate-600">
          {['One person, facing the camera', 'Even lighting, plain background', 'Speak naturally for a couple of minutes', 'No music or background noise'].map((t) => (
            <li key={t} className="flex gap-2">
              <CheckCircle2 className="mt-0.5 size-4 shrink-0 text-emerald-500" /> {t}
            </li>
          ))}
        </ul>
        <div className="mt-4 flex gap-2 rounded-xl bg-amber-50 p-3 text-xs text-amber-900 ring-1 ring-amber-200">
          <ShieldCheck className="size-4 shrink-0" />
          The person in the video must personally approve the consent request before the twin can be used.
        </div>
      </div>
    </form>
  );
}

/** Link an avatar that already exists on the connected HeyGen account (made outside our app). */
function ImportAvatarList({ slots, onImported }) {
  const { data, loading, error, refetch } = useApi(() => avatarService.importable(), []);
  const [importing, setImporting] = useState(null);
  const noSlot = slots && slots.used >= slots.available;

  const doImport = async (providerAvatarId) => {
    setImporting(providerAvatarId);
    try {
      const { avatar } = await avatarService.import(providerAvatarId);
      toast.success(avatar.isReady ? `Imported “${avatar.name}” — ready to generate` : `Imported “${avatar.name}” — consent still needed`);
      onImported(avatar);
    } catch (err) {
      toast.fromError(err);
    } finally {
      setImporting(null);
    }
  };

  if (noSlot) return <NoSlotNotice slots={slots} itemLabel="imported avatar" />;
  if (error) return <ErrorState error={error} onRetry={refetch} />;
  if (loading) return <Skeleton className="h-32 rounded-2xl" />;

  if (!data.avatars.length) {
    return (
      <EmptyState
        icon={Download}
        title="No HeyGen avatars found to import"
        description="Create an avatar directly in your HeyGen dashboard (app.heygen.com), then come back and refresh — it'll show up here."
        action={
          <Button variant="secondary" icon={RefreshCw} onClick={() => refetch()}>
            Refresh
          </Button>
        }
      />
    );
  }

  return (
    <div className="space-y-3">
      <div className="grid gap-3 sm:grid-cols-2">
        {data.avatars.map((a) => (
          <div key={a.providerAvatarId} className="flex items-center gap-3 rounded-2xl bg-white p-4 ring-1 ring-slate-200">
            {a.thumbnailUrl ? (
              <img src={a.thumbnailUrl} alt="" className="size-14 shrink-0 rounded-xl object-cover" />
            ) : (
              <span className="grid size-14 shrink-0 place-items-center rounded-xl bg-slate-100 text-slate-400">
                <UserRound className="size-6" />
              </span>
            )}
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-semibold text-slate-900">{a.name}</p>
              <p className="text-xs text-slate-500">{a.requiresConsent ? 'Needs HeyGen consent' : 'Ready immediately'}</p>
            </div>
            <Button size="sm" icon={Download} loading={importing === a.providerAvatarId} disabled={Boolean(importing)} onClick={() => doImport(a.providerAvatarId)}>
              Import
            </Button>
          </div>
        ))}
      </div>
      <Button variant="ghost" size="sm" icon={RefreshCw} onClick={() => refetch()}>
        Refresh list
      </Button>
    </div>
  );
}

function AddAvatarCard({ slots, onAdded }) {
  const [mode, setMode] = useState('upload');
  return (
    <Card>
      <CardHeader
        icon={mode === 'upload' ? Plus : Download}
        title={mode === 'upload' ? 'Create your digital twin' : 'Import from HeyGen'}
        description={
          mode === 'upload'
            ? 'Upload a short recording of your spokesperson. We create the twin and start the consent flow.'
            : 'Already have an avatar on your HeyGen account? Link it in instead of starting over.'
        }
        actions={
          <Segmented
            size="sm"
            value={mode}
            onChange={setMode}
            options={[
              { value: 'upload', label: 'Upload new' },
              { value: 'import', label: 'Import from HeyGen' },
            ]}
          />
        }
      />
      <CardBody>{mode === 'upload' ? <CreateTwinForm slots={slots} onCreated={onAdded} /> : <ImportAvatarList slots={slots} onImported={onAdded} />}</CardBody>
    </Card>
  );
}

/* ------------------------------------------------------------------ */
/* Growth: twin status + consent flow                                  */
/* ------------------------------------------------------------------ */

function Step({ state, title, description }) {
  const icon =
    state === 'done' ? <CheckCircle2 className="size-5 text-emerald-500" /> : state === 'active' ? <Loader2 className="size-5 animate-spin text-brand-600" /> : state === 'error' ? <XCircle className="size-5 text-rose-500" /> : <Circle className="size-5 text-slate-300" />;
  return (
    <li className="flex gap-3">
      <span className="mt-0.5">{icon}</span>
      <div>
        <p className={cn('text-sm font-semibold', state === 'todo' ? 'text-slate-400' : 'text-slate-900')}>{title}</p>
        {description && <p className="text-xs text-slate-500">{description}</p>}
      </div>
    </li>
  );
}

function TwinCard({ initial, highlight }) {
  const navigate = useNavigate();
  const { copy } = useCopy();
  const [avatar, setAvatar] = useState(initial);
  const [starting, setStarting] = useState(false);
  const consent = avatar.consent?.status ?? 'NOT_STARTED';
  const inProgress = !avatar.isReady && !['REJECTED', 'EXPIRED', 'NOT_STARTED'].includes(consent);

  const { refetch, loading } = useApi(
    async () => {
      const status = await avatarService.consentStatus(avatar.id);
      setAvatar((a) => ({ ...a, consent: status.consent, trainingStatus: status.trainingStatus, isReady: status.isReady }));
      return status;
    },
    [avatar.id],
    { poll: inProgress ? 5000 : null, enabled: !avatar.isReady },
  );

  useEffect(() => {
    if (highlight) toast.info('Checking consent status…');
  }, [highlight]);

  const startConsent = async () => {
    setStarting(true);
    try {
      const { avatar: updated } = await avatarService.startConsent(avatar.id);
      setAvatar(updated);
      if (updated.consent?.url) window.open(updated.consent.url, '_blank', 'noopener');
    } catch (err) {
      toast.fromError(err);
    } finally {
      setStarting(false);
    }
  };

  const consentState = consent === 'APPROVED' ? 'done' : ['REJECTED', 'EXPIRED'].includes(consent) ? 'error' : consent === 'NOT_STARTED' ? 'todo' : 'active';
  const trainingState = avatar.trainingStatus === 'READY' ? 'done' : avatar.trainingStatus === 'FAILED' ? 'error' : 'active';

  return (
    <Card className={cn('overflow-hidden', highlight && 'ring-2 ring-brand-500')}>
      <div className="grid md:grid-cols-[200px_1fr]">
        <div className="relative aspect-[4/5] bg-gradient-to-br from-brand-100 to-brand-200 md:aspect-auto">
          {avatar.thumbnailUrl ? <img src={avatar.thumbnailUrl} alt="" className="absolute inset-0 size-full object-cover" /> : <UserRound className="absolute inset-0 m-auto size-14 text-brand-400" />}
        </div>
        <div className="p-5 sm:p-6">
          <div className="flex flex-wrap items-center gap-2">
            <h3 className="text-lg font-semibold text-slate-900">{avatar.name}</h3>
            <StatusBadge kind="consent" status={consent} />
            {avatar.isReady && <span className="text-xs font-medium text-emerald-600">Ready to generate</span>}
          </div>
          <p className="text-xs text-slate-500">Created {formatRelative(avatar.createdAt)}</p>

          <ol className="mt-5 space-y-3.5">
            <Step state="done" title="Footage uploaded" />
            <Step
              state={consentState}
              title="Spokesperson consent (optional)"
              description={
                consent === 'APPROVED'
                  ? 'Approved — thank you!'
                  : consent === 'REJECTED'
                    ? avatar.consent?.rejectionReason ?? 'Consent was declined.'
                    : consent === 'EXPIRED'
                      ? 'The consent link expired. Request a new one if you still want it on record.'
                      : consent === 'NOT_STARTED'
                        ? 'Not required to generate videos, but you can still record it for your own records.'
                        : 'Waiting for the spokesperson to complete the hosted consent page.'
              }
            />
            <Step state={trainingState} title="Avatar training" description={avatar.trainingStatus === 'READY' ? 'Complete' : 'Usually takes a few minutes'} />
            <Step state={avatar.isReady ? 'done' : 'todo'} title="Ready for videos" />
          </ol>

          <div className="mt-6 flex flex-wrap gap-2">
            {avatar.isReady ? (
              <Button icon={Sparkles} onClick={() => navigate('/dashboard/create')}>
                Create a video
              </Button>
            ) : avatar.consent?.url ? (
              <>
                <Button icon={ExternalLink} href={avatar.consent.url} target="_blank" rel="noopener noreferrer">
                  Open consent page
                </Button>
                <Button variant="secondary" icon={Copy} onClick={() => copy(avatar.consent.url, 'Consent link copied — send it to your spokesperson')}>
                  Copy link
                </Button>
              </>
            ) : (
              <Button icon={ShieldCheck} onClick={startConsent} loading={starting}>
                {consent === 'NOT_STARTED' ? 'Start consent' : 'Request a new consent link'}
              </Button>
            )}
            {!avatar.isReady && (
              <Button variant="ghost" icon={RefreshCw} onClick={() => refetch()} loading={loading}>
                Refresh status
              </Button>
            )}
          </div>
          {avatar.error && !avatar.isReady && <p className="mt-3 text-xs text-rose-600">{avatar.error}</p>}
        </div>
      </div>
    </Card>
  );
}

export default function AvatarsPage() {
  useDocumentTitle('Avatars');
  const user = useAuthStore((s) => s.user);
  const [params] = useSearchParams();
  const highlightId = params.get('consent');
  const { data, loading, error, refetch } = useApi(() => avatarService.list(), []);

  const growth = user.plan === 'GROWTH';
  return (
    <div className="animate-rise">
      <PageHeader
        eyebrow={growth ? 'Growth plan' : 'Starter plan'}
        title={growth ? 'Your digital twin' : 'Stock avatar library'}
        description={growth ? 'Create a digital twin of yourself.' : 'Choose from our stock avatar library.'}
        actions={
          growth && data?.slots ? (
            <span className="rounded-full bg-white px-3 py-1.5 text-sm font-medium text-slate-600 ring-1 ring-slate-200">
              {data.slots.used} / {data.slots.available} avatar slots used
            </span>
          ) : null
        }
      />


      {error ? (
        <ErrorState error={error} onRetry={refetch} />
      ) : loading || !data ? (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
          {Array.from({ length: growth ? 1 : 10 }, (_, i) => (
            <Skeleton key={i} className={growth ? 'col-span-full h-72 rounded-2xl' : 'aspect-[4/6] rounded-2xl'} />
          ))}
        </div>
      ) : growth ? (
        <div className="space-y-6">
          {data.avatars.map((avatar) => (
            <TwinCard key={avatar.id} initial={avatar} highlight={avatar.id === highlightId} />
          ))}
          {(data.avatars.length === 0 || data.slots.used < data.slots.available) && <AddAvatarCard slots={data.slots} onAdded={() => refetch({ silent: true })} />}
          {data.avatars.length > 0 && data.slots.used >= data.slots.available && (
            <p className="text-center text-sm text-slate-500">
              Need another spokesperson?{' '}
              <a href="/dashboard/billing" className="font-semibold text-brand-600">
                Buy an extra avatar slot
              </a>
              .
            </p>
          )}
        </div>
      ) : data.avatars.length ? (
        <StockLibrary avatars={data.avatars} />
      ) : (
        <EmptyState icon={UserRound} title="No stock avatars available" description="The avatar library could not be loaded from the provider. Try again shortly." />
      )}
    </div>
  );
}
