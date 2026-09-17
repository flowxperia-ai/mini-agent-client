// ===========================================================================
// AVATARAI Landing Page — single-file, copy-paste-ready embed.
//
// Usage in the host app:
//   1. npm install framer-motion   (React itself is assumed already present)
//   2. Copy this file AND the sibling `assets/` folder into your app,
//      keeping them in the same folder together (or update the three
//      `import ... from './assets/...'` lines below to point at wherever
//      you put the assets).
//   3. import Landing from './Landing'
//      ... render <Landing />
//
// This file injects its own Google Fonts <link> tags and a full <style>
// block into document.head on mount (see LandingStyles below), so it needs
// no separate CSS import. Because the styles include global resets (*, body,
// html, h1-h4, p, a, button, etc.), dropping this into a page that already
// has its own global styles can visually clash — this component is meant to
// own the full page it's rendered on.
//
// All copy, testimonials, pricing figures and analytics numbers below are
// placeholder / dummy data.
// ===========================================================================

import { useEffect, useRef, useState } from 'react'
import { AnimatePresence, animate, motion, useInView, useMotionValue, useScroll, useSpring, useTransform } from 'framer-motion'

import avatar1 from './assets/avatar1.png'
import avatar2 from './assets/avatar2.png'
import avatarVideo from './assets/avatar_video.webm'

/* ===========================================================================
   DATA — placeholder/dummy content
   =========================================================================== */

const nav = {
  links: ['Product', 'Solutions', 'Use Cases', 'Pricing', 'Resources'],
}

const heroFloatCards = [
  { icon: '🟢', label: 'AI Agent Online' },
  { icon: '💬', label: '247 conversations today' },
  { icon: '📈', label: '+38% engagement' },
  { icon: '🎯', label: '12 new leads' },
  { icon: '⚡', label: 'Response time: 0.8s' },
]

const trustLogos = ['NORTHPEAK', 'VELORA', 'STRATUM', 'ORBITAL', 'CLEARWAVE', 'ARKON']

const demoMessages = [
  { from: 'user', text: 'What can you help me with?' },
  { from: 'ai', text: 'I can answer questions, explain your products, recommend solutions, and help your customers take the next step.' },
]

const demoQuestions = [
  'What can you do?',
  'How does pricing work?',
  'Can you work on my website?',
  'Can you capture leads?',
]

const problems = [
  { icon: '📄', title: 'Static Websites', desc: 'Visitors browse your pages, search for answers and leave without ever speaking to anyone.' },
  { icon: '🤖', title: 'Traditional Chatbots', desc: 'Menus, predefined answers and robotic conversations create friction instead of connection.' },
  { icon: '🕐', title: 'Limited Human Availability', desc: 'Your sales and support teams cannot be available for every visitor, every hour of every day.' },
]

const productNodes = [
  { icon: '🧑‍💼', label: 'AI Avatar' },
  { icon: '🎙️', label: 'AI Voice' },
  { icon: '🧠', label: 'AI Brain' },
  { icon: '📚', label: 'Knowledge Base' },
  { icon: '💬', label: 'Real-Time Conversation' },
  { icon: '🎯', label: 'Lead Generation' },
  { icon: '📊', label: 'Analytics' },
]

const features = [
  { icon: '🧑‍💼', title: 'AI Digital Humans', desc: 'Create realistic digital humans with customizable appearance, voice, personality and behavior.' },
  { icon: '🧠', title: 'AI Knowledge Brain', desc: 'Train your AI using websites, PDFs, documents, FAQs, product catalogs and business information.' },
  { icon: '🎙️', title: 'Natural Voice', desc: 'Give your avatar a natural conversational voice with multilingual support and real-time responses.' },
  { icon: '💬', title: 'Real-Time Conversations', desc: 'Let visitors speak naturally, ask follow-up questions and receive contextual answers.' },
  { icon: '🎯', title: 'Lead Generation', desc: 'Automatically collect names, emails, phone numbers, requirements and appointment requests.' },
  { icon: '📊', title: 'Analytics', desc: 'Understand conversations, visitor engagement, leads, questions and conversion performance.' },
]

const howItWorks = [
  { num: '01', title: 'Create', desc: 'Choose your avatar, voice and personality.' },
  { num: '02', title: 'Train', desc: 'Connect your website, documents and business knowledge.' },
  { num: '03', title: 'Customize', desc: 'Define how your AI should speak, behave and help customers.' },
  { num: '04', title: 'Deploy', desc: 'Add one lightweight embed code to your website and go live.' },
]

const avatarStyles = ['Professional', 'Friendly', 'Luxury', 'Sales Expert', 'Support Agent']
const avatarControls = ['Avatar', 'Voice', 'Language', 'Personality', 'Clothing', 'Background', 'Speaking style']
const controlValues = {
  Avatar: 'Priya — Professional',
  Voice: 'Warm, Female (EN-IN)',
  Language: 'English + Hindi',
  Personality: 'Confident & Helpful',
  Clothing: 'Business Formal',
  Background: 'Studio Gradient',
  'Speaking style': 'Concise',
}

const knowledgeSources = ['Website URL', 'Product Catalog', 'FAQs', 'PDF Documents', 'Company Information', 'Pricing', 'Policies']

const useCases = [
  { icon: '🏠', title: 'Real Estate', desc: 'Answer property questions, recommend listings and capture buyer leads.', slug: 'real-estate' },
  { icon: '🏥', title: 'Healthcare', desc: 'Explain services, departments and appointment information.', slug: 'healthcare' },
  { icon: '🎓', title: 'Education', desc: 'Help students discover courses, programs and admission information.', slug: 'education' },
  { icon: '🛒', title: 'E-Commerce', desc: 'Recommend products, answer shopping questions and help customers decide.', slug: 'ecommerce' },
  { icon: '💻', title: 'SaaS', desc: 'Explain your product, answer questions and convert visitors into demos.', slug: 'saas' },
  { icon: '💰', title: 'Finance', desc: 'Explain financial products and guide visitors through your services.', slug: 'finance' },
  { icon: '✈️', title: 'Travel', desc: 'Help customers discover destinations, packages and travel options.', slug: 'travel' },
  { icon: '🏢', title: 'Agencies', desc: 'Create AI digital employees for your clients and manage them from one platform.', slug: 'agencies' },
]

const beforeItems = ['Static pages', 'Generic forms', 'No real conversation', 'Visitors leave with unanswered questions', 'Manual lead qualification', 'Limited availability']
const afterItems = ['Interactive AI human', 'Real-time conversation', 'Personalized answers', 'Automated lead capture', '24/7 availability', 'Intelligent customer experience']

const integrations = ['WordPress', 'Shopify', 'Webflow', 'Wix', 'React', 'Next.js', 'HTML', 'Custom Websites']
const embedSnippet = `<script src="https://cdn.avatarai.io/embed.js" data-id="9af31c" async></script>`

const funnelSteps = ['Visitor', 'Conversation', 'Qualification', 'Lead', 'Appointment', 'Customer']
const sampleLead = { name: 'Sarah Johnson', email: 'sarah@example.com', interest: 'Premium Package', intent: 'High', status: 'Qualified' }

const analyticsMetrics = [
  { label: 'Visitors Engaged', value: '24,892' },
  { label: 'Conversations', value: '8,421' },
  { label: 'Leads Generated', value: '1,248' },
  { label: 'Conversion Rate', value: '18.6%' },
  { label: 'Avg. Conversation', value: '2m 42s' },
]

const conversationVolume = [40, 55, 48, 62, 70, 65, 80, 74, 88, 92, 85, 96]

const topQuestions = [
  { q: 'How does pricing work?', pct: 82 },
  { q: 'Can I customize the avatar?', pct: 68 },
  { q: 'Do you support multiple languages?', pct: 54 },
  { q: 'Can it capture leads?', pct: 47 },
]

const businessBenefits = [
  { icon: '📈', title: 'Increase Conversions', desc: 'Turn passive browsing into active conversations that move visitors toward a decision.' },
  { icon: '🎧', title: 'Reduce Support Workload', desc: 'Let your AI handle repetitive questions so your team can focus on complex cases.' },
  { icon: '🎯', title: 'Capture More Leads', desc: 'Every conversation is a chance to qualify and collect visitor information automatically.' },
  { icon: '⚡', title: 'Answer Customers Instantly', desc: 'No waiting on hold or unanswered emails — responses happen in real time.' },
  { icon: '🧩', title: 'Personalize Every Conversation', desc: 'Your AI adapts its answers based on what each visitor actually asks.' },
  { icon: '🚀', title: 'Scale Without Hiring', desc: 'Handle unlimited simultaneous conversations without growing headcount.' },
]

const testimonials = [
  { quote: 'AVATARAI completely changed how visitors interact with our website. Instead of reading through pages, customers can simply ask questions and get answers instantly.', name: 'Maya Thomas', role: 'Marketing Director, Northpeak Interiors', initials: 'MT' },
  { quote: 'We used to lose visitors who couldn\'t find what they needed. Now our AI avatar greets them, answers questions, and hands us a qualified lead before they even leave.', name: 'Daniel Cho', role: 'Head of Growth, Velora Labs', initials: 'DC' },
  { quote: 'Setting it up took an afternoon. Within a week it was handling more first-contact conversations than our support inbox.', name: 'Priya Nair', role: 'Founder, Stratum Consulting', initials: 'PN' },
  { quote: 'It genuinely feels like talking to someone on our team — not a scripted bot. Our conversion rate on the pricing page nearly doubled.', name: 'Owen Bright', role: 'CEO, Arkon Digital', initials: 'OB' },
]

const pricingTiers = [
  {
    tier: 'Starter', priceMonthly: 999, priceYearly: 799, desc: 'For individuals and small businesses.',
    features: ['1 AI Avatar', 'Website deployment', 'Basic knowledge base', '1,000 conversations/month', 'Basic analytics', 'Standard support'],
    cta: 'Start Free', popular: false,
  },
  {
    tier: 'Professional', priceMonthly: 2999, priceYearly: 2399, desc: 'For growing teams ready to scale conversations.', badge: 'Most Popular',
    features: ['5 AI Avatars', '5,000 conversations/month', 'Advanced knowledge base', 'Lead capture', 'Advanced analytics', 'Multiple languages', 'Custom branding', 'Priority support'],
    cta: 'Start Building', popular: true,
  },
  {
    tier: 'Enterprise', priceMonthly: null, priceYearly: null, desc: 'For large organizations with custom requirements.',
    features: ['Custom AI Avatars', 'High conversation limits', 'Multiple websites', 'API access', 'Advanced integrations', 'Enterprise security', 'Dedicated support', 'Custom deployment'],
    cta: 'Talk to Sales', popular: false,
  },
]

