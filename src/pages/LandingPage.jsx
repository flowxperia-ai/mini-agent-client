import { useMemo, useState } from 'react';
import {
  ArrowRight,
  Captions,
  ChevronDown,
  Code2,
  Gauge,
  Hand,
  MessageSquareOff,
  MousePointerClick,
  PenLine,
  Play,
  ShieldCheck,
  Smartphone,
  Sparkles,
  UserRound,
} from 'lucide-react';
import { PackageCard } from '../components/PackageCard.jsx';
import { PlanCard } from '../components/PlanCard.jsx';
import { Button } from '../components/ui/Button.jsx';
import { WidgetPreview, buildPreviewConfig } from '../components/WidgetPreview.jsx';
import { useApi } from '../hooks/useApi.js';
import { useDocumentTitle } from '../hooks/useDocumentTitle.js';
import { billingService } from '../services/index.js';
import { useAppConfig } from '../store/configStore.js';
import { cn } from '../utils/cn.js';

const STEPS = [
  { icon: UserRound, title: 'Choose your spokesperson', text: 'Pick a stock AI avatar (Starter) or create a digital twin of yourself (Growth).' },
  { icon: PenLine, title: 'Write a short script', text: 'Say hello, explain your offer and end with one clear call to action. We estimate length and credits as you type.' },
  { icon: Code2, title: 'Paste one line of code', text: 'Copy the embed snippet into your site. The widget loads asynchronously and never slows your pages down.' },
];

const BEHAVIOUR = [
  { icon: Gauge, label: 'Page loads' },
  { icon: UserRound, label: 'Avatar bubble appears' },
  { icon: Hand, label: 'Attention-grabber' },
  { icon: Play, label: 'Card opens & video plays' },
  { icon: Captions, label: 'Captions follow the script' },
  { icon: MousePointerClick, label: 'Call to action' },
];

const FAQ = [
  {
    q: 'Is this a chatbot or a live AI agent?',
    a: 'No. Your spokesperson plays a pre-generated video of the script you wrote. Visitors cannot chat with it or ask questions — it simply delivers your message with captions and a call to action.',
  },
  {
    q: 'How is it priced?',
    a: 'You buy credit packs and spend credits when you generate a video. Each plan has a credits-per-minute rate, shown on the pricing page. Credits are held while a video renders and only charged when it succeeds — failed renders are returned automatically.',
  },
  {
    q: 'What is the difference between Starter and Growth?',
    a: 'Starter uses a stock avatar from our library. Growth creates a digital twin of your own spokesperson from a short recording. The widget on your website works the same way for both.',
  },
  {
    q: 'Why does Growth need consent?',
    a: 'Creating a digital twin of a real person requires that person’s verified consent. We guide the spokesperson through the provider’s hosted consent flow, and videos can only be generated once consent is approved.',
  },
  {
    q: 'Will it slow down my website?',
    a: 'No. The script is tiny, loads asynchronously and waits for your page to finish loading before appearing. The video only downloads when the card opens.',
  },
  {
    q: 'Does it work on mobile?',
    a: 'Yes. You choose how it behaves on phones — a compact card, just the avatar bubble, or hidden entirely.',
  },
];

