import { useEffect, useMemo, useState } from 'react';
import { Monitor, RotateCcw, Smartphone } from 'lucide-react';
import { useAppConfig } from '../store/configStore.js';
import { cn } from '../utils/cn.js';
import { Button } from './ui/Button.jsx';
import { Segmented } from './ui/Field.jsx';

const escapeAttr = (s) => s.replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

/** Build the public-widget config shape (what /api/public/widgets returns) from dashboard data. */
export function buildPreviewConfig({ widget = {}, video, avatar }) {
  return {
    id: 'preview',
    position: widget.position ?? 'bottom-right',
    delay: Number(widget.delay ?? 0),
    autoplay: widget.autoplay ?? true,
    muted: widget.muted ?? true,
    showCaptions: widget.showCaptions ?? true,
    showLiveIndicator: widget.showLiveIndicator ?? true,
    theme: widget.theme ?? 'light',
    accentColor: /^#[0-9a-f]{6}$/i.test(widget.accentColor ?? '') ? widget.accentColor : '#6d5dfc',
    width: Number(widget.width ?? 300),
    mobileBehavior: widget.mobileBehavior ?? 'compact',
    attentionAnimation: widget.attentionAnimation ?? 'wave',
    offsetX: Number(widget.offsetX ?? 0),
    offsetY: Number(widget.offsetY ?? 0),
    cta: widget.primaryCtaText && widget.primaryCtaUrl ? { text: widget.primaryCtaText, url: widget.primaryCtaUrl } : null,
    spokesperson: { name: avatar?.name ?? video?.avatar?.name ?? 'Spokesperson', imageUrl: avatar?.thumbnailUrl ?? video?.avatar?.thumbnailUrl ?? video?.thumbnailUrl ?? null },
    video: {
      url: video?.videoUrl,
      posterUrl: video?.thumbnailUrl ?? null,
      duration: video?.duration ?? video?.estimatedDuration ?? null,
      captions: video?.captions ?? [],
      transparent: Boolean(video?.transparentBackground),
    },
  };
}

function srcDoc(scriptUrl, config, dark) {
  return `<!doctype html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<style>
*{box-sizing:border-box}body{margin:0;font-family:ui-sans-serif,system-ui,sans-serif;background:${dark ? '#0b1020' : '#f8fafc'};color:${dark ? '#e2e8f0' : '#0f172a'};min-height:100vh}
.nav{display:flex;align-items:center;justify-content:space-between;padding:18px 28px;border-bottom:1px solid ${dark ? '#1e293b' : '#e2e8f0'};background:${dark ? '#0f172a' : '#fff'}}
.logo{display:flex;gap:8px;align-items:center;font-weight:700}.logo i{width:22px;height:22px;border-radius:6px;background:#0f172a;display:block}
.links{display:flex;gap:18px}.links span{width:54px;height:8px;border-radius:9px;background:${dark ? '#334155' : '#e2e8f0'}}
.hero{padding:56px 28px;max-width:720px}.h{height:22px;border-radius:8px;background:${dark ? '#334155' : '#cbd5e1'};margin-bottom:12px}
.p{height:10px;border-radius:8px;background:${dark ? '#1e293b' : '#e2e8f0'};margin-bottom:10px}
.btn{margin-top:22px;width:130px;height:38px;border-radius:10px;background:${dark ? '#334155' : '#0f172a'}}
.grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(160px,1fr));gap:16px;padding:0 28px 40px}
.card{height:120px;border-radius:14px;background:${dark ? '#111827' : '#fff'};border:1px solid ${dark ? '#1e293b' : '#e2e8f0'}}
@media(max-width:640px){.links{display:none}.hero{padding:36px 20px}.grid{padding:0 20px 40px}}
</style></head><body>
<div class="nav"><div class="logo"><i></i>yourwebsite.com</div><div class="links"><span></span><span></span><span></span></div></div>
<div class="hero"><div class="h" style="width:80%"></div><div class="h" style="width:55%"></div><div class="p" style="width:90%;margin-top:22px"></div><div class="p" style="width:75%"></div><div class="btn"></div></div>
<div class="grid"><div class="card"></div><div class="card"></div><div class="card"></div><div class="card"></div></div>
<script src="${escapeAttr(scriptUrl)}" data-widget-id="preview" data-preview="true" data-config="${escapeAttr(JSON.stringify(config))}" async></script>
</body></html>`;
}

/**
 * Live preview of the real widget.js inside a sandboxed iframe (no access to the dashboard).
 * Re-mounts (debounced) when the configuration changes so the entrance animation replays.
 */
export function WidgetPreview({ config, className, height = 560, showControls = true, darkSite = false, initialDevice = 'desktop' }) {
  const appConfig = useAppConfig();
  const [device, setDevice] = useState(initialDevice);
  const [nonce, setNonce] = useState(0);
  const serialized = JSON.stringify(config);
  const [debounced, setDebounced] = useState(serialized);

  useEffect(() => {
    const t = setTimeout(() => setDebounced(serialized), 450);
    return () => clearTimeout(t);
  }, [serialized]);

  const html = useMemo(() => srcDoc(appConfig.widget.scriptUrl, JSON.parse(debounced), darkSite), [appConfig.widget.scriptUrl, debounced, darkSite]);
  const ready = Boolean(config?.video?.url);

  return (
    <div className={cn('flex flex-col gap-3', className)}>
      {showControls && (
        <div className="flex items-center justify-between gap-2">
          <Segmented
            size="sm"
            value={device}
            onChange={setDevice}
            options={[
              { value: 'desktop', label: 'Desktop', icon: Monitor },
              { value: 'mobile', label: 'Mobile', icon: Smartphone },
            ]}
          />
          <Button variant="ghost" size="sm" icon={RotateCcw} onClick={() => setNonce((n) => n + 1)}>
            Replay
          </Button>
        </div>
      )}
      <div className="grid place-items-center rounded-2xl bg-gradient-to-b from-slate-100 to-slate-200/70 p-3 ring-1 ring-slate-200 sm:p-4">
        <div
          className={cn(
            'overflow-hidden bg-white shadow-float ring-1 ring-slate-900/10 transition-all duration-300',
            device === 'mobile' ? 'w-[375px] max-w-full rounded-[28px]' : 'w-full rounded-xl',
          )}
        >
          {device === 'desktop' && (
            <div className="flex items-center gap-1.5 border-b border-slate-200 bg-slate-50 px-3 py-2">
              <span className="size-2.5 rounded-full bg-rose-400" />
              <span className="size-2.5 rounded-full bg-amber-400" />
              <span className="size-2.5 rounded-full bg-emerald-400" />
              <span className="ml-3 truncate rounded-md bg-white px-3 py-0.5 text-[11px] text-slate-400 ring-1 ring-slate-200">https://yourwebsite.com</span>
            </div>
          )}
          {ready ? (
            <iframe
              key={`${debounced}-${nonce}-${device}`}
              title="Widget preview"
              sandbox="allow-scripts"
              srcDoc={html}
              className="block w-full border-0"
              style={{ height: device === 'mobile' ? Math.min(height + 120, 720) : height }}
            />
          ) : (
            <div className="grid place-items-center text-sm text-slate-500" style={{ height }}>
              The preview appears once the video is ready.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