const faqs = [
  { q: 'What is an AI Avatar?', a: 'An AI Avatar is a realistic digital human that lives on your website and has natural conversations with your visitors — answering questions, explaining products, and capturing leads.' },
  { q: 'How is an AI Avatar different from a chatbot?', a: 'Traditional chatbots rely on menus and scripted answers. An AVATARAI avatar understands natural language, holds real conversations, and responds with a face and voice, not just text.' },
  { q: 'Can I train the AI using my website?', a: 'Yes. Point AVATARAI at your website URL and it will automatically learn your pages, products, and FAQs.' },
  { q: 'Can I customize the avatar?', a: 'You can fully customize your avatar\'s appearance, voice, language, personality, clothing, and background to match your brand.' },
  { q: 'Can visitors talk to the avatar using their microphone?', a: 'Yes, visitors can type or speak to your avatar, and it responds with natural voice in real time.' },
  { q: 'Can the AI capture leads?', a: 'Yes. Your avatar can automatically collect names, emails, phone numbers, requirements, and appointment requests during natural conversation.' },
  { q: 'Can I deploy the avatar on multiple websites?', a: 'Yes, depending on your plan you can deploy the same or different avatars across multiple websites from one dashboard.' },
  { q: 'Does AVATARAI support multiple languages?', a: 'Yes, your avatar can converse in multiple languages and switch naturally based on how a visitor writes or speaks.' },
  { q: 'Can I connect my CRM?', a: 'Yes, AVATARAI integrates with popular CRMs so qualified leads flow directly into your existing sales pipeline.' },
  { q: 'Can I use my own avatar?', a: 'Enterprise plans support custom avatar creation, including likenesses designed specifically for your brand.' },
  { q: 'How does pricing work?', a: 'Plans are billed monthly or yearly based on the number of avatars and conversations you need. See the Pricing section for details.' },
  { q: 'Is there a free trial?', a: 'Yes, the Starter plan includes a free trial period so you can launch your first AI avatar before committing.' },
]

const footerColumns = [
  { title: 'Product', links: ['AI Avatars', 'AI Voice', 'Knowledge Base', 'Conversations', 'Analytics', 'Integrations'] },
  { title: 'Solutions', links: ['Real Estate', 'Healthcare', 'Education', 'E-commerce', 'SaaS', 'Agencies'] },
  { title: 'Resources', links: ['Blog', 'Documentation', 'Case Studies', 'Help Center', 'API Docs'] },
  { title: 'Company', links: ['About', 'Contact', 'Careers', 'Privacy', 'Terms'] },
]

const socialLinks = ['LinkedIn', 'X', 'Instagram', 'YouTube']
const socialIcon = { LinkedIn: 'in', X: '𝕏', Instagram: 'ig', YouTube: '▶' }

/* ===========================================================================
   STYLES — injected into <head> on mount (see LandingStyles at the bottom)
   =========================================================================== */

