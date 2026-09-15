import { useEffect, useMemo, useRef, useState } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  AlertTriangle,
  ArrowLeft,
  ArrowRight,
  Check,
  Coins,
  Film,
  Hand,
  Library,
  MousePointerClick,
  Presentation,
  Package,
  Search,
  ShieldCheck,
  Smile,
  Sparkles,
  Wand2,
} from 'lucide-react';
import { useForm } from 'react-hook-form';
import { Link, useNavigate, useSearchParams } from 'react-router';
import { CUSTOM_MOTION_PROMPT_MAX_CHARS, GESTURES, GESTURE_LABELS } from '#shared/constants';
import { createGenerateVideoSchema } from '#shared/schemas';
import { estimateDurationSeconds } from '#shared/utils';
import { AvatarCard } from '../../components/AvatarCard.jsx';
import { GenerationProgress } from '../../components/GenerationProgress.jsx';
import { PageHeader } from '../../components/PageHeader.jsx';
import { ScriptEditor, estimateCredits } from '../../components/ScriptEditor.jsx';
import { StatusBadge } from '../../components/StatusBadge.jsx';
import { VideoPlayer } from '../../components/VideoPlayer.jsx';
import { Button } from '../../components/ui/Button.jsx';
import { Card, CardBody } from '../../components/ui/Card.jsx';
import { Input, Segmented, Textarea } from '../../components/ui/Field.jsx';
import { EmptyState, ErrorState, InlineAlert, Skeleton } from '../../components/ui/States.jsx';
import { useApi } from '../../hooks/useApi.js';
import { useDocumentTitle } from '../../hooks/useDocumentTitle.js';
import { avatarService, videoService } from '../../services/index.js';
import { useAuthStore } from '../../store/authStore.js';
import { useAppConfig } from '../../store/configStore.js';
import { toast } from '../../store/toastStore.js';
import { cn } from '../../utils/cn.js';
import { formatDuration, formatNumber } from '../../utils/format.js';
import { newIdempotencyKey } from '../../utils/idempotency.js';

const STEPS = ['Avatar', 'Script', 'Review'];
const GESTURE_ICONS = { none: Smile, wave: Hand, board: Presentation, prop: Package, custom: Wand2 };

function Stepper({ step, onStep }) {
  return (
    <ol className="mb-8 flex items-center gap-2 sm:gap-3">
      {STEPS.map((label, i) => {
        const done = i < step;
        const active = i === step;
        return (
          <li key={label} className="flex flex-1 items-center gap-2 sm:gap-3">
            <button
              type="button"
              disabled={!done}
              onClick={() => onStep(i)}
              className={cn('flex items-center gap-2.5 text-left', done && 'cursor-pointer')}
            >
              <span
                className={cn(
                  'grid size-8 shrink-0 place-items-center rounded-full text-sm font-semibold ring-4 transition',
                  done ? 'bg-brand-600 text-white ring-brand-50' : active ? 'bg-slate-900 text-white ring-slate-200' : 'bg-white text-slate-400 ring-slate-100',
                )}
              >
                {done ? <Check className="size-4" strokeWidth={3} /> : i + 1}
              </span>
              <span className={cn('hidden text-sm font-semibold sm:block', active || done ? 'text-slate-900' : 'text-slate-400')}>{label}</span>
            </button>
            {i < STEPS.length - 1 && <span className={cn('h-0.5 flex-1 rounded-full', done ? 'bg-brand-600' : 'bg-slate-200')} />}
          </li>
        );
      })}
    </ol>
  );
}

