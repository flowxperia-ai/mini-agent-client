import { Captions, MousePointerClick, Play } from 'lucide-react';
import { Outlet } from 'react-router';
import { Logo } from '../components/Logo.jsx';

function MiniWidgetIllustration() {
  return (
    <div className="relative mx-auto w-full max-w-sm">
      <div className="rounded-3xl bg-white/5 p-5 ring-1 ring-white/10 backdrop-blur">
        <div className="space-y-2.5">
          <div className="h-3 w-2/3 rounded-full bg-white/15" />
          <div className="h-3 w-1/2 rounded-full bg-white/10" />
          <div className="h-24 rounded-2xl bg-white/5" />
          <div className="grid grid-cols-3 gap-2">
            <div className="h-14 rounded-xl bg-white/5" />
            <div className="h-14 rounded-xl bg-white/5" />
            <div className="h-14 rounded-xl bg-white/5" />
          </div>
        </div>
      </div>
      <div className="absolute -right-6 -bottom-10 w-44 overflow-hidden rounded-2xl bg-surface shadow-2xl ring-1 ring-black/5">
        <div className="relative aspect-[3/4] bg-gradient-to-br from-brand-200 to-brand-400">
          <span className="absolute top-2 left-2 flex items-center gap-1 rounded-full bg-rose-500 px-1.5 py-0.5 text-[9px] font-bold tracking-wider text-white uppercase">
            <span className="size-1 animate-pulse rounded-full bg-surface" /> Live
          </span>
          <div className="absolute inset-x-0 bottom-9 mx-auto size-20 rounded-full bg-white/70" />
          <div className="absolute inset-x-3 bottom-2 rounded-md bg-slate-900/70 px-2 py-1 text-center text-[9px] leading-snug text-white">Hi! Let me show you around…</div>
        </div>
        <div className="p-2">
          <div className="rounded-lg bg-brand-600 py-1.5 text-center text-[10px] font-bold text-white">Book a demo →</div>
        </div>
      </div>
    </div>
  );
}

export function AuthLayout() {
  return (
    <div className="grid min-h-screen bg-surface lg:grid-cols-[1fr_minmax(0,560px)]">
      <div className="flex flex-col px-5 py-8 sm:px-10">
        <Logo />
        <div className="flex flex-1 items-center justify-center py-10">
          <div className="w-full max-w-sm">
            <Outlet />
          </div>
        </div>
      </div>
      <aside className="relative hidden overflow-hidden bg-slate-950 lg:flex lg:flex-col lg:justify-between lg:p-12">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,rgba(109,93,252,0.45),transparent_60%)]" />
        <div className="bg-grid absolute inset-0 opacity-[0.07] invert" />
        <div className="relative">
          <p className="text-sm font-semibold text-brand-300">Website Mini Agent</p>
          <h2 className="mt-3 max-w-md text-3xl font-bold tracking-tight text-balance text-white">A friendly face that greets every visitor.</h2>
          <ul className="mt-6 space-y-3 text-sm text-slate-300">
            <li className="flex items-center gap-2.5"><Play className="size-4 text-brand-300" /> Pre-recorded AI avatar video</li>
            <li className="flex items-center gap-2.5"><Captions className="size-4 text-brand-300" /> Captions synced to your script</li>
            <li className="flex items-center gap-2.5"><MousePointerClick className="size-4 text-brand-300" /> One clear call to action</li>
          </ul>
        </div>
        <div className="relative pb-12">
          <MiniWidgetIllustration />
        </div>
      </aside>
    </div>
  );
}