const LANDING_CSS = `
/* AVATARAI — premium AI digital human SaaS. Dark charcoal base, purple/blue ambient light, glass cards */
:root{
  --bg: #070719; --bg-1: #0D0B2A; --bg-2: #171044; --shell-bg: rgba(13,11,42,.55);
  --ink: #FFFFFF; --muted: #A7A7C2; --muted-2: #75769A;
  --border: rgba(255,255,255,.10); --border-strong: rgba(255,255,255,.20);
  --glass: rgba(255,255,255,.04); --glass-hover: rgba(255,255,255,.07);
  --purple: #8B5CF6; --purple-soft: #A78BFA; --blue: #3B82F6; --blue-soft: #6E9BFF;
  --magenta: #D946EF; --pink: #D946EF; --cyan: #22D3EE; --success: #34D399;
  --grad-brand: linear-gradient(135deg, var(--purple), var(--magenta));
  --grad-text: linear-gradient(135deg, #C4B5FD, #93C5FD);
  --radius: 20px; --radius-sm: 14px; --radius-lg: 28px;
  --shadow-soft: 0 20px 60px rgba(0,0,0,.5); --shadow-glow: 0 0 120px rgba(139,92,246,.2);
  --font-head: 'Manrope', sans-serif; --font-body: 'Inter', sans-serif; --font-serif: 'Instrument Serif', serif;
  --container: 1240px; --shell-max: 1320px;
}
.landing-root *{box-sizing:border-box; margin:0; padding:0;}
.landing-root{ font-family: var(--font-body); background: var(--bg); color: var(--ink); line-height:1.55; -webkit-font-smoothing: antialiased; overflow-x:hidden; position:relative; scroll-behavior:smooth; }
.landing-root img{max-width:100%; display:block;}
.landing-root a{color:inherit; text-decoration:none;}
.landing-root ul{list-style:none;}
.landing-root button{font-family:inherit; cursor:pointer; background:none; border:none; color:inherit;}
.landing-root input{font-family:inherit;}

.ambient{ position:fixed; inset:0; z-index:0; pointer-events:none; overflow:hidden; background:var(--bg); }
.ambient::before{ content:''; position:absolute; top:-12%; left:-8%; width:55vw; height:55vw; max-width:820px; max-height:820px; background: radial-gradient(circle, rgba(139,92,246,.20), transparent 65%); filter: blur(50px); }
.ambient::after{ content:''; position:absolute; bottom:-18%; right:-10%; width:50vw; height:50vw; max-width:760px; max-height:760px; background: radial-gradient(circle, rgba(59,130,246,.16), transparent 65%); filter: blur(50px); }
.ambient .glow-magenta{ position:absolute; top:20%; right:-6%; width:40vw; height:40vw; max-width:560px; max-height:560px; background: radial-gradient(circle, rgba(217,70,239,.14), transparent 65%); filter: blur(50px); }
.ambient .glow-cyan{ position:absolute; bottom:5%; left:-4%; width:34vw; height:34vw; max-width:480px; max-height:480px; background: radial-gradient(circle, rgba(34,211,238,.12), transparent 65%); filter: blur(50px); }
.ambient .stars{ position:absolute; inset:0; opacity:.35; background-image: radial-gradient(1.5px 1.5px at 40px 60px, #fff, transparent), radial-gradient(1px 1px at 140px 180px, #fff, transparent), radial-gradient(1.5px 1.5px at 260px 40px, #fff, transparent), radial-gradient(1px 1px at 320px 220px, #fff, transparent), radial-gradient(1.5px 1.5px at 380px 120px, #fff, transparent), radial-gradient(1px 1px at 60px 280px, #fff, transparent), radial-gradient(1px 1px at 200px 300px, #fff, transparent); background-repeat: repeat; background-size: 420px 380px; }
.ambient .wave{ position:absolute; border-radius:50%; filter: blur(70px); opacity:.5; }
.ambient .wave-1{ top:-10%; left:20%; width:900px; height:340px; background: linear-gradient(120deg, rgba(139,92,246,.22), rgba(217,70,239,.1) 60%, transparent); transform: rotate(-12deg); }
.ambient .wave-2{ bottom:-6%; right:10%; width:800px; height:300px; background: linear-gradient(120deg, rgba(34,211,238,.14), rgba(59,130,246,.16) 60%, transparent); transform: rotate(10deg); }

.site-shell{ position:relative; z-index:1; width:100%; }
.container{ max-width: var(--container); margin:0 auto; padding:0 24px; position:relative; z-index:1; }
.landing-root section{position:relative; z-index:1;}
.section-pad{padding:120px 0;}
@media (max-width:1024px){ .section-pad{padding:88px 0;} }
@media (max-width:640px){ .section-pad{padding:64px 0;} }

.landing-root h1,.landing-root h2,.landing-root h3,.landing-root h4{font-family: var(--font-head); font-weight:600; line-height:1.15; color:var(--ink); letter-spacing:-.02em;}
.landing-root h2{font-size:clamp(28px,4vw,44px);}
.landing-root h3{font-size:clamp(18px,2.2vw,22px);}
.landing-root p{color:var(--muted);}
.text-grad{ background: var(--grad-text); -webkit-background-clip:text; background-clip:text; color:transparent; }

.eyebrow{ display:inline-flex; align-items:center; gap:8px; font-family:var(--font-head); font-weight:600; font-size:12px; letter-spacing:1.2px; text-transform:uppercase; color:var(--purple-soft); background: rgba(139,92,246,.1); border:1px solid rgba(139,92,246,.28); padding:8px 16px; border-radius:999px; }
.section-head{ text-align:center; max-width:680px; margin:0 auto 56px; }
.section-head p{ margin-top:14px; font-size:16.5px; }
.section-head .eyebrow{ margin-bottom:18px; }

.glass{ background: var(--glass); border:1px solid var(--border); border-radius: var(--radius); backdrop-filter: blur(20px); -webkit-backdrop-filter: blur(20px); transition: border-color .25s ease, transform .25s ease, background .25s ease; }
.glass:hover{ border-color: var(--border-strong); }

.btn{ display:inline-flex; align-items:center; justify-content:center; gap:9px; font-family:var(--font-head); font-weight:600; font-size:15px; padding:15px 26px; border-radius:999px; cursor:pointer; border:1px solid transparent; transition:transform .18s ease, box-shadow .18s ease, background .18s ease, border-color .18s ease; white-space:nowrap; }
.btn:active{ transform:translateY(1px) scale(.99); }
.btn-primary{ background: var(--grad-brand); color:#0A0812; box-shadow: 0 12px 32px rgba(217,70,239,.28), 0 12px 32px rgba(139,92,246,.28); }
.btn-primary:hover{ box-shadow: 0 16px 44px rgba(217,70,239,.4), 0 16px 44px rgba(139,92,246,.4); transform:translateY(-2px) scale(1.02); }
.btn .arrow{ display:inline-block; transition: transform .2s ease; }
.btn:hover .arrow{ transform: translateX(3px); }
.btn-glass{ background: rgba(255,255,255,.04); color:var(--ink); border:1px solid var(--border-strong); backdrop-filter: blur(10px); }
.btn-glass:hover{ background: rgba(255,255,255,.08); border-color: rgba(255,255,255,.28); }
.btn-block{ width:100%; }
.btn-sm{ padding:11px 20px; font-size:13.5px; }

.announce{ position:relative; z-index:2; background: linear-gradient(90deg, rgba(139,92,246,.14), rgba(79,125,251,.14)); border-bottom:1px solid var(--border); padding:11px 16px; text-align:center; font-size:13px; color:var(--ink); }
.announce a{ color:var(--purple-soft); font-weight:600; margin-left:8px; white-space:nowrap; }

.nav-wrap{ position:sticky; top:0; z-index:50; padding:14px 14px 0; }
.nav{ display:grid; grid-template-columns: auto 1fr auto; align-items:center; gap:20px; padding:10px 10px 10px 20px; border-radius:999px; background: rgba(255,255,255,.03); border:1px solid var(--border); backdrop-filter: blur(16px); -webkit-backdrop-filter: blur(16px); transition: background .3s ease, border-color .3s ease, box-shadow .3s ease; }
.nav-wrap.scrolled .nav{ background: rgba(13,11,42,.8); border-color: var(--border-strong); box-shadow: 0 12px 32px rgba(0,0,0,.35); }
.logo{ display:flex; align-items:center; gap:9px; font-family:var(--font-head); font-weight:800; font-size:17px; letter-spacing:-.01em; }
.logo .mark{ width:28px; height:28px; border-radius:9px; background:var(--grad-brand); display:flex; align-items:center; justify-content:center; font-size:14px; box-shadow: 0 6px 18px rgba(139,92,246,.4); }
.nav-links{ justify-self:center; display:flex; gap:28px; font-size:13.5px; font-weight:500; }
.nav-links a{ color:var(--muted); transition:color .15s; }
.nav-links a:hover{ color:var(--ink); }
.nav-cta{ justify-self:end; display:flex; align-items:center; gap:10px; }
.nav-login{ font-size:13.5px; color:var(--muted); font-weight:500; padding:0 4px; }
.nav-login:hover{ color:var(--ink); }
.nav-burger{ display:none; width:40px; height:40px; border-radius:10px; align-items:center; justify-content:center; border:1px solid var(--border-strong); }
.nav-burger span{ display:block; width:18px; height:2px; background:var(--ink); position:relative; }
.nav-burger span::before, .nav-burger span::after{ content:''; position:absolute; left:0; width:18px; height:2px; background:var(--ink); }
.nav-burger span::before{ top:-6px; }
.nav-burger span::after{ top:6px; }
.mobile-menu{ display:none; flex-direction:column; gap:4px; padding:8px 0 20px; border-top:1px solid var(--border); }
.mobile-menu a, .mobile-menu button{ padding:13px 4px; font-size:15px; color:var(--ink); border-bottom:1px solid var(--border); text-align:left; width:100%; }
@media (max-width: 900px){ .nav-links{ display:none; } .nav-cta .nav-login, .nav-cta .btn-glass{ display:none; } .nav-burger{ display:flex; } .mobile-menu.open{ display:flex; } }

.hero{ padding:72px 0 40px; }
.hero-grid{ display:grid; grid-template-columns:1.05fr .95fr; gap:56px; align-items:center; }
@media (max-width:1024px){ .hero-grid{ grid-template-columns:1fr; gap:48px; } }
.hero-copy .eyebrow{ margin-bottom:22px; }
.hero h1{ font-size:clamp(34px,5vw,58px); }
.hero p.sub{ font-size:17px; max-width:520px; margin-top:20px; }
.hero-ctas{ display:flex; gap:14px; flex-wrap:wrap; margin-top:32px; }
.hero-note{ margin-top:18px; font-size:12.5px; color:var(--muted-2); display:flex; gap:8px; flex-wrap:wrap; }
.hero-note span{ display:inline-flex; align-items:center; gap:6px; }
.hero-note span::before{ content:'✓'; color:var(--success); }

.hero-visual{ position:relative; min-height:480px; display:flex; align-items:center; justify-content:center; }
.avatar-stage{ position:relative; display:inline-flex; }
.orbit-ring{ position:absolute; border:1px dashed rgba(255,255,255,.16); border-radius:50%; pointer-events:none; }
.orbit-ring.ring-1{ inset:-7%; animation: landingSpin 22s linear infinite; }
.orbit-ring.ring-2{ inset:-15%; border-color: rgba(139,92,246,.24); animation: landingSpin 32s linear infinite reverse; }
.orbit-node{ position:absolute; top:-4px; left:50%; width:7px; height:7px; margin-left:-3.5px; border-radius:50%; background: var(--grad-brand); box-shadow: 0 0 12px rgba(217,70,239,.75); }
.orbit-node.node-2{ background: var(--cyan); box-shadow: 0 0 10px rgba(34,211,238,.75); }
@keyframes landingSpin{ from{ transform:rotate(0deg); } to{ transform:rotate(360deg); } }
@media (max-width:640px){ .orbit-ring{ display:none; } }
.avatar-orb{ position:relative; width:340px; height:440px; border-radius:44px; background: linear-gradient(160deg, rgba(139,92,246,.24), rgba(79,125,251,.16) 60%, rgba(232,121,185,.14)); border:1px solid var(--border-strong); display:flex; align-items:center; justify-content:center; box-shadow: var(--shadow-glow); overflow:hidden; }
.avatar-orb::before{ content:''; position:absolute; inset:0; background: radial-gradient(circle at 50% 30%, rgba(255,255,255,.12), transparent 60%); }
.avatar-figure{ position:relative; z-index:1; width:210px; height:210px; }
.avatar-figure svg{ width:100%; height:100%; }
.avatar-photo{ position:relative; z-index:1; width:100%; height:100%; object-fit:cover; object-position:50% 20%; }
.widget-slot{ flex-direction:column; gap:16px; padding:32px; text-align:center; }
.widget-slot p{ position:relative; z-index:1; font-size:14px; color:var(--muted); line-height:1.6; }
.widget-pulse{ position:relative; z-index:1; width:14px; height:14px; border-radius:50%; background: var(--success); box-shadow: 0 0 0 0 rgba(52,211,153,.5); animation: landingWidgetPulse 2s ease-out infinite; }
@keyframes landingWidgetPulse{ 0%{ box-shadow: 0 0 0 0 rgba(52,211,153,.5); } 70%{ box-shadow: 0 0 0 16px rgba(52,211,153,0); } 100%{ box-shadow: 0 0 0 0 rgba(52,211,153,0); } }
.speaking-dot{ position:absolute; bottom:36px; left:50%; transform:translateX(-50%); display:flex; gap:5px; align-items:center; padding:8px 14px; border-radius:999px; background: rgba(8,7,12,.6); border:1px solid var(--border-strong); backdrop-filter: blur(8px); }
.speaking-dot i{ width:4px; border-radius:2px; background: var(--purple-soft); display:inline-block; animation: landingEq 1s ease-in-out infinite; }
.speaking-dot i:nth-child(1){ height:8px; animation-delay:0s; }
.speaking-dot i:nth-child(2){ height:14px; animation-delay:.15s; }
.speaking-dot i:nth-child(3){ height:10px; animation-delay:.3s; }
.speaking-dot i:nth-child(4){ height:16px; animation-delay:.45s; }
@keyframes landingEq{ 0%,100%{ transform:scaleY(.5);} 50%{ transform:scaleY(1);} }

.float-card{ position:absolute; display:flex; align-items:center; gap:9px; padding:11px 16px; border-radius:14px; font-size:12.5px; font-weight:600; background: rgba(15,14,24,.75); border:1px solid var(--border-strong); backdrop-filter: blur(12px); box-shadow: 0 14px 30px rgba(0,0,0,.4); white-space:nowrap; }
.fc-1{ top:6%; left:-6%; }
.fc-2{ top:20%; right:-10%; }
.fc-3{ bottom:28%; left:-12%; }
.fc-4{ bottom:10%; right:-6%; }
.fc-5{ top:48%; left:38%; }
@media (max-width:1024px){ .hero-visual{ min-height:420px; } .fc-1,.fc-2,.fc-3,.fc-4,.fc-5{ display:none; } }
@media (max-width:640px){ .avatar-orb{ width:250px; height:330px; } .avatar-figure{ width:150px; height:150px; } }

.trust-row{ display:flex; align-items:center; justify-content:center; gap:48px; flex-wrap:wrap; margin-top:36px; opacity:.55; }
.trust-row span{ font-family:var(--font-head); font-weight:700; font-size:15px; letter-spacing:2px; color:var(--muted); }

.demo-grid{ display:grid; grid-template-columns:.85fr 1.15fr; gap:40px; align-items:stretch; margin-top:16px; }
@media (max-width:960px){ .demo-grid{ grid-template-columns:1fr; } }
.demo-avatar{ border-radius: var(--radius-lg); padding:32px; display:flex; flex-direction:column; align-items:center; justify-content:center; gap:20px; text-align:center; min-height:420px; }
.demo-avatar .avatar-orb{ width:220px; height:280px; }
.demo-avatar .avatar-figure{ width:130px; height:130px; }
.demo-chat{ border-radius: var(--radius-lg); padding:28px; display:flex; flex-direction:column; gap:16px; }
.demo-status{ display:flex; align-items:center; gap:8px; font-size:12px; color:var(--purple-soft); font-weight:600; }
.demo-status .dot{ width:7px; height:7px; border-radius:50%; background:var(--success); box-shadow:0 0 0 3px rgba(52,211,153,.2); }
.demo-msgs{ display:flex; flex-direction:column; gap:12px; }
.demo-bubble{ max-width:85%; padding:13px 16px; border-radius:16px; font-size:14.5px; }
.demo-bubble.user{ align-self:flex-end; background: var(--grad-brand); color:#0A0812; font-weight:500; border-bottom-right-radius:4px; }
.demo-bubble.ai{ align-self:flex-start; background: rgba(255,255,255,.05); border:1px solid var(--border); color:var(--ink); border-bottom-left-radius:4px; }
.demo-questions{ display:flex; flex-wrap:wrap; gap:9px; }
.chip{ font-size:13px; padding:9px 15px; border-radius:999px; border:1px solid var(--border-strong); background: rgba(255,255,255,.03); color:var(--muted); transition: all .15s; }
.chip:hover{ color:var(--ink); border-color: var(--purple-soft); background: rgba(139,92,246,.08); }
.demo-input-row{ display:flex; gap:10px; align-items:center; margin-top:auto; }
.demo-input{ flex:1; background: rgba(255,255,255,.04); border:1px solid var(--border-strong); border-radius:999px; padding:13px 20px; color:var(--ink); font-size:14px; }
.demo-input::placeholder{ color:var(--muted-2); }
.icon-btn{ width:44px; height:44px; border-radius:50%; display:flex; align-items:center; justify-content:center; flex-shrink:0; background: rgba(255,255,255,.04); border:1px solid var(--border-strong); font-size:16px; }
.icon-btn.send{ background: var(--grad-brand); border:none; }

.grid-3{ display:grid; grid-template-columns:repeat(3,1fr); gap:22px; }
@media (max-width:860px){ .grid-3{ grid-template-columns:1fr; max-width:480px; margin:0 auto; } }
.problem-card{ padding:30px 26px; text-align:left; }
.problem-card .ic{ width:48px; height:48px; border-radius:14px; display:flex; align-items:center; justify-content:center; font-size:22px; background: rgba(139,92,246,.12); border:1px solid rgba(139,92,246,.25); margin-bottom:18px; }
.problem-card h3{ margin-bottom:8px; }
.problem-card p{ font-size:14.5px; }
.problem-transition{ text-align:center; margin-top:44px; }
.problem-transition h3{ font-size:clamp(22px,3vw,30px); }

.node-web{ position:relative; max-width:720px; margin:56px auto 0; min-height:420px; display:flex; align-items:center; justify-content:center; }
.node-center{ width:120px; height:120px; border-radius:50%; background: var(--grad-brand); display:flex; align-items:center; justify-content:center; font-size:38px; z-index:2; box-shadow: 0 0 80px rgba(139,92,246,.5); }
.node-item{ position:absolute; display:flex; flex-direction:column; align-items:center; gap:8px; z-index:1; width:110px; text-align:center; }
.node-item .ic{ width:52px; height:52px; border-radius:14px; display:flex; align-items:center; justify-content:center; font-size:22px; }
.node-item span{ font-size:12.5px; font-weight:600; color:var(--muted); }
.node-1{ top:0; left:50%; transform:translateX(-50%); }
.node-2{ top:14%; right:4%; }
.node-3{ top:14%; left:4%; }
.node-4{ bottom:14%; left:0; }
.node-5{ bottom:14%; right:0; }
.node-6{ bottom:0; left:28%; }
.node-7{ bottom:0; right:28%; }
@media (max-width:720px){ .node-web{ min-height:auto; } .node-web .node-item{ position:static; width:auto; } .node-web{ display:grid; grid-template-columns:repeat(2,1fr); gap:20px; } .node-web .node-center{ display:none; } }

.grid-6{ display:grid; grid-template-columns:repeat(3,1fr); gap:22px; }
@media (max-width:960px){ .grid-6{ grid-template-columns:repeat(2,1fr); } }
@media (max-width:600px){ .grid-6{ grid-template-columns:1fr; } }
.feature-card{ padding:30px 26px; transition: border-color .25s ease, transform .25s ease, background .25s ease, box-shadow .25s ease; }
.feature-card:hover{ transform: translateY(-4px); border-color: rgba(139,92,246,.4); background: var(--glass-hover); box-shadow: 0 16px 40px rgba(139,92,246,.16); }
.feature-card .top-row{ display:flex; justify-content:space-between; align-items:center; margin-bottom:16px; }
.feature-card .num{ font-family:var(--font-head); font-size:13px; font-weight:700; color:var(--muted-2); }
.feature-card .ic{ width:52px; height:52px; border-radius:16px; display:flex; align-items:center; justify-content:center; font-size:24px; background: linear-gradient(135deg, rgba(139,92,246,.18), rgba(217,70,239,.12)); border:1px solid var(--border-strong); margin-bottom:18px; transition: transform .25s ease; }
.feature-card:hover .ic{ transform: translateY(-4px) scale(1.05); }
.feature-card h3{ margin-bottom:8px; }
.feature-card p{ font-size:14.5px; margin-bottom:16px; }
.card-link{ display:inline-flex; align-items:center; gap:6px; font-family:var(--font-head); font-weight:600; font-size:13.5px; color:var(--purple-soft); transition: gap .2s ease, color .2s ease; }
.feature-card:hover .card-link{ color:var(--cyan); gap:9px; }

.hiw-line{ position:relative; display:grid; grid-template-columns:repeat(4,1fr); gap:24px; margin-top:24px; }
.hiw-line::before{ content:''; position:absolute; top:26px; left:12%; right:12%; height:1px; background: linear-gradient(90deg, transparent, var(--border-strong), var(--border-strong), transparent); }
@media (max-width:860px){ .hiw-line{ grid-template-columns:1fr; gap:20px; } .hiw-line::before{ display:none; } }
.hiw-item{ text-align:center; position:relative; }
@media (max-width:860px){ .hiw-item{ text-align:left; display:flex; gap:18px; align-items:flex-start; } }
.hiw-num{ width:52px; height:52px; border-radius:50%; display:flex; align-items:center; justify-content:center; background: var(--bg-1); border:1px solid var(--border-strong); font-family:var(--font-head); font-weight:700; color:var(--purple-soft); margin:0 auto 18px; position:relative; z-index:1; flex-shrink:0; }
@media (max-width:860px){ .hiw-num{ margin:0; } }
.hiw-item h3{ margin-bottom:6px; font-size:18px; }
.hiw-item p{ font-size:14px; max-width:220px; margin:0 auto; }
@media (max-width:860px){ .hiw-item p{ margin:0; } }

.customizer{ display:grid; grid-template-columns:.85fr 1.15fr; gap:32px; margin-top:16px; }
@media (max-width:900px){ .customizer{ grid-template-columns:1fr; } }
.customizer-preview{ padding:32px; display:flex; flex-direction:column; align-items:center; justify-content:center; gap:22px; min-height:380px; }
.customizer-preview .avatar-orb{ width:210px; height:260px; }
.customizer-preview .avatar-figure{ width:120px; height:120px; }
.style-row{ display:flex; flex-wrap:wrap; gap:10px; justify-content:center; }
.style-btn{ font-size:13px; padding:10px 16px; border-radius:999px; border:1px solid var(--border-strong); color:var(--muted); background: rgba(255,255,255,.03); }
.style-btn.active{ color:#0A0812; background: var(--grad-brand); border-color:transparent; font-weight:600; }
.customizer-controls{ padding:32px; display:flex; flex-direction:column; gap:16px; justify-content:center; }
.control-row{ display:flex; justify-content:space-between; align-items:center; padding:14px 18px; border-radius:14px; background: rgba(255,255,255,.03); border:1px solid var(--border); }
.control-row span{ font-size:14px; font-weight:600; }
.control-row .val{ font-size:13px; color:var(--purple-soft); }

.kb-grid{ display:grid; grid-template-columns:.9fr 1.1fr; gap:32px; align-items:center; margin-top:16px; }
@media (max-width:900px){ .kb-grid{ grid-template-columns:1fr; } }
.kb-sources{ display:flex; flex-direction:column; gap:11px; }
.kb-source{ display:flex; align-items:center; gap:11px; font-size:14.5px; padding:12px 16px; border-radius:12px; background: rgba(255,255,255,.03); border:1px solid var(--border); }
.kb-source .ck{ width:20px; height:20px; border-radius:50%; background: rgba(52,211,153,.15); color:var(--success); display:flex; align-items:center; justify-content:center; font-size:11px; flex-shrink:0; }
.kb-dash{ padding:28px; }
.kb-dash-head{ display:flex; justify-content:space-between; align-items:center; margin-bottom:20px; }
.kb-dash-head h4{ font-family:var(--font-head); font-size:15px; }
.kb-dash-head .sync{ font-size:11.5px; color:var(--success); }
.kb-stats{ display:grid; grid-template-columns:repeat(2,1fr); gap:14px; margin-bottom:18px; }
.kb-stat{ padding:16px; border-radius:14px; background: rgba(255,255,255,.03); border:1px solid var(--border); }
.kb-stat b{ display:block; font-family:var(--font-head); font-size:24px; color:var(--ink); }
.kb-stat span{ font-size:12px; color:var(--muted); }
.kb-bar{ height:8px; border-radius:999px; background: rgba(255,255,255,.06); overflow:hidden; margin-top:8px; }
.kb-bar i{ display:block; height:100%; background: var(--grad-brand); }

.grid-4{ display:grid; grid-template-columns:repeat(4,1fr); gap:18px; }
@media (max-width:960px){ .grid-4{ grid-template-columns:repeat(2,1fr); } }
@media (max-width:520px){ .grid-4{ grid-template-columns:1fr; } }
.usecase-card{ padding:26px 22px; }
.usecase-card .ic{ font-size:28px; margin-bottom:14px; }
.usecase-card h3{ font-size:16.5px; margin-bottom:7px; }
.usecase-card p{ font-size:13.5px; }

.ba-grid{ display:grid; grid-template-columns:1fr 1fr; gap:24px; margin-top:16px; }
@media (max-width:800px){ .ba-grid{ grid-template-columns:1fr; } }
.ba-col{ padding:30px 28px; }
.ba-col.before{ border-color: rgba(232,121,185,.22); }
.ba-col.after{ border-color: rgba(139,92,246,.35); background: linear-gradient(180deg, rgba(139,92,246,.06), transparent 60%); }
.ba-col h3{ margin-bottom:18px; }
.ba-row{ display:flex; gap:11px; align-items:center; padding:10px 0; font-size:14.5px; }
.ba-row .mk{ font-size:15px; flex-shrink:0; }
.ba-col.before .mk{ color:var(--pink); }
.ba-col.after .mk{ color:var(--success); }

.deploy-grid{ display:grid; grid-template-columns:repeat(4,1fr); gap:14px; margin-bottom:36px; }
@media (max-width:800px){ .deploy-grid{ grid-template-columns:repeat(2,1fr); } }
.deploy-chip{ padding:18px; text-align:center; font-family:var(--font-head); font-weight:600; font-size:14px; }
.code-window{ border-radius:18px; overflow:hidden; border:1px solid var(--border-strong); background:#0C0A14; }
.code-bar{ display:flex; gap:6px; padding:12px 16px; border-bottom:1px solid var(--border); }
.code-bar span{ width:10px; height:10px; border-radius:50%; }
.code-bar span:nth-child(1){ background:#E6564F; }
.code-bar span:nth-child(2){ background:#F0B429; }
.code-bar span:nth-child(3){ background:#2FB57A; }
.code-body{ padding:22px; font-family: 'Menlo', monospace; font-size:13px; color:var(--purple-soft); word-break:break-all; }
.mini-site{ margin-top:20px; border-radius:14px; border:1px solid var(--border); overflow:hidden; }
.mini-site-bar{ background: var(--bg-1); padding:8px 12px; font-size:10.5px; color:var(--muted-2); border-bottom:1px solid var(--border); }
.mini-site-body{ height:150px; background: linear-gradient(135deg, rgba(139,92,246,.08), rgba(79,125,251,.06)); position:relative; }
.mini-site-avatar{ position:absolute; bottom:12px; right:12px; width:40px; height:52px; border-radius:12px; background: var(--grad-brand); }

.lead-grid{ display:grid; grid-template-columns:1.1fr .9fr; gap:36px; align-items:center; margin-top:16px; }
@media (max-width:900px){ .lead-grid{ grid-template-columns:1fr; } }
.funnel{ display:flex; flex-direction:column; align-items:center; gap:6px; }
.funnel-step{ width:100%; max-width:340px; text-align:center; padding:13px; border-radius:12px; background: rgba(255,255,255,.03); border:1px solid var(--border); font-size:13.5px; font-weight:600; }
.funnel-arrow{ color:var(--muted-2); font-size:14px; }
.lead-card{ padding:26px; max-width:320px; }
.lead-card .tag{ display:inline-block; font-size:11px; font-weight:700; color:var(--success); background: rgba(52,211,153,.12); padding:4px 10px; border-radius:6px; margin-bottom:14px; }
.lead-field{ display:flex; justify-content:space-between; padding:9px 0; border-top:1px solid var(--border); font-size:13.5px; }
.lead-field:first-of-type{ border-top:none; }
.lead-field span:first-child{ color:var(--muted); }
.lead-field span:last-child{ font-weight:600; }

.metrics-row{ display:grid; grid-template-columns:repeat(5,1fr); gap:16px; margin-bottom:28px; }
@media (max-width:960px){ .metrics-row{ grid-template-columns:repeat(3,1fr); } }
@media (max-width:600px){ .metrics-row{ grid-template-columns:repeat(2,1fr); } }
.metric-card{ padding:20px; }
.metric-card b{ display:block; font-family:var(--font-head); font-size:24px; }
.metric-card span{ font-size:12px; color:var(--muted); }
.charts-grid{ display:grid; grid-template-columns:1.3fr .7fr; gap:22px; }
@media (max-width:860px){ .charts-grid{ grid-template-columns:1fr; } }
.chart-card{ padding:24px; }
.chart-card h4{ font-family:var(--font-head); font-size:14px; margin-bottom:18px; color:var(--muted); text-transform:uppercase; letter-spacing:.5px; }
.bars{ display:flex; align-items:flex-end; gap:6px; height:130px; }
.bars i{ flex:1; border-radius:6px 6px 0 0; background: var(--grad-brand); opacity:.85; }
.qlist{ display:flex; flex-direction:column; gap:14px; }
.qrow{ display:flex; flex-direction:column; gap:6px; }
.qrow .top{ display:flex; justify-content:space-between; font-size:13px; }
.qrow .bar{ height:6px; border-radius:999px; background: rgba(255,255,255,.06); overflow:hidden; }
.qrow .bar i{ display:block; height:100%; background: var(--grad-brand); }

.benefit-card{ padding:26px; }
.benefit-card .ic{ font-size:24px; margin-bottom:12px; }
.benefit-card h3{ font-size:16.5px; margin-bottom:6px; }
.benefit-card p{ font-size:13.5px; }

.grid-test{ display:grid; grid-template-columns:repeat(2,1fr); gap:20px; }
@media (max-width:800px){ .grid-test{ grid-template-columns:1fr; } }
.test-card{ padding:28px; }
.test-card .stars{ color:#F0B429; font-size:13px; margin-bottom:14px; letter-spacing:2px; }
.test-card p.quote{ font-size:14.5px; color:var(--ink); margin-bottom:20px; }
.test-person{ display:flex; align-items:center; gap:11px; }
.test-person .av{ width:40px; height:40px; border-radius:50%; background: var(--grad-brand); color:#0A0812; display:flex; align-items:center; justify-content:center; font-family:var(--font-head); font-weight:700; font-size:14px; flex-shrink:0; }
.test-person b{ display:block; font-size:13.5px; }
.test-person span{ font-size:12px; color:var(--muted); }
.demo-disclaimer{ text-align:center; font-size:12px; color:var(--muted-2); margin-top:28px; }

.toggle-wrap{ display:flex; align-items:center; justify-content:center; gap:14px; margin-bottom:44px; }
.toggle-wrap span{ font-size:14px; font-weight:600; color:var(--muted); }
.toggle-wrap span.active{ color:var(--ink); }
.switch{ width:52px; height:28px; border-radius:999px; background: var(--glass-hover); border:1px solid var(--border-strong); position:relative; }
.switch i{ position:absolute; top:2px; left:2px; width:22px; height:22px; border-radius:50%; background: var(--grad-brand); transition: transform .2s ease; }
.switch.on i{ transform: translateX(24px); }
.save-badge{ font-size:11px; color:var(--success); background: rgba(52,211,153,.12); padding:3px 8px; border-radius:6px; font-weight:700; }

.pricing-grid{ display:grid; grid-template-columns:repeat(3,1fr); gap:22px; align-items:stretch; }
@media (max-width:960px){ .pricing-grid{ grid-template-columns:1fr; max-width:420px; margin:0 auto; } }
.price-card{ padding:32px 26px; display:flex; flex-direction:column; }
.price-card.pop{ border-color: rgba(139,92,246,.4); background: linear-gradient(180deg, rgba(139,92,246,.08), var(--glass) 40%); position:relative; box-shadow: 0 24px 60px rgba(139,92,246,.14); }
@media (min-width:961px){ .price-card.pop{ transform: scale(1.03); } }
.price-card .ribbon{ position:absolute; top:-13px; left:50%; transform:translateX(-50%); background: var(--grad-brand); color:#0A0812; font-size:11px; font-weight:700; padding:5px 14px; border-radius:999px; }
.price-card .tier{ font-family:var(--font-head); font-size:13px; text-transform:uppercase; letter-spacing:1px; color:var(--muted); margin-bottom:10px; }
.price-card .amount{ font-family:var(--font-head); font-size:38px; font-weight:700; }
.price-card .amount span{ font-size:14px; color:var(--muted); font-weight:500; }
.price-card .desc{ font-size:13.5px; margin:10px 0 22px; }
.price-card ul{ display:flex; flex-direction:column; gap:11px; margin-bottom:26px; flex:1; }
.price-card ul li{ font-size:13.5px; display:flex; gap:8px; }
.price-card ul li::before{ content:'✓'; color:var(--purple-soft); font-weight:700; }

.faq-list{ display:flex; flex-direction:column; gap:12px; max-width:800px; margin:0 auto; }
.faq-item{ padding:6px 24px; }
.faq-q{ display:flex; justify-content:space-between; align-items:center; padding:18px 0; font-family:var(--font-head); font-weight:600; font-size:15.5px; width:100%; text-align:left; gap:16px; }
.faq-q .plus{ font-size:20px; color:var(--purple-soft); flex-shrink:0; transition: transform .25s ease; }
.faq-item.open .plus{ transform: rotate(45deg); }
.faq-a{ overflow:hidden; font-size:14.5px; color:var(--muted); }
.faq-a p{ padding-bottom:20px; }

.final-cta-grid{ display:grid; grid-template-columns:1.1fr .9fr; gap:40px; align-items:center; }
@media (max-width:900px){ .final-cta-grid{ grid-template-columns:1fr; text-align:center; } }
.final-cta-grid .hero-ctas{ justify-content:flex-start; }
@media (max-width:900px){ .final-cta-grid .hero-ctas{ justify-content:center; } }
.final-cta-visual{ display:flex; justify-content:center; }
.final-cta-visual .avatar-orb{ width:240px; height:300px; }
.final-cta-visual .avatar-figure{ width:140px; height:140px; }

.landing-root footer{ padding:64px 0 32px; border-top:1px solid var(--border); }
.foot-top{ display:grid; grid-template-columns:1.2fr repeat(4,1fr); gap:32px; padding-bottom:40px; }
@media (max-width:900px){ .foot-top{ grid-template-columns:repeat(2,1fr); } }
@media (max-width:560px){ .foot-top{ grid-template-columns:1fr; } }
.foot-brand p{ max-width:280px; margin-top:14px; font-size:13.5px; }
.foot-social{ display:flex; gap:10px; margin-top:18px; }
.foot-social a{ width:34px; height:34px; border-radius:9px; background: rgba(255,255,255,.04); border:1px solid var(--border); display:flex; align-items:center; justify-content:center; font-size:12px; }
.foot-col h4{ font-size:13px; color:var(--ink); margin-bottom:16px; font-family:var(--font-head); }
.foot-col a{ display:block; font-size:13.5px; color:var(--muted); margin-bottom:11px; }
.foot-col a:hover{ color:var(--purple-soft); }
.foot-bottom{ display:flex; justify-content:space-between; align-items:center; padding-top:24px; border-top:1px solid var(--border); font-size:12.5px; color:var(--muted-2); flex-wrap:wrap; gap:12px; }

.sticky-cta{ position:fixed; bottom:0; left:0; right:0; z-index:60; display:none; padding:12px 16px; background: rgba(8,7,12,.9); backdrop-filter: blur(16px); border-top:1px solid var(--border); }
@media (max-width:640px){ .sticky-cta{ display:flex; gap:10px; } }
.sticky-cta .btn{ flex:1; padding:13px; font-size:14px; }

.cursor-glow{ position:fixed; top:0; left:0; width:420px; height:420px; margin-left:-210px; margin-top:-210px; border-radius:50%; pointer-events:none; z-index:2; will-change:transform; background: radial-gradient(circle, rgba(139,92,246,.10), rgba(217,70,239,.05) 45%, transparent 70%); mix-blend-mode: screen; }
@media (max-width:900px){ .cursor-glow{ display:none; } }

.grain{ position:fixed; inset:0; z-index:3; pointer-events:none; opacity:.035; mix-blend-mode:overlay; background-image:url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='120' height='120'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='2' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E"); }

.marquee-wrap{ margin-top:28px; overflow:hidden; -webkit-mask-image: linear-gradient(90deg, transparent, #000 10%, #000 90%, transparent); mask-image: linear-gradient(90deg, transparent, #000 10%, #000 90%, transparent); }
.marquee-track{ display:flex; gap:56px; width:max-content; animation: landingMarquee 26s linear infinite; }
.marquee-track span{ font-family:var(--font-head); font-weight:700; font-size:15px; letter-spacing:2px; color:var(--muted); opacity:.55; white-space:nowrap; }
@keyframes landingMarquee{ from{ transform:translateX(0); } to{ transform:translateX(-50%); } }

.carousel{ max-width:760px; margin:0 auto; padding:40px 44px; text-align:center; overflow:hidden; }
.carousel-slide .stars{ justify-content:center; display:flex; }
.carousel-slide .quote-serif{ font-family: var(--font-serif); font-style:italic; font-size:clamp(22px,3vw,30px); line-height:1.35; color:var(--ink); margin:18px 0 26px; font-weight:400; }
.carousel-slide .test-person{ justify-content:center; }
.carousel-dots{ display:flex; justify-content:center; gap:8px; margin-top:28px; }
.dot{ width:8px; height:8px; border-radius:50%; background: var(--border-strong); transition: all .2s ease; }
.dot.active{ width:22px; background: var(--grad-brand); }

/* utility */
.mt-8{ margin-top:8px; }
`