function AvatarStep({ user, selectedId, onSelect, initialAvatarId }) {
  const { data, loading, error, refetch } = useApi(() => avatarService.list(), []);
  const [gender, setGender] = useState('all');

  // Preselect an avatar chosen elsewhere (e.g. "Use this avatar" on the Avatars page).
  useEffect(() => {
    if (!initialAvatarId || selectedId || !data) return;
    const match = data.avatars.find((a) => a.id === initialAvatarId && a.isReady);
    if (match) onSelect(match);
  }, [data, initialAvatarId, selectedId, onSelect]);
  const [style, setStyle] = useState('all');
  const [query, setQuery] = useState('');
  const [expressiveOnly, setExpressiveOnly] = useState(false);

  const avatars = data?.avatars ?? [];
  const styles = useMemo(() => [...new Set(avatars.map((a) => a.style).filter(Boolean))].sort(), [avatars]);
  // supportsExpressive is only present at all when the current plan has an expressive tier —
  // absent entirely (e.g. Growth) means there's nothing to filter by.
  const expressiveFilterAvailable = avatars.some((a) => a.supportsExpressive !== undefined);
  const filtered = avatars.filter(
    (a) =>
      (gender === 'all' || a.gender === gender) &&
      (style === 'all' || a.style === style) &&
      (!expressiveOnly || a.supportsExpressive) &&
      (!query || a.name.toLowerCase().includes(query.toLowerCase())),
  );

  if (error) return <ErrorState error={error} onRetry={refetch} />;
  if (loading)
    return (
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
        {Array.from({ length: 10 }, (_, i) => (
          <Skeleton key={i} className="aspect-[4/6] rounded-2xl" />
        ))}
      </div>
    );

  if (user.plan === 'GROWTH') {
    if (!avatars.length) {
      return (
        <EmptyState
          icon={Sparkles}
          title="Create your digital twin first"
          description="Growth videos use your own spokesperson. Upload a short recording to get started."
          action={<Button to="/dashboard/avatars">Create digital twin</Button>}
        />
      );
    }
    const anyReady = avatars.some((a) => a.isReady);
    return (
      <div className="space-y-5">
        {!anyReady && (
          <InlineAlert tone="warning" icon={ShieldCheck} title="Your digital twin is still being prepared" action={<Button to="/dashboard/avatars" size="sm" variant="secondary">Check status</Button>}>
            Training usually finishes within a few minutes.
          </InlineAlert>
        )}
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4" role="radiogroup" aria-label="Digital twins">
          {avatars.map((avatar) => (
            <AvatarCard key={avatar.id} avatar={avatar} showConsent selected={selectedId === avatar.id} disabled={!avatar.isReady} onSelect={onSelect} />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex flex-wrap items-center gap-2">
          <Segmented
            value={gender}
            onChange={setGender}
            options={[
              { value: 'all', label: 'All' },
              { value: 'female', label: 'Female' },
              { value: 'male', label: 'Male' },
            ]}
          />
          <div className="flex flex-wrap gap-1.5">
            {['all', ...styles].map((s) => (
              <button
                key={s}
                type="button"
                onClick={() => setStyle(s)}
                className={cn(
                  'rounded-full px-3 py-1.5 text-xs font-medium ring-1 transition',
                  style === s ? 'bg-slate-900 text-white ring-slate-900' : 'bg-white text-slate-600 ring-slate-200 hover:ring-slate-300',
                )}
              >
                {s === 'all' ? 'Any style' : s}
              </button>
            ))}
          </div>
          {expressiveFilterAvailable && (
            <button
              type="button"
              onClick={() => setExpressiveOnly((v) => !v)}
              className={cn(
                'flex items-center gap-1 rounded-full px-3 py-1.5 text-xs font-medium ring-1 transition',
                expressiveOnly ? 'bg-amber-500 text-white ring-amber-500' : 'bg-white text-slate-600 ring-slate-200 hover:ring-slate-300',
              )}
            >
              <Sparkles className="size-3.5" /> Expressive-ready only
            </button>
          )}
        </div>
        <Input icon={Search} placeholder="Search avatars" value={query} onChange={(e) => setQuery(e.target.value)} className="lg:w-60" aria-label="Search avatars" />
      </div>
      {filtered.length ? (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5" role="radiogroup" aria-label="Stock avatars">
          {filtered.map((avatar) => (
            <AvatarCard key={avatar.id} avatar={avatar} selected={selectedId === avatar.id} onSelect={onSelect} />
          ))}
        </div>
      ) : (
        <EmptyState icon={Library} title="No avatars match" description="Try a different filter." />
      )}
    </div>
  );
}

function GenerationView({ videoId, onRestart }) {
  const navigate = useNavigate();
  const refreshUser = useAuthStore((s) => s.refreshUser);
  const [creating, setCreating] = useState(false);
  const { data, error, refetch } = useApi(() => videoService.get(videoId), [videoId], {
    poll: (d) => (d?.video && ['QUEUED', 'PROCESSING'].includes(d.video.status) ? 3000 : null),
  });
  const video = data?.video;
  const status = video?.status;

  useEffect(() => {
    if (status && !['QUEUED', 'PROCESSING'].includes(status)) refreshUser();
  }, [status, refreshUser]);

  const makePrimary = async () => {
    setCreating(true);
    try {
      const { widget } = await videoService.makePrimary(video.id);
      toast.success('This video is now live on your site');
      navigate(`/dashboard/widgets/${widget.id}`);
    } catch (err) {
      toast.fromError(err);
      setCreating(false);
    }
  };

  if (error) return <ErrorState error={error} onRetry={refetch} />;
  if (!video) return <Skeleton className="h-64 rounded-2xl" />;

  return (
    <div className="grid gap-8 lg:grid-cols-[minmax(0,320px)_1fr]">
      <div>
        {video.status === 'COMPLETED' ? (
          <VideoPlayer src={video.videoUrl} poster={video.thumbnailUrl} captions={video.captions} autoPlay />
        ) : (
          <div className="relative aspect-[3/4] overflow-hidden rounded-2xl bg-slate-100 ring-1 ring-slate-200">
            {video.avatar?.thumbnailUrl && <img src={video.avatar.thumbnailUrl} alt="" className="size-full object-cover opacity-60 blur-[1px]" />}
            {video.stage !== 'failed' && <div className="skeleton absolute inset-0 rounded-none opacity-50" />}
          </div>
        )}
      </div>
      <div className="space-y-5">
        <div className="flex flex-wrap items-center gap-2">
          <h2 className="text-xl font-bold tracking-tight text-slate-900">{video.title}</h2>
          <StatusBadge status={video.status} />
        </div>
        <GenerationProgress video={video} />
        {video.status === 'COMPLETED' && (
          <Card>
            <CardBody className="space-y-4">
              <p className="text-sm text-slate-600">
                Charged <span className="font-semibold text-slate-900">{video.creditsCharged} credits</span> for {formatDuration(video.duration)} of video
                {video.creditsReserved > video.creditsCharged && ` — ${video.creditsReserved - video.creditsCharged} unused credits were returned`}.
              </p>
              <div className="flex flex-wrap gap-2">
                <Button icon={Wand2} onClick={makePrimary} loading={creating}>
                  {video.isPrimary ? 'Already live — open widget' : 'Make primary (show on my site)'}
                </Button>
                <Button variant="secondary" to={`/dashboard/videos/${video.id}`}>
                  View details
                </Button>
                <Button variant="ghost" onClick={onRestart}>
                  Create another
                </Button>
              </div>
            </CardBody>
          </Card>
        )}
        {video.stage === 'failed' && (
          <div className="flex gap-2">
            <Button onClick={onRestart} icon={ArrowLeft}>
              Edit and try again
            </Button>
            <Button variant="secondary" to="/dashboard/videos">
              Go to library
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}

export default function CreateVideoPage() {
  useDocumentTitle('Create video');
  const user = useAuthStore((s) => s.user);
  const refreshUser = useAuthStore((s) => s.refreshUser);
  const config = useAppConfig();
  const [params, setParams] = useSearchParams();
  const videoId = params.get('video');
  const plan = config.plans.find((p) => p.id === user.plan);
  const schema = useMemo(() => createGenerateVideoSchema(config.script), [config.script]);

  const [step, setStep] = useState(0);
  const [avatar, setAvatar] = useState(null);
  const [submitError, setSubmitError] = useState(null);
  const idempotencyKey = useRef(newIdempotencyKey());

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    trigger,
    setError,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(schema),
    mode: 'onTouched',
    defaultValues: { avatarId: '', title: '', script: '', gesture: 'none', customMotionPrompt: '', ctaUrl: '', avatarStyle: 'normal' },
  });

  const script = watch('script') ?? '';
  const gesture = watch('gesture');
  const customMotionPrompt = watch('customMotionPrompt');
  const avatarStyle = watch('avatarStyle');
  // Only offered on plans that define an expressive tier (Starter today) — /api/config simply
  // omits expressiveCreditsPerMinute for plans that don't have one.
  const expressiveAvailable = Boolean(plan?.expressiveCreditsPerMinute);
  const expressive = expressiveAvailable && avatarStyle === 'expressive';
  // Any gesture forces HeyGen's motion-capable engine — confirmed by a real test generation that
  // motion_prompt is rejected on every other engine for every avatar this app uses. Overrides
  // Avatar style entirely, same precedence the server enforces.
  const motionRequested = gesture !== 'none';
  const effectiveCreditsPerMinute = motionRequested ? config.motion.creditsPerMinute : expressive ? plan.expressiveCreditsPerMinute : plan?.creditsPerMinute;
  const seconds = estimateDurationSeconds(script, config.script.wordsPerMinute);
  const credits = estimateCredits(seconds, effectiveCreditsPerMinute, config.credits.minPerVideo);
  const insufficient = (user.credits ?? 0) < credits;

  const selectAvatar = (a) => {
    setAvatar(a);
    setValue('avatarId', a.id, { shouldValidate: true });
  };

  const next = async () => {
    if (step === 0) {
      if (!avatar) return toast.error('Choose an avatar to continue.');
      setStep(1);
    } else if (step === 1) {
      const valid = await trigger(['title', 'script', 'ctaUrl', 'customMotionPrompt']);
      if (valid) setStep(2);
    }
  };

  const onGenerate = async (values) => {
    setSubmitError(null);
    try {
      const { video } = await videoService.generate(values, idempotencyKey.current);
      refreshUser();
      toast.success('Generation started');
      setParams({ video: video.id });
    } catch (error) {
      // A definitive rejection means nothing was charged — allow a fresh attempt. On network
      // errors keep the key: retrying returns the same generation instead of creating another.
      if (error.status) idempotencyKey.current = newIdempotencyKey();
      Object.entries(error.fieldErrors?.() ?? {}).forEach(([name, message]) => setError(name, { message }));
      setSubmitError(error);
    }
  };

  const restart = () => {
    idempotencyKey.current = newIdempotencyKey();
    setParams({});
    setStep(2);
  };

  return (
    <div className="animate-rise">
      <PageHeader
        eyebrow={plan ? `${plan.name} plan` : undefined}
        title="Create a spokesperson video"
        description={user.plan === 'GROWTH' ? 'Generate a video with your own digital twin.' : 'Choose a stock avatar, write your script and generate.'}
        back={{ to: '/dashboard/videos', label: 'Videos' }}
      />

      {videoId ? (
        <GenerationView videoId={videoId} onRestart={restart} />
      ) : (
        <form onSubmit={handleSubmit(onGenerate)} noValidate>
          <Stepper step={step} onStep={setStep} />

          {step === 0 && (
            <section className="animate-rise">
              <h2 className="mb-1 text-lg font-semibold text-slate-900">{user.plan === 'GROWTH' ? 'Your digital twin' : 'Choose your spokesperson'}</h2>
              <p className="mb-5 text-sm text-slate-500">{plan?.tagline}</p>
              <AvatarStep user={user} selectedId={avatar?.id} onSelect={selectAvatar} initialAvatarId={params.get('avatar')} />
            </section>
          )}

          {step === 1 && (
            <section className="grid animate-rise gap-6 lg:grid-cols-[1fr_300px]">
              <Card>
                <CardBody className="space-y-5">
                  <Input label="Video title" placeholder="e.g. Homepage welcome" maxLength={100} hint="Only you see this — it helps you find the video later." error={errors.title?.message} {...register('title')} />
                  <ScriptEditor
                    register={register}
                    errors={errors}
                    setValue={setValue}
                    script={script}
                    limits={config.script}
                    creditsPerMinute={effectiveCreditsPerMinute}
                    minCredits={config.credits.minPerVideo}
                    mockFailToken={config.mockFailToken}
                  />
                </CardBody>
              </Card>
              <div className="space-y-4">
                {expressiveAvailable && (
                  <Card>
                    <CardBody>
                      <p className="text-sm font-semibold text-slate-900">Avatar style</p>
                      <p className="mt-0.5 text-xs text-slate-500">Expressive uses a higher-fidelity engine with more natural motion, at a higher credit rate.</p>
                      <div className="mt-3 grid grid-cols-2 gap-2">
                        <button
                          type="button"
                          onClick={() => setValue('avatarStyle', 'normal')}
                          className={cn(
                            'rounded-xl p-2.5 text-left text-xs font-medium ring-1 transition',
                            !expressive ? 'bg-brand-50 text-brand-800 ring-2 ring-brand-500' : 'bg-white text-slate-600 ring-slate-200 hover:ring-slate-300',
                          )}
                        >
                          <p className="font-semibold">Normal</p>
                          <p className="mt-0.5 text-slate-500">{plan?.creditsPerMinute} credits / min</p>
                        </button>
                        <button
                          type="button"
                          onClick={() => setValue('avatarStyle', 'expressive')}
                          className={cn(
                            'rounded-xl p-2.5 text-left text-xs font-medium ring-1 transition',
                            expressive ? 'bg-brand-50 text-brand-800 ring-2 ring-brand-500' : 'bg-white text-slate-600 ring-slate-200 hover:ring-slate-300',
                          )}
                        >
                          <p className="flex items-center gap-1 font-semibold">
                            <Sparkles className="size-3.5" /> Expressive
                          </p>
                          <p className="mt-0.5 text-slate-500">{plan.expressiveCreditsPerMinute} credits / min</p>
                        </button>
                      </div>
                    </CardBody>
                  </Card>
                )}
                <Card>
                  <CardBody>
                    <p className="text-sm font-semibold text-slate-900">On-camera behaviour</p>
                    <p className="mt-0.5 text-xs text-slate-500">
                      {motionRequested
                        ? `Gestures use a motion-capable engine at ${config.motion.creditsPerMinute} credits/min, overriding Avatar style above.`
                        : 'Applied when the avatar engine supports gestures.'}
                    </p>
                    <div className="mt-3 grid grid-cols-2 gap-2">
                      {GESTURES.map((g) => {
                        const Icon = GESTURE_ICONS[g];
                        const locked = g !== 'none' && avatar?.supportsMotion === false;
                        return (
                          <button
                            key={g}
                            type="button"
                            disabled={locked}
                            onClick={() => !locked && setValue('gesture', g)}
                            className={cn(
                              'flex flex-col items-start gap-1.5 rounded-xl p-2.5 text-left text-xs font-medium ring-1 transition',
                              locked
                                ? 'cursor-not-allowed bg-slate-50 text-slate-300 ring-slate-100'
                                : gesture === g
                                  ? 'bg-brand-50 text-brand-800 ring-2 ring-brand-500'
                                  : 'bg-white text-slate-600 ring-slate-200 hover:ring-slate-300',
                            )}
                          >
                            <Icon className="size-4" />
                            {GESTURE_LABELS[g]}
                          </button>
                        );
                      })}
                    </div>
                    {avatar?.supportsMotion === false && (
                      <p className="mt-2 text-xs text-amber-700">This avatar doesn't support gestures. Pick a different avatar to use Wave, Board, Prop, or Custom motion.</p>
                    )}
                    {gesture === 'custom' && (
                      <div className="mt-3">
                        <Textarea
                          label="Describe the motion"
                          rows={2}
                          placeholder="e.g. Lean forward and count on your fingers while explaining three benefits."
                          maxLength={CUSTOM_MOTION_PROMPT_MAX_CHARS}
                          error={errors.customMotionPrompt?.message}
                          {...register('customMotionPrompt')}
                        />
                      </div>
                    )}
                  </CardBody>
                </Card>
                <div className="rounded-2xl bg-slate-900 p-5 text-sm text-slate-300">
                  <p className="font-semibold text-white">Script tips</p>
                  <ul className="mt-2 list-disc space-y-1.5 pl-4">
                    <li>Aim for 20–45 seconds.</li>
                    <li>Greet, give one reason to care, then one next step.</li>
                    <li>Write the way you speak — short sentences read naturally.</li>
                  </ul>
                </div>
              </div>
            </section>
          )}

          {step === 2 && (
            <section className="grid animate-rise gap-6 lg:grid-cols-[1fr_340px]">
              <Card>
                <CardBody className="space-y-5">
                  <div className="flex items-center gap-4">
                    {avatar?.thumbnailUrl && <img src={avatar.thumbnailUrl} alt="" className="size-16 rounded-xl object-cover ring-1 ring-slate-200" />}
                    <div>
                      <p className="text-xs font-medium text-slate-500">Spokesperson</p>
                      <p className="text-base font-semibold text-slate-900">{avatar?.name}</p>
                      <p className="text-xs text-slate-500">
                        {GESTURE_LABELS[gesture]}
                        {expressive && ' · Expressive'}
                      </p>
                      {gesture === 'custom' && customMotionPrompt && (
                        <p className="mt-0.5 text-xs text-slate-400 italic">“{customMotionPrompt}”</p>
                      )}
                    </div>
                    <Button variant="ghost" size="sm" className="ml-auto" onClick={() => setStep(0)}>
                      Change
                    </Button>
                  </div>
                  <div className="rounded-xl bg-slate-50 p-4 ring-1 ring-slate-100">
                    <div className="flex items-center justify-between">
                      <p className="text-xs font-semibold tracking-wide text-slate-500 uppercase">{watch('title') || 'Untitled video'}</p>
                      <Button variant="ghost" size="xs" onClick={() => setStep(1)}>
                        Edit
                      </Button>
                    </div>
                    <p className="mt-2 text-[15px] leading-relaxed whitespace-pre-line text-slate-800">{script}</p>
                    {watch('ctaUrl') && (
                      <p className="mt-3 flex items-center gap-1.5 text-xs text-slate-500">
                        <MousePointerClick className="size-3.5" /> {watch('ctaUrl')}
                      </p>
                    )}
                  </div>
                </CardBody>
              </Card>

              <Card className="h-fit">
                <CardBody className="space-y-4">
                  <dl className="space-y-2.5 text-sm">
                    <div className="flex justify-between">
                      <dt className="text-slate-500">Estimated length</dt>
                      <dd className="font-semibold tabular-nums">{formatDuration(seconds)}</dd>
                    </div>
                    <div className="flex justify-between">
                      <dt className="text-slate-500">Rate</dt>
                      <dd className="font-semibold">{effectiveCreditsPerMinute} credits / min</dd>
                    </div>
                    <div className="flex justify-between border-t border-slate-100 pt-2.5">
                      <dt className="font-medium text-slate-700">Credits reserved</dt>
                      <dd className="text-lg font-bold text-brand-700 tabular-nums">{credits}</dd>
                    </div>
                    <div className="flex justify-between">
                      <dt className="text-slate-500">Your balance</dt>
                      <dd className={cn('font-semibold tabular-nums', insufficient ? 'text-rose-600' : 'text-slate-900')}>{formatNumber(user.credits)}</dd>
                    </div>
                  </dl>
                  <p className="text-xs text-slate-500">You are charged for the final video length (never more than reserved). Failed generations are refunded automatically.</p>

                  {insufficient && (
                    <InlineAlert tone="warning" icon={Coins} action={<Button to="/dashboard/billing" size="sm" variant="secondary">Buy credits</Button>}>
                      You need {credits - user.credits} more credits.
                    </InlineAlert>
                  )}
                  {submitError && (
                    <InlineAlert
                      tone="danger"
                      icon={AlertTriangle}
                      title={submitError.code === 'CONSENT_REQUIRED' ? 'Consent required' : 'Could not start generation'}
                      action={submitError.code === 'CONSENT_REQUIRED' ? <Link className="font-semibold underline" to="/dashboard/avatars">Fix</Link> : null}
                    >
                      {submitError.message}
                    </InlineAlert>
                  )}
                  <Button type="submit" size="lg" icon={Film} className="w-full" loading={isSubmitting} disabled={insufficient}>
                    Generate video
                  </Button>
                </CardBody>
              </Card>
            </section>
          )}

          {step < 2 && (
            <div className="sticky bottom-0 z-10 -mx-4 mt-8 flex items-center justify-between gap-3 border-t border-slate-200/70 bg-slate-50/90 px-4 py-4 backdrop-blur sm:-mx-6 sm:px-6 lg:-mx-8 lg:px-8">
              <Button variant="ghost" icon={ArrowLeft} onClick={() => setStep((s) => Math.max(0, s - 1))} disabled={step === 0}>
                Back
              </Button>
              <div className="flex items-center gap-3">
                {avatar && step === 0 && <span className="hidden text-sm text-slate-500 sm:block">Selected: <strong className="text-slate-800">{avatar.name}</strong></span>}
                <Button onClick={next} iconRight={ArrowRight} disabled={step === 0 && !avatar}>
                  Continue
                </Button>
              </div>
            </div>
          )}
        </form>
      )}
    </div>
  );
}