function HeroVisual() {
  return (
    <div className="relative mx-auto w-full max-w-xl lg:max-w-none">
      <div className="absolute -inset-10 -z-10 rounded-full bg-gradient-to-tr from-brand-200/60 via-fuchsia-100/40 to-sky-100/50 blur-3xl" />
      <div className="overflow-hidden rounded-2xl bg-white shadow-float ring-1 ring-slate-900/10">
        <div className="flex items-center gap-1.5 border-b border-slate-100 bg-slate-50 px-4 py-2.5">
          <span className="size-2.5 rounded-full bg-rose-400" />
          <span className="size-2.5 rounded-full bg-amber-400" />
          <span className="size-2.5 rounded-full bg-emerald-400" />
          <span className="ml-3 rounded-md bg-white px-3 py-0.5 text-[11px] text-slate-400 ring-1 ring-slate-200">https://yourwebsite.com</span>
        </div>
        <div className="relative h-[360px] p-6 sm:h-[420px] sm:p-8">
          <div className="h-5 w-2/3 rounded-lg bg-slate-200" />
          <div className="mt-3 h-5 w-1/2 rounded-lg bg-slate-200" />
          <div className="mt-6 h-3 w-5/6 rounded bg-slate-100" />
          <div className="mt-2 h-3 w-4/6 rounded bg-slate-100" />
          <div className="mt-6 h-9 w-32 rounded-lg bg-slate-900" />
          <div className="mt-8 grid grid-cols-3 gap-3">
            <div className="h-20 rounded-xl bg-slate-50 ring-1 ring-slate-100" />
            <div className="h-20 rounded-xl bg-slate-50 ring-1 ring-slate-100" />
            <div className="h-20 rounded-xl bg-slate-50 ring-1 ring-slate-100" />
          </div>

          <div className="absolute right-5 bottom-5 w-48 animate-rise overflow-hidden rounded-2xl bg-white shadow-2xl ring-1 ring-slate-900/10 sm:w-56">
            <div className="relative aspect-[3/4] bg-gradient-to-br from-indigo-100 via-brand-100 to-violet-200">
              <svg viewBox="0 0 400 500" className="absolute inset-0 size-full">
                <path d="M118 215 C110 140 160 118 200 118 C245 118 292 142 284 220 L292 360 C260 380 140 380 108 360 Z" fill="#3b2416" />
                <path d="M52 520 C56 402 124 362 200 362 C276 362 344 402 348 520 Z" fill="#1f2a44" />
                <path d="M168 364 L200 410 L232 364 Z" fill="#fff" opacity="0.9" />
                <rect x="174" y="296" width="52" height="78" rx="22" fill="#f1c7a5" />
                <ellipse cx="200" cy="232" rx="78" ry="92" fill="#f1c7a5" />
                <path d="M122 225 C120 160 165 132 204 132 C248 134 282 165 278 226 C262 180 232 166 200 168 C170 168 138 186 122 225 Z" fill="#3b2416" />
                <ellipse cx="172" cy="240" rx="7" ry="8" fill="#1f2937" />
                <ellipse cx="228" cy="240" rx="7" ry="8" fill="#1f2937" />
                <path d="M176 284 Q200 304 224 284" stroke="#7f1d1d" strokeWidth="5" fill="none" strokeLinecap="round" opacity="0.75" />
              </svg>
              <div className="absolute inset-x-0 top-0 h-16 bg-gradient-to-b from-slate-950/50 to-transparent" />
              <span className="absolute top-2.5 left-2.5 flex items-center gap-1 rounded-full bg-rose-500 px-2 py-0.5 text-[9.5px] font-extrabold tracking-wider text-white uppercase shadow">
                <span className="size-1.5 animate-pulse rounded-full bg-white" /> Live
              </span>
              <span className="absolute top-2.5 right-2.5 text-[11px] font-semibold text-white drop-shadow">Amelia</span>
              <div className="absolute inset-x-3 bottom-3 text-center">
                <span className="rounded-md bg-slate-950/75 px-2 py-1 text-[11px] leading-relaxed font-medium text-white [box-decoration-break:clone]">
                  Hi! Let me show you around in 30 seconds.
                </span>
              </div>
            </div>
            <div className="p-2.5">
              <div className="flex items-center justify-center gap-1 rounded-xl bg-brand-600 py-2 text-xs font-bold text-white">
                Start free trial <ArrowRight className="size-3.5" />
              </div>
            </div>
          </div>
          <span className="absolute right-[13.5rem] bottom-10 hidden animate-bounce text-2xl sm:right-[15.5rem] sm:block">👋</span>
        </div>
      </div>
    </div>
  );
}

function FaqItem({ q, a }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="border-b border-slate-200 py-1">
      <button type="button" onClick={() => setOpen((o) => !o)} className="flex w-full items-center justify-between gap-4 py-4 text-left" aria-expanded={open}>
        <span className="text-[15px] font-semibold text-slate-900">{q}</span>
        <ChevronDown className={cn('size-5 shrink-0 text-slate-400 transition', open && 'rotate-180')} />
      </button>
      {open && <p className="animate-fade-in pb-5 text-[15px] leading-relaxed text-slate-600">{a}</p>}
    </div>
  );
}