function LandingStyles() {
  useEffect(() => {
    // Reference-count the injected tags so mounting Landing twice (e.g. a fast
    // route re-mount) doesn't remove them out from under the other instance.
    let link = document.querySelector('link[data-landing-fonts]')
    if (!link) {
      link = document.createElement('link')
      link.rel = 'stylesheet'
      link.href = 'https://fonts.googleapis.com/css2?family=Manrope:wght@500;600;700;800&family=Inter:wght@400;500;600&family=Instrument+Serif:ital@0;1&display=swap'
      link.setAttribute('data-landing-fonts', 'true')
      link.dataset.refs = '0'
      document.head.appendChild(link)
    }
    link.dataset.refs = String(Number(link.dataset.refs || 0) + 1)

    let style = document.querySelector('style[data-landing-styles]')
    if (!style) {
      style = document.createElement('style')
      style.setAttribute('data-landing-styles', 'true')
      style.textContent = LANDING_CSS
      style.dataset.refs = '0'
      document.head.appendChild(style)
    }
    style.dataset.refs = String(Number(style.dataset.refs || 0) + 1)

    // This app is a single-page router — leaving these behind would leak the
    // landing page's global resets/fonts into every other route once the
    // visitor navigates away from "/".
    return () => {
      link.dataset.refs = String(Number(link.dataset.refs || 1) - 1)
      if (link.dataset.refs === '0') link.remove()
      style.dataset.refs = String(Number(style.dataset.refs || 1) - 1)
      if (style.dataset.refs === '0') style.remove()
    }
  }, [])
  return null
}

