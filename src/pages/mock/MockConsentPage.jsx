import { useState } from 'react';
import { Camera, CheckCircle2, FlaskConical, ShieldCheck, XCircle } from 'lucide-react';
import { useNavigate, useSearchParams } from 'react-router';
import { Logo } from '../../components/Logo.jsx';
import { Button } from '../../components/ui/Button.jsx';
import { ErrorState, LoadingState } from '../../components/ui/States.jsx';
import { useApi } from '../../hooks/useApi.js';
import { useDocumentTitle } from '../../hooks/useDocumentTitle.js';
import { devService } from '../../services/index.js';
import { toast } from '../../store/toastStore.js';

/** Only follow return URLs that point back into this app. */
function safeReturn(value) {
  if (!value) return '/dashboard/avatars';
  try {
    const url = new URL(value, window.location.origin);
    return url.origin === window.location.origin ? url.pathname + url.search : '/dashboard/avatars';
  } catch {
    return '/dashboard/avatars';
  }
}

/**
 * Development stand-in for HeyGen's hosted consent page. In production the spokesperson is sent
 * to HeyGen instead; this page exists only when the mock HeyGen provider is active.
 */
export default function MockConsentPage() {
  useDocumentTitle('Consent (mock)');
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const group = params.get('group');
  const returnTo = safeReturn(params.get('return'));
  const [busy, setBusy] = useState(null);
  const { data, error, loading } = useApi(() => devService.getMockConsent(group), [group], { enabled: Boolean(group) });

  const decide = async (decision) => {
    setBusy(decision);
    try {
      await devService.decideMockConsent(group, decision);
      toast[decision === 'approve' ? 'success' : 'info'](decision === 'approve' ? 'Consent approved' : 'Consent declined');
      navigate(returnTo, { replace: true });
    } catch (err) {
      toast.fromError(err);
      setBusy(null);
    }
  };

  return (
    <div className="flex min-h-screen flex-col items-center bg-slate-100 px-4 py-10">
      <Logo className="mb-8" />
      <div className="mb-4 flex items-center gap-2 rounded-full bg-amber-50 px-4 py-1.5 text-xs font-semibold text-amber-900 ring-1 ring-amber-200">
        <FlaskConical className="size-3.5" /> Mock HeyGen consent page — development only
      </div>
      <div className="w-full max-w-lg rounded-3xl bg-surface p-8 shadow-float ring-1 ring-slate-200">
        {!group ? (
          <ErrorState error={{ message: 'This consent link is incomplete.' }} />
        ) : error ? (
          <ErrorState error={error} />
        ) : loading || !data ? (
          <LoadingState compact />
        ) : (
          <>
            <span className="grid size-12 place-items-center rounded-2xl bg-brand-50 text-brand-600">
              <ShieldCheck className="size-6" />
            </span>
            <h1 className="mt-5 text-2xl font-bold tracking-tight">Consent to create a digital twin</h1>
            <p className="mt-2 text-slate-600">
              You are being asked to approve the creation of an AI avatar named <strong className="text-slate-900">{data.avatar.name}</strong> from your recorded footage.
            </p>
            <div className="mt-6 rounded-2xl bg-slate-50 p-5 ring-1 ring-slate-200">
              <p className="flex items-center gap-2 text-sm font-semibold text-slate-800">
                <Camera className="size-4" /> On the real page you would record:
              </p>
              <blockquote className="mt-2 border-l-2 border-brand-400 pl-3 text-sm text-slate-600 italic">
                “I confirm that I am the person in this footage and I consent to the creation of my AI avatar.”
              </blockquote>
            </div>
            <div className="mt-8 grid gap-2 sm:grid-cols-2">
              <Button size="lg" icon={CheckCircle2} loading={busy === 'approve'} disabled={Boolean(busy)} onClick={() => decide('approve')}>
                I consent
              </Button>
              <Button size="lg" variant="secondary" icon={XCircle} loading={busy === 'reject'} disabled={Boolean(busy)} onClick={() => decide('reject')}>
                Decline
              </Button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