export default function LandingPage() {
  useDocumentTitle(null);
  const config = useAppConfig();
  const { data: products } = useApi(() => billingService.packages(), []);
  const plans = products?.plans ?? config.plans;
  const starterRate = plans.find((p) => p.id === 'STARTER')?.creditsPerMinute;

  const demoConfig = useMemo(
    () =>
      config.mockProviders?.heygen
        ? buildPreviewConfig({
            widget: { primaryCtaText: 'Start free trial', primaryCtaUrl: 'https://example.com/trial', delay: 0, attentionAnimation: 'wave' },
            video: {
              videoUrl: `${config.widget.apiUrl}/mock-assets/sample-avatar.mp4`,
              thumbnailUrl: `${config.widget.apiUrl}/mock-assets/sample-avatar.jpg`,
              duration: 16,
              captions: [
                { start: 0.2, end: 2.4, text: 'Hi there, welcome!' },
                { start: 2.4, end: 6.5, text: 'I’m a pre-recorded AI spokesperson.' },
                { start: 6.5, end: 11, text: 'I greet your visitors and explain your offer.' },
                { start: 11, end: 15.8, text: 'Then point them to your call to action.' },
              ],
            },
            avatar: { name: 'Amelia', thumbnailUrl: `${config.widget.apiUrl}/mock-assets/avatars/amelia.svg` },
          })
        : null,
    [config],
  );

  return (
    <>
      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="bg-grid absolute inset-0 [mask-image:radial-gradient(ellipse_at_top,black,transparent_70%)]" />
        <div className="relative mx-auto grid max-w-6xl items-center gap-14 px-4 pt-12 pb-20 sm:px-6 lg:grid-cols-[1.05fr_1fr] lg:pt-20 lg:pb-28">
          <div className="animate-rise">
            <span className="inline-flex items-center gap-2 rounded-full bg-white px-3 py-1 text-xs font-semibold text-slate-700 shadow-sm ring-1 ring-slate-200">
              <span className="flex size-4 items-center justify-center rounded-full bg-brand-100 text-brand-600">
                <Sparkles className="size-2.5" />
              </span>
              Pre-recorded AI avatar video · no chatbot
            </span>
            <h1 className="mt-6 text-4xl font-bold tracking-tight text-balance text-slate-950 sm:text-5xl lg:text-[3.5rem] lg:leading-[1.05]">
              Put an AI spokesperson on your website.
            </h1>
            <p className="mt-6 max-w-xl text-lg leading-relaxed text-slate-600">
              Turn a short script into a lifelike avatar video that greets visitors from a floating widget. They watch a pre-recorded message with captions
              and one clear call to action — no chat, no live calls, no setup headaches.
            </p>
            <div className="mt-9 flex flex-col gap-3 sm:flex-row">
              <Button to="/register" size="lg" iconRight={ArrowRight}>
                Create your spokesperson
              </Button>
              <Button href="#how-it-works" size="lg" variant="secondary">
                See how it works
              </Button>
            </div>
            <div className="mt-8 flex flex-wrap gap-x-6 gap-y-2 text-sm text-slate-500">
              <span className="flex items-center gap-1.5"><Code2 className="size-4 text-brand-500" /> One line of code</span>
              <span className="flex items-center gap-1.5"><Smartphone className="size-4 text-brand-500" /> Mobile-ready</span>
              <span className="flex items-center gap-1.5"><Captions className="size-4 text-brand-500" /> Auto captions</span>
            </div>
          </div>
          <HeroVisual />
        </div>
      </section>

      {/* How it works */}
      <section id="how-it-works" className="scroll-mt-20 border-y border-slate-100 bg-slate-50/70 py-20 sm:py-24">
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          <div className="max-w-2xl">
            <p className="text-sm font-semibold text-brand-600">How it works</p>
            <h2 className="mt-2 text-3xl font-bold tracking-tight text-slate-950 sm:text-4xl">Live on your site in three steps</h2>
          </div>
          <div className="mt-12 grid gap-5 md:grid-cols-3">
            {STEPS.map((step, i) => (
              <div key={step.title} className="relative rounded-2xl bg-white p-6 shadow-card ring-1 ring-slate-200/80">
                <span className="absolute top-6 right-6 text-5xl font-bold text-slate-100">{i + 1}</span>
                <span className="grid size-11 place-items-center rounded-xl bg-brand-600 text-white shadow-lg shadow-brand-600/25">
                  <step.icon className="size-5" />
                </span>
                <h3 className="mt-5 text-lg font-semibold text-slate-900">{step.title}</h3>
                <p className="mt-2 text-[15px] leading-relaxed text-slate-600">{step.text}</p>
              </div>
            ))}
          </div>

          <div className="mt-14 rounded-2xl bg-white p-6 ring-1 ring-slate-200/80 sm:p-8">
            <p className="text-sm font-semibold text-slate-900">What your visitors experience</p>
            <ol className="mt-5 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
              {BEHAVIOUR.map((b, i) => (
                <li key={b.label} className="relative flex flex-col items-start gap-2">
                  <span className="grid size-9 place-items-center rounded-full bg-brand-50 text-brand-600 ring-4 ring-white">
                    <b.icon className="size-4" />
                  </span>
                  <span className="text-[13px] font-medium text-slate-700">{b.label}</span>
                  {i < BEHAVIOUR.length - 1 && <span className="absolute top-4 left-11 hidden h-px w-[calc(100%-2.5rem)] bg-brand-100 lg:block" />}
                </li>
              ))}
            </ol>
            <p className="mt-6 flex items-center gap-2 text-[13px] text-slate-500">
              <MessageSquareOff className="size-4" /> Visitors can collapse and reopen the widget at any time. There is no chat input and no live Q&amp;A.
            </p>
          </div>
        </div>
      </section>

      {/* Example widget */}
      <section id="example" className="scroll-mt-20 py-20 sm:py-24">
        <div className="mx-auto grid max-w-6xl items-center gap-12 px-4 sm:px-6 lg:grid-cols-[1fr_1.3fr]">
          <div>
            <p className="text-sm font-semibold text-brand-600">Example widget</p>
            <h2 className="mt-2 text-3xl font-bold tracking-tight text-slate-950 sm:text-4xl">A premium, on-brand greeting</h2>
            <p className="mt-4 text-[15px] leading-relaxed text-slate-600">
              A small avatar bubble pops in, waves for attention, then opens into a card that plays your video with synced captions and a live indicator.
              Match your brand colour, choose light or dark, and decide where it sits.
            </p>
            <ul className="mt-6 space-y-3 text-[15px] text-slate-700">
              {['Isolated with Shadow DOM — never clashes with your CSS', 'Autoplays muted with a “tap for sound” prompt', 'Remembers when a visitor collapses it'].map((t) => (
                <li key={t} className="flex items-start gap-2.5">
                  <ShieldCheck className="mt-0.5 size-5 shrink-0 text-brand-600" />
                  {t}
                </li>
              ))}
            </ul>
          </div>
          {demoConfig ? (
            <WidgetPreview config={demoConfig} height={480} />
          ) : (
            <HeroVisual />
          )}
        </div>
      </section>

      {/* Plans */}
      <section className="border-y border-slate-100 bg-slate-50/70 py-20 sm:py-24">
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          <div className="mx-auto max-w-2xl text-center">
            <p className="text-sm font-semibold text-brand-600">Starter vs Growth</p>
            <h2 className="mt-2 text-3xl font-bold tracking-tight text-slate-950 sm:text-4xl">Stock avatar or your own digital twin</h2>
          </div>
          <div className="mx-auto mt-12 grid max-w-4xl gap-6 md:grid-cols-2">
            {plans.map((plan) => (
              <PlanCard
                key={plan.id}
                plan={plan}
                highlighted={plan.id === 'GROWTH'}
                action={
                  <Button to={`/register?plan=${plan.id}`} variant={plan.id === 'GROWTH' ? 'white' : 'primary'} className="w-full" iconRight={ArrowRight}>
                    Start with {plan.name}
                  </Button>
                }
              />
            ))}
          </div>
        </div>
      </section>

      {/* Credits */}
      {products?.creditPackages?.length > 0 && (
        <section className="py-20 sm:py-24">
          <div className="mx-auto max-w-6xl px-4 sm:px-6">
            <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
              <div>
                <p className="text-sm font-semibold text-brand-600">Pricing</p>
                <h2 className="mt-2 text-3xl font-bold tracking-tight text-slate-950 sm:text-4xl">Pay per video with credits</h2>
                <p className="mt-3 max-w-xl text-[15px] text-slate-600">No subscription required. Credits are reserved while a video renders and only charged when it succeeds.</p>
              </div>
              <Button to="/pricing" variant="secondary" iconRight={ArrowRight}>
                Full pricing
              </Button>
            </div>
            <div className="mt-10 grid gap-5 sm:grid-cols-3">
              {products.creditPackages.map((pkg) => (
                <PackageCard key={pkg.id} pkg={pkg} perMinute={starterRate} />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* FAQ */}
      <section id="faq" className="scroll-mt-20 border-t border-slate-100 bg-slate-50/70 py-20 sm:py-24">
        <div className="mx-auto grid max-w-6xl gap-10 px-4 sm:px-6 lg:grid-cols-[1fr_1.6fr]">
          <div>
            <p className="text-sm font-semibold text-brand-600">FAQ</p>
            <h2 className="mt-2 text-3xl font-bold tracking-tight text-slate-950">Questions, answered</h2>
          </div>
          <div>
            {FAQ.map((item) => (
              <FaqItem key={item.q} {...item} />
            ))}
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="px-4 py-20 sm:px-6">
        <div className="relative mx-auto max-w-5xl overflow-hidden rounded-3xl bg-slate-950 px-6 py-14 text-center sm:px-12">
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(109,93,252,0.5),transparent_65%)]" />
          <div className="relative">
            <h2 className="text-3xl font-bold tracking-tight text-balance text-white sm:text-4xl">Give every visitor a warm welcome.</h2>
            <p className="mx-auto mt-4 max-w-xl text-slate-300">Create your first spokesperson video in minutes and paste it onto your site.</p>
            <Button to="/register" size="lg" variant="white" className="mt-8" iconRight={ArrowRight}>
              Create your spokesperson
            </Button>
          </div>
        </div>
      </section>
    </>
  );
}