/* ===========================================================================
   SHARED PRIMITIVES
   =========================================================================== */

function LandingReveal({ children, delay = 0, y = 24, className = '', as = 'div', ...rest }) {
  const Comp = motion[as] || motion.div
  return (
    <Comp
      className={className}
      initial={{ opacity: 0, y }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.2 }}
      transition={{ duration: 0.6, delay, ease: [0.22, 1, 0.36, 1] }}
      {...rest}
    >
      {children}
    </Comp>
  )
}

function LandingMagnetic({ children, strength = 16, className = '' }) {
  const ref = useRef(null)
  const x = useMotionValue(0)
  const y = useMotionValue(0)
  const sx = useSpring(x, { stiffness: 200, damping: 14, mass: 0.2 })
  const sy = useSpring(y, { stiffness: 200, damping: 14, mass: 0.2 })

  const handleMove = (e) => {
    const rect = ref.current.getBoundingClientRect()
    x.set(((e.clientX - rect.left - rect.width / 2) / rect.width) * strength)
    y.set(((e.clientY - rect.top - rect.height / 2) / rect.height) * strength)
  }
  const handleLeave = () => { x.set(0); y.set(0) }

  return (
    <motion.div ref={ref} className={className} style={{ x: sx, y: sy, display: 'inline-block' }} onMouseMove={handleMove} onMouseLeave={handleLeave}>
      {children}
    </motion.div>
  )
}

function LandingTilt({ children, className = '', max = 7 }) {
  const ref = useRef(null)
  const px = useMotionValue(0.5)
  const py = useMotionValue(0.5)
  const rotateX = useSpring(useTransform(py, [0, 1], [max, -max]), { stiffness: 220, damping: 22 })
  const rotateY = useSpring(useTransform(px, [0, 1], [-max, max]), { stiffness: 220, damping: 22 })

  const handleMove = (e) => {
    const rect = ref.current.getBoundingClientRect()
    px.set((e.clientX - rect.left) / rect.width)
    py.set((e.clientY - rect.top) / rect.height)
  }
  const handleLeave = () => { px.set(0.5); py.set(0.5) }

  return (
    <motion.div ref={ref} className={className} style={{ rotateX, rotateY, transformPerspective: 900, height: '100%' }} onMouseMove={handleMove} onMouseLeave={handleLeave}>
      {children}
    </motion.div>
  )
}

function LandingCounter({ value }) {
  const ref = useRef(null)
  const inView = useInView(ref, { once: true, amount: 0.6 })
  const match = value.match(/[\d,]+\.?\d*/)
  const [display, setDisplay] = useState(match ? value.replace(match[0], '0') : value)

  useEffect(() => {
    if (!inView || !match) return
    const raw = match[0]
    const target = parseFloat(raw.replace(/,/g, ''))
    const hasComma = raw.includes(',')
    const decimals = raw.includes('.') ? raw.split('.')[1].length : 0
    const controls = animate(0, target, {
      duration: 1.5,
      ease: [0.22, 1, 0.36, 1],
      onUpdate(v) {
        let num = decimals ? v.toFixed(decimals) : Math.round(v).toString()
        if (hasComma) num = Number(num).toLocaleString('en-US', { minimumFractionDigits: decimals, maximumFractionDigits: decimals })
        setDisplay(value.replace(raw, num))
      },
    })
    return () => controls.stop()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [inView])

  return <span ref={ref}>{display}</span>
}

function LandingCursorGlow() {
  const ref = useRef(null)
  useEffect(() => {
    if (window.matchMedia('(pointer: coarse)').matches) return
    const el = ref.current
    let raf = null
    let tx = 0, ty = 0, cx = 0, cy = 0
    const onMove = (e) => { tx = e.clientX; ty = e.clientY; if (!raf) raf = requestAnimationFrame(tick) }
    const tick = () => {
      cx += (tx - cx) * 0.12
      cy += (ty - cy) * 0.12
      if (el) el.style.transform = `translate(${cx}px, ${cy}px)`
      if (Math.abs(tx - cx) > 0.5 || Math.abs(ty - cy) > 0.5) raf = requestAnimationFrame(tick)
      else raf = null
    }
    window.addEventListener('mousemove', onMove)
    return () => { window.removeEventListener('mousemove', onMove); if (raf) cancelAnimationFrame(raf) }
  }, [])
  return <div ref={ref} className="cursor-glow" aria-hidden="true" />
}

function LandingAmbientBackground() {
  const { scrollY } = useScroll()
  const yWave1 = useTransform(scrollY, [0, 3200], [0, -200])
  const yWave2 = useTransform(scrollY, [0, 3200], [0, 160])
  const yGlowMagenta = useTransform(scrollY, [0, 3200], [0, -110])
  const yGlowCyan = useTransform(scrollY, [0, 3200], [0, 100])
  return (
    <div className="ambient">
      <motion.div className="glow-magenta" style={{ y: yGlowMagenta }} />
      <motion.div className="glow-cyan" style={{ y: yGlowCyan }} />
      <motion.div className="wave wave-1" style={{ y: yWave1 }} />
      <motion.div className="wave wave-2" style={{ y: yWave2 }} />
      <div className="stars" />
    </div>
  )
}

// The real product widget — self-mounts as a fixed-position floating video
// bubble on document.body regardless of where this script sits in the DOM.
// That mount happens outside React entirely (widget.js appends straight to
// document.body), so leaving the route dismisses it explicitly via the
// widget's own exposed API instead — otherwise it would keep floating over
// every other page in this app once the visitor navigates away from "/".
function LandingMiniAgentWidget() {
  useEffect(() => {
    const SRC = 'https://mini-agent-serve.onrender.com/widget.js'
    const WIDGET_ID = 'wgt_ust8VAKFBKxU9EmE6zgI'
    if (!document.querySelector(`script[src="${SRC}"]`)) {
      const script = document.createElement('script')
      script.src = SRC
      script.async = true
      script.setAttribute('data-widget-id', WIDGET_ID)
      document.head.appendChild(script)
    }
    return () => window.MiniAgent?.[WIDGET_ID]?.dismiss?.()
  }, [])
  return null
}

// Stylised "digital human" portrait — illustrated, used as a fallback when no
// photo/video is passed to LandingAvatarStage.
function LandingAvatar({ speaking = false }) {
  return (
    <svg viewBox="0 0 200 200" fill="none" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="skinGrad" x1="70" y1="42" x2="132" y2="130" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#FBD9B8" /><stop offset="100%" stopColor="#E8B48C" />
        </linearGradient>
        <linearGradient id="hairGrad" x1="58" y1="20" x2="142" y2="110" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#6D5BD0" /><stop offset="100%" stopColor="#241A3D" />
        </linearGradient>
        <linearGradient id="bodyGrad" x1="30" y1="150" x2="170" y2="205" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#8B5CF6" /><stop offset="100%" stopColor="#4F7DFB" />
        </linearGradient>
        <radialGradient id="avatarScan" cx="50%" cy="38%" r="55%">
          <stop offset="0%" stopColor="#ffffff" stopOpacity="0.16" /><stop offset="100%" stopColor="#ffffff" stopOpacity="0" />
        </radialGradient>
      </defs>
      <g stroke="rgba(255,255,255,.22)" strokeWidth="0.8" opacity="0.8">
        <line x1="28" y1="42" x2="54" y2="60" /><line x1="54" y1="60" x2="48" y2="24" />
        <line x1="172" y1="48" x2="146" y2="62" /><line x1="146" y1="62" x2="154" y2="26" />
        <line x1="22" y1="122" x2="50" y2="106" /><line x1="178" y1="118" x2="150" y2="104" />
      </g>
      <g fill="#C4B5FD" opacity="0.9">
        <circle cx="28" cy="42" r="2.4" /><circle cx="48" cy="24" r="2" />
        <circle cx="172" cy="46" r="2.4" /><circle cx="154" cy="26" r="2" />
        <circle cx="22" cy="122" r="2" /><circle cx="178" cy="118" r="2" />
      </g>
      <path d="M30 202 C30 160 61 138 100 138 C139 138 170 160 170 202 Z" fill="url(#bodyGrad)" />
      <path d="M84 141 L100 160 L69 152 Z" fill="rgba(255,255,255,.14)" />
      <path d="M116 141 L100 160 L131 152 Z" fill="rgba(255,255,255,.14)" />
      <path d="M87 116 L87 142 Q100 150 113 142 L113 116 Z" fill="url(#skinGrad)" />
      <path d="M87 122 Q100 130 113 122" stroke="rgba(0,0,0,.08)" strokeWidth="2" fill="none" />
      <ellipse cx="100" cy="66" rx="45" ry="49" fill="url(#hairGrad)" />
      <ellipse cx="100" cy="84" rx="34" ry="40" fill="url(#skinGrad)" />
      <ellipse cx="65" cy="88" rx="5" ry="8" fill="url(#skinGrad)" />
      <ellipse cx="135" cy="88" rx="5" ry="8" fill="url(#skinGrad)" />
      <path d="M74 68 Q82 62 91 67" stroke="#3A2C5C" strokeWidth="2.6" strokeLinecap="round" fill="none" />
      <path d="M109 67 Q118 62 126 68" stroke="#3A2C5C" strokeWidth="2.6" strokeLinecap="round" fill="none" />
      <g>
        <ellipse cx="82" cy="80" rx="7" ry="5" fill="#FFFFFF" /><circle cx="82" cy="80" r="4" fill="#6D5BD0" />
        <circle cx="82" cy="80" r="1.9" fill="#1B1330" /><circle cx="83.6" cy="78.4" r="1" fill="#FFFFFF" />
      </g>
      <g>
        <ellipse cx="118" cy="80" rx="7" ry="5" fill="#FFFFFF" /><circle cx="118" cy="80" r="4" fill="#6D5BD0" />
        <circle cx="118" cy="80" r="1.9" fill="#1B1330" /><circle cx="119.6" cy="78.4" r="1" fill="#FFFFFF" />
      </g>
      <path d="M97 86 Q95 98 99 101" stroke="rgba(0,0,0,.14)" strokeWidth="1.4" fill="none" strokeLinecap="round" />
      <path d="M103 86 Q105 98 101 101" stroke="rgba(0,0,0,.14)" strokeWidth="1.4" fill="none" strokeLinecap="round" />
      {speaking ? (
        <g>
          <ellipse cx="100" cy="114" rx="9" ry="6.5" fill="#7A3B33" />
          <ellipse cx="100" cy="111" rx="7.5" ry="2.4" fill="#FDEDE8" opacity="0.9" />
        </g>
      ) : (
        <path d="M87 111 Q100 119 113 111 Q100 116 87 111 Z" fill="#C97C6D" />
      )}
      <ellipse cx="76" cy="94" rx="7" ry="5" fill="#F0A8A0" opacity="0.22" />
      <ellipse cx="124" cy="94" rx="7" ry="5" fill="#F0A8A0" opacity="0.22" />
      <ellipse cx="94" cy="56" rx="14" ry="7" fill="#FFFFFF" opacity="0.14" />
      <ellipse cx="100" cy="120" rx="18" ry="7" fill="#000000" opacity="0.05" />
      <ellipse cx="100" cy="84" rx="34" ry="40" fill="url(#avatarScan)" />
    </svg>
  )
}

function LandingAvatarStage({ speaking = false, showDots = false, className = '', image = null, imageAlt = 'AI avatar', video = null }) {
  return (
    <div className={`avatar-stage ${className}`}>
      <div className="orbit-ring ring-1"><span className="orbit-node"></span></div>
      <div className="orbit-ring ring-2"><span className="orbit-node node-2"></span></div>
      <div className="avatar-orb">
        {video ? (
          <video className="avatar-photo" src={video} autoPlay loop muted playsInline />
        ) : image ? (
          <img className="avatar-photo" src={image} alt={imageAlt} />
        ) : (
          <div className="avatar-figure"><LandingAvatar speaking={speaking} /></div>
        )}
        {showDots && <div className="speaking-dot"><i></i><i></i><i></i><i></i></div>}
      </div>
    </div>
  )
}

/* ===========================================================================
   SECTIONS
   =========================================================================== */

function LandingAnnounce() {
  return (
    <div className="announce">
      Meet the next generation of AI-powered customer experiences
      <a href="#hero">Explore AVATARAI →</a>
    </div>
  )
}

function LandingNavbar() {
  const [scrolled, setScrolled] = useState(false)
  const [open, setOpen] = useState(false)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24)
    window.addEventListener('scroll', onScroll)
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  return (
    <div className={`nav-wrap ${scrolled ? 'scrolled' : ''}`}>
      <div className="container nav">
        <a href="#hero" className="logo">
          <span className="mark">🧠</span>
          AVATARAI
        </a>
        <div className="nav-links">
          {nav.links.map((l) => (
            <a key={l} href={`#${l.toLowerCase().replace(/\s+/g, '-')}`}>{l}</a>
          ))}
        </div>
        <div className="nav-cta">
          <a href="/login" className="nav-login">Login</a>
          <a href="#demo" className="btn btn-glass btn-sm">Book a Demo</a>
          <a href="/register" className="btn btn-primary btn-sm">Get Started</a>
          <button className="nav-burger" onClick={() => setOpen((o) => !o)} aria-label="Menu">
            <span></span>
          </button>
        </div>
      </div>
      <div className={`mobile-menu container ${open ? 'open' : ''}`}>
        {nav.links.map((l) => (
          <a key={l} href={`#${l.toLowerCase().replace(/\s+/g, '-')}`} onClick={() => setOpen(false)}>{l}</a>
        ))}
        <a href="/login" onClick={() => setOpen(false)}>Login</a>
        <a href="#demo" onClick={() => setOpen(false)}>Book a Demo</a>
        <a href="/register" onClick={() => setOpen(false)}>Get Started</a>
      </div>
    </div>
  )
}

function LandingHero() {
  return (
    <section className="hero" id="hero">
      <div className="container hero-grid">
        <div className="hero-copy">
          <LandingReveal><span className="eyebrow">The AI Digital Human Platform</span></LandingReveal>
          <LandingReveal delay={0.08}><h1>Your Website Deserves a <span className="text-grad">Digital Human</span>.</h1></LandingReveal>
          <LandingReveal delay={0.16}>
            <p className="sub">
              Create an AI avatar that talks to your visitors, answers questions, explains your products,
              captures leads, and works 24/7.
            </p>
          </LandingReveal>
          <LandingReveal delay={0.24}>
            <div className="hero-ctas">
              <LandingMagnetic><a href="/register" className="btn btn-primary">Create Your AI Avatar</a></LandingMagnetic>
              <a href="#demo" className="btn btn-glass">Talk to Our AI</a>
            </div>
          </LandingReveal>
          <LandingReveal delay={0.3}>
            <div className="hero-note">
              <span>No credit card required</span>
              <span>Launch in minutes</span>
              <span>Works on any website</span>
            </div>
          </LandingReveal>
        </div>

        <motion.div
          className="hero-visual"
          initial={{ opacity: 0, scale: 0.92 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
        >
          <LandingAvatarStage showDots video={avatarVideo} />
          {heroFloatCards.map((c, i) => (
            <motion.div
              key={c.label}
              className={`float-card fc-${i + 1}`}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: [0, -8, 0] }}
              transition={{
                opacity: { duration: 0.5, delay: 0.4 + i * 0.12 },
                y: { duration: 4 + i * 0.4, repeat: Infinity, ease: 'easeInOut', delay: i * 0.3 },
              }}
            >
              <span>{c.icon}</span> {c.label}
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  )
}

function LandingTrustSection() {
  const loop = [...trustLogos, ...trustLogos]
  return (
    <section style={{ padding: '48px 0' }}>
      <div className="container" style={{ textAlign: 'center' }}>
        <LandingReveal>
          <p style={{ fontSize: 14.5, maxWidth: 480, margin: '0 auto' }}>
            Built for businesses that want to turn every visitor into an opportunity.
          </p>
        </LandingReveal>
      </div>
      <div className="marquee-wrap">
        <div className="marquee-track">
          {loop.map((l, i) => <span key={i}>{l}</span>)}
        </div>
      </div>
    </section>
  )
}

function LandingLiveDemo() {
  const [status, setStatus] = useState('idle')
  const [messages, setMessages] = useState(demoMessages)
  const [input, setInput] = useState('')

  const ask = (text) => {
    if (!text.trim()) return
    setMessages((m) => [...m, { from: 'user', text }])
    setInput('')
    setStatus('listening')
    setTimeout(() => {
      setStatus('responding')
      setTimeout(() => {
        setMessages((m) => [...m, { from: 'ai', text: 'Great question — in the full product I\'d answer that using your connected knowledge base, live.' }])
        setStatus('idle')
      }, 900)
    }, 500)
  }

  return (
    <section className="section-pad" id="demo">
      <div className="container">
        <div className="section-head">
          <span className="eyebrow">Live AI Demo</span>
          <h2>Don't Just Watch a Demo. <span className="text-grad">Talk to It.</span></h2>
          <p>Ask our AI anything about AVATARAI and experience how a digital human can engage your customers.</p>
        </div>

        <div className="demo-grid">
          <LandingReveal className="glass demo-avatar">
            <LandingAvatarStage speaking={status !== 'idle'} showDots image={avatar2} imageAlt="AVATARAI live agent" />
            <button className="btn btn-glass" onClick={() => ask('What can you do?')}>🎤 Talk to AI</button>
          </LandingReveal>

          <LandingReveal delay={0.1} className="glass demo-chat">
            <div className="demo-status">
              <span className="dot"></span>
              {status === 'listening' && 'AI is listening…'}
              {status === 'responding' && 'AI is responding…'}
              {status === 'idle' && 'AI is ready'}
            </div>

            <div className="demo-msgs">
              {messages.map((m, i) => (
                <div key={i} className={`demo-bubble ${m.from === 'user' ? 'user' : 'ai'}`}>{m.text}</div>
              ))}
            </div>

            <div className="demo-questions">
              {demoQuestions.map((q) => (
                <button key={q} className="chip" onClick={() => ask(q)}>{q}</button>
              ))}
            </div>

            <div className="demo-input-row">
              <button className="icon-btn" onClick={() => ask('What can you do?')}>🎤</button>
              <input
                className="demo-input"
                placeholder="Ask anything…"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && ask(input)}
              />
              <button className="icon-btn send" onClick={() => ask(input)}>➤</button>
            </div>
          </LandingReveal>
        </div>
      </div>
    </section>
  )
}

function LandingProblemSection() {
  return (
    <section className="section-pad">
      <div className="container">
        <div className="section-head"><h2>Your Website Gets Visitors. But Who Talks to Them?</h2></div>
        <div className="grid-3">
          {problems.map((p, i) => (
            <LandingReveal key={p.title} delay={i * 0.08} className="glass problem-card">
              <div className="ic">{p.icon}</div>
              <h3>{p.title}</h3>
              <p>{p.desc}</p>
            </LandingReveal>
          ))}
        </div>
        <LandingReveal delay={0.2} className="problem-transition">
          <h3>Meet the <span className="text-grad">AI Digital Human.</span></h3>
        </LandingReveal>
      </div>
    </section>
  )
}

function LandingProductIntro() {
  return (
    <section className="section-pad">
      <div className="container">
        <div className="section-head">
          <h2>More Than a Chatbot.</h2>
          <p>AVATARAI combines a realistic digital human, natural voice, conversational AI and your business knowledge into one intelligent website experience.</p>
        </div>
        <div className="node-web">
          <motion.div
            className="node-center"
            initial={{ scale: 0.8, opacity: 0 }}
            whileInView={{ scale: 1, opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            🧑‍💼
          </motion.div>
          {productNodes.map((n, i) => (
            <LandingReveal key={n.label} delay={0.1 + i * 0.07} className={`node-item node-${i + 1}`}>
              <div className="ic glass">{n.icon}</div>
              <span>{n.label}</span>
            </LandingReveal>
          ))}
        </div>
      </div>
    </section>
  )
}

function LandingFeatures() {
  return (
    <section className="section-pad" id="product">
      <div className="container">
        <div className="section-head">
          <span className="eyebrow">Features</span>
          <h2>Everything Your Digital Human Needs.</h2>
        </div>
        <div className="grid-6">
          {features.map((f, i) => (
            <LandingReveal key={f.title} delay={(i % 3) * 0.08}>
              <LandingTilt className="glass feature-card">
                <div className="top-row">
                  <div className="ic">{f.icon}</div>
                  <span className="num">{String(i + 1).padStart(2, '0')}</span>
                </div>
                <h3>{f.title}</h3>
                <p>{f.desc}</p>
                <a href="#pricing" className="card-link">Explore <span className="arrow">→</span></a>
              </LandingTilt>
            </LandingReveal>
          ))}
        </div>
      </div>
    </section>
  )
}

function LandingHowItWorks() {
  return (
    <section className="section-pad">
      <div className="container">
        <div className="section-head"><h2>From Idea to AI Employee in Minutes.</h2></div>
        <div className="hiw-line">
          {howItWorks.map((s, i) => (
            <LandingReveal key={s.num} delay={i * 0.1} className="hiw-item">
              <div className="hiw-num">{s.num}</div>
              <div>
                <h3>{s.title}</h3>
                <p>{s.desc}</p>
              </div>
            </LandingReveal>
          ))}
        </div>
      </div>
    </section>
  )
}

function LandingAvatarCustomizer() {
  const [active, setActive] = useState('Professional')
  return (
    <section className="section-pad">
      <div className="container">
        <div className="section-head"><h2>Create an AI Human That Represents Your Brand.</h2></div>
        <div className="customizer">
          <LandingReveal className="glass customizer-preview">
            <LandingAvatarStage speaking image={avatar1} imageAlt="Priya — AVATARAI avatar preview" />
            <div className="style-row">
              {avatarStyles.map((s) => (
                <button key={s} className={`style-btn ${active === s ? 'active' : ''}`} onClick={() => setActive(s)}>{s}</button>
              ))}
            </div>
          </LandingReveal>
          <LandingReveal delay={0.1} className="glass customizer-controls">
            {avatarControls.map((c) => (
              <div className="control-row" key={c}>
                <span>{c}</span>
                <span className="val">{controlValues[c]}</span>
              </div>
            ))}
          </LandingReveal>
        </div>
      </div>
    </section>
  )
}

function LandingKnowledgeBase() {
  return (
    <section className="section-pad">
      <div className="container">
        <div className="section-head">
          <h2>Your AI Knows Your Business.</h2>
          <p>Connect your existing business information and let the AI answer customers using your own knowledge.</p>
        </div>
        <div className="kb-grid">
          <LandingReveal className="kb-sources">
            {knowledgeSources.map((s) => (
              <div className="kb-source" key={s}><span className="ck">✓</span> {s}</div>
            ))}
          </LandingReveal>
          <LandingReveal delay={0.1} className="glass kb-dash">
            <div className="kb-dash-head">
              <h4>AI Knowledge Base</h4>
              <span className="sync">● Last synced: 2 minutes ago</span>
            </div>
            <div className="kb-stats">
              <div className="kb-stat"><b>1,284</b><span>Documents</span></div>
              <div className="kb-stat">
                <b>98%</b><span>Knowledge Coverage</span>
                <div className="kb-bar"><i style={{ width: '98%' }}></i></div>
              </div>
            </div>
            <div className="kb-bar"><i style={{ width: '86%' }}></i></div>
          </LandingReveal>
        </div>
      </div>
    </section>
  )
}

function LandingUseCases() {
  return (
    <section className="section-pad" id="use-cases">
      <div className="container">
        <div className="section-head">
          <span className="eyebrow">Use Cases</span>
          <h2>One AI Human. Endless Possibilities.</h2>
        </div>
        <div className="grid-4">
          {useCases.map((u, i) => (
            <LandingReveal key={u.slug} delay={(i % 4) * 0.06}>
              <LandingTilt className="glass usecase-card">
                <div className="ic">{u.icon}</div>
                <h3>{u.title}</h3>
                <p>{u.desc}</p>
              </LandingTilt>
            </LandingReveal>
          ))}
        </div>
      </div>
    </section>
  )
}

function LandingBeforeAfter() {
  return (
    <section className="section-pad">
      <div className="container">
        <div className="section-head"><h2>Your Website Before. Your Website After.</h2></div>
        <div className="ba-grid">
          <LandingReveal className="glass ba-col before">
            <h3>Traditional Website</h3>
            {beforeItems.map((t) => <div className="ba-row" key={t}><span className="mk">✕</span>{t}</div>)}
          </LandingReveal>
          <LandingReveal delay={0.1} className="glass ba-col after">
            <h3>AI-Powered Website</h3>
            {afterItems.map((t) => <div className="ba-row" key={t}><span className="mk">✓</span>{t}</div>)}
          </LandingReveal>
        </div>
      </div>
    </section>
  )
}

function LandingDeployAnywhere() {
  return (
    <section className="section-pad">
      <div className="container">
        <div className="section-head">
          <h2>Deploy Your AI Human Anywhere.</h2>
          <p>Add your AI digital human to almost any website with a simple embed.</p>
        </div>
        <LandingReveal className="deploy-grid">
          {integrations.map((n) => <div className="glass deploy-chip" key={n}>{n}</div>)}
        </LandingReveal>
        <LandingReveal delay={0.1} className="code-window">
          <div className="code-bar"><span></span><span></span><span></span></div>
          <div className="code-body">{embedSnippet}</div>
          <div style={{ padding: '0 22px 22px' }}>
            <div className="mini-site">
              <div className="mini-site-bar">yourbusiness.com</div>
              <div className="mini-site-body"><div className="mini-site-avatar"></div></div>
            </div>
          </div>
        </LandingReveal>
      </div>
    </section>
  )
}

function LandingLeadFunnel() {
  return (
    <section className="section-pad">
      <div className="container">
        <div className="section-head"><h2>Turn Conversations Into Customers.</h2></div>
        <div className="lead-grid">
          <LandingReveal className="funnel">
            {funnelSteps.map((s, i) => (
              <div key={s} style={{ width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                <div className="glass funnel-step">{s}</div>
                {i < funnelSteps.length - 1 && <div className="funnel-arrow">↓</div>}
              </div>
            ))}
          </LandingReveal>
          <LandingReveal delay={0.1}>
            <div className="glass lead-card">
              <span className="tag">New Lead</span>
              <div className="lead-field"><span>Name</span><span>{sampleLead.name}</span></div>
              <div className="lead-field"><span>Email</span><span>{sampleLead.email}</span></div>
              <div className="lead-field"><span>Interest</span><span>{sampleLead.interest}</span></div>
              <div className="lead-field"><span>Intent</span><span>{sampleLead.intent}</span></div>
              <div className="lead-field"><span>Status</span><span>{sampleLead.status}</span></div>
            </div>
            <a href="#pricing" className="btn btn-primary" style={{ marginTop: 20 }}>Capture More Leads</a>
          </LandingReveal>
        </div>
      </div>
    </section>
  )
}

function LandingAnalyticsDashboard() {
  const max = Math.max(...conversationVolume)
  return (
    <section className="section-pad">
      <div className="container">
        <div className="section-head"><h2>Know What Your AI Is Doing.</h2></div>
        <div className="metrics-row">
          {analyticsMetrics.map((m, i) => (
            <LandingReveal key={m.label} delay={i * 0.06} className="glass metric-card">
              <b><LandingCounter value={m.value} /></b>
              <span>{m.label}</span>
            </LandingReveal>
          ))}
        </div>
        <div className="charts-grid">
          <LandingReveal className="glass chart-card">
            <h4>Conversation Volume</h4>
            <div className="bars">
              {conversationVolume.map((v, i) => (
                <motion.i
                  key={i}
                  initial={{ height: 0 }}
                  whileInView={{ height: `${(v / max) * 100}%` }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.6, delay: i * 0.04 }}
                />
              ))}
            </div>
          </LandingReveal>
          <LandingReveal delay={0.1} className="glass chart-card">
            <h4>Top Questions</h4>
            <div className="qlist">
              {topQuestions.map((q) => (
                <div className="qrow" key={q.q}>
                  <div className="top"><span>{q.q}</span><span>{q.pct}%</span></div>
                  <div className="bar"><i style={{ width: `${q.pct}%` }}></i></div>
                </div>
              ))}
            </div>
          </LandingReveal>
        </div>
      </div>
    </section>
  )
}

function LandingBusinessBenefits() {
  return (
    <section className="section-pad">
      <div className="container">
        <div className="section-head"><h2>Build Once. Let Your AI Work 24/7.</h2></div>
        <div className="grid-6">
          {businessBenefits.map((b, i) => (
            <LandingReveal key={b.title} delay={(i % 3) * 0.08} className="glass benefit-card">
              <div className="ic">{b.icon}</div>
              <h3>{b.title}</h3>
              <p>{b.desc}</p>
            </LandingReveal>
          ))}
        </div>
      </div>
    </section>
  )
}

function LandingTestimonials() {
  const [i, setI] = useState(0)
  const [paused, setPaused] = useState(false)
  const len = testimonials.length

  useEffect(() => {
    if (paused) return
    const t = setInterval(() => setI((v) => (v + 1) % len), 5000)
    return () => clearInterval(t)
  }, [paused, len])

  const t = testimonials[i]

  return (
    <section className="section-pad">
      <div className="container">
        <div className="section-head">
          <span className="eyebrow">Testimonials</span>
          <h2>Businesses Are Giving Their Websites a Voice.</h2>
        </div>

        <LandingReveal className="glass carousel" onMouseEnter={() => setPaused(true)} onMouseLeave={() => setPaused(false)}>
          <AnimatePresence mode="wait">
            <motion.div
              key={i}
              initial={{ opacity: 0, x: 24 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -24 }}
              transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
              className="carousel-slide"
            >
              <div className="stars">★★★★★</div>
              <p className="quote quote-serif">"{t.quote}"</p>
              <div className="test-person">
                <div className="av">{t.initials}</div>
                <div><b>{t.name}</b><span>{t.role}</span></div>
              </div>
            </motion.div>
          </AnimatePresence>

          <div className="carousel-dots">
            {testimonials.map((_, idx) => (
              <button key={idx} className={`dot ${idx === i ? 'active' : ''}`} onClick={() => setI(idx)} aria-label={`Show testimonial ${idx + 1}`} />
            ))}
          </div>
        </LandingReveal>

        <p className="demo-disclaimer">Names, companies, and quotes shown are illustrative sample data for demo purposes.</p>
      </div>
    </section>
  )
}

function LandingPricing() {
  const [yearly, setYearly] = useState(false)
  return (
    <section className="section-pad" id="pricing">
      <div className="container">
        <div className="section-head">
          <span className="eyebrow">Pricing</span>
          <h2>Simple Pricing. Powerful AI.</h2>
        </div>

        <div className="toggle-wrap">
          <span className={!yearly ? 'active' : ''}>Monthly</span>
          <button className={`switch ${yearly ? 'on' : ''}`} onClick={() => setYearly((y) => !y)} aria-label="Toggle yearly pricing"><i></i></button>
          <span className={yearly ? 'active' : ''}>Yearly</span>
          <span className="save-badge">Save 20%</span>
        </div>

        <div className="pricing-grid">
          {pricingTiers.map((t, i) => (
            <LandingReveal key={t.tier} delay={i * 0.08} className={`glass price-card ${t.popular ? 'pop' : ''}`}>
              {t.badge && <span className="ribbon">{t.badge}</span>}
              <div className="tier">{t.tier}</div>
              <div className="amount">
                {t.priceMonthly ? (
                  <>₹{yearly ? t.priceYearly.toLocaleString('en-IN') : t.priceMonthly.toLocaleString('en-IN')}<span> / month</span></>
                ) : (
                  <>Custom</>
                )}
              </div>
              <p className="desc">{t.desc}</p>
              <ul>{t.features.map((f) => <li key={f}>{f}</li>)}</ul>
              <a href="/register" className={`btn btn-block ${t.popular ? 'btn-primary' : 'btn-glass'}`}>{t.cta}</a>
            </LandingReveal>
          ))}
        </div>
      </div>
    </section>
  )
}

function LandingFAQ() {
  const [openIdx, setOpenIdx] = useState(0)
  return (
    <section className="section-pad">
      <div className="container">
        <div className="section-head"><h2>Frequently Asked Questions</h2></div>
        <div className="faq-list">
          {faqs.map((f, i) => {
            const isOpen = openIdx === i
            return (
              <LandingReveal key={f.q} delay={Math.min(i * 0.03, 0.3)} className={`glass faq-item ${isOpen ? 'open' : ''}`}>
                <button className="faq-q" onClick={() => setOpenIdx(isOpen ? -1 : i)}>
                  {f.q}
                  <span className="plus">+</span>
                </button>
                <AnimatePresence initial={false}>
                  {isOpen && (
                    <motion.div
                      className="faq-a"
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
                    >
                      <p>{f.a}</p>
                    </motion.div>
                  )}
                </AnimatePresence>
              </LandingReveal>
            )
          })}
        </div>
      </div>
    </section>
  )
}

function LandingFinalCTA() {
  return (
    <section className="section-pad">
      <div className="container">
        <LandingReveal className="glass" style={{ padding: '56px 40px', borderRadius: 32 }}>
          <div className="final-cta-grid">
            <div>
              <span className="eyebrow">Ready When You Are</span>
              <h2 style={{ marginTop: 18 }}>Your Website Is Ready to Talk.</h2>
              <p style={{ marginTop: 16, maxWidth: 460 }}>
                Give every visitor an intelligent digital human that can answer questions, build trust and
                generate leads — 24/7.
              </p>
              <div className="hero-ctas">
                <LandingMagnetic><a href="/register" className="btn btn-primary">Create Your AI Avatar</a></LandingMagnetic>
                <a href="#demo" className="btn btn-glass">Book a Demo</a>
              </div>
            </div>
            <div className="final-cta-visual">
              <LandingAvatarStage speaking image={avatar2} imageAlt="AVATARAI digital human" />
            </div>
          </div>
        </LandingReveal>
      </div>
    </section>
  )
}

function LandingFooter() {
  return (
    <footer>
      <div className="container">
        <div className="foot-top">
          <div className="foot-brand">
            <a href="#hero" className="logo"><span className="mark">🧠</span>AVATARAI</a>
            <p>Turn your website into a digital human that talks to your visitors, 24/7.</p>
            <div className="foot-social">
              {socialLinks.map((s) => <a href="#" key={s} aria-label={s}>{socialIcon[s] || s[0]}</a>)}
            </div>
          </div>
          {footerColumns.map((col) => (
            <div className="foot-col" key={col.title}>
              <h4>{col.title}</h4>
              {col.links.map((l) => <a href="#" key={l}>{l}</a>)}
            </div>
          ))}
        </div>
        <div className="foot-bottom">
          <span>© 2026 AVATARAI. All rights reserved.</span>
          <span>Built for businesses ready to give their website a voice.</span>
        </div>
      </div>
    </footer>
  )
}

function LandingStickyCTA() {
  return (
    <div className="sticky-cta">
      <a href="#demo" className="btn btn-glass">Talk to Our AI</a>
      <a href="/register" className="btn btn-primary">Create Your AI Avatar</a>
    </div>
  )
}

/* ===========================================================================
   MAIN EXPORT
   =========================================================================== */

export default function Landing() {
  return (
    <div className="landing-root">
      <LandingStyles />
      <LandingCursorGlow />
      <div className="grain" />
      <LandingAmbientBackground />
      <div className="site-shell">
        <LandingAnnounce />
        <LandingNavbar />
        <LandingHero />
        <LandingTrustSection />
        <LandingLiveDemo />
        <LandingProblemSection />
        <LandingProductIntro />
        <LandingFeatures />
        <LandingHowItWorks />
        <LandingAvatarCustomizer />
        <LandingKnowledgeBase />
        <LandingUseCases />
        <LandingBeforeAfter />
        <LandingDeployAnywhere />
        <LandingLeadFunnel />
        <LandingAnalyticsDashboard />
        <LandingBusinessBenefits />
        <LandingTestimonials />
        <LandingPricing />
        <LandingFAQ />
        <LandingFinalCTA />
        <LandingFooter />
      </div>
      <LandingStickyCTA />
      <LandingMiniAgentWidget />
    </div>
  )
}
