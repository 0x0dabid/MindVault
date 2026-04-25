import Link from 'next/link';
import { WalletConnect } from '@/components/WalletConnect';

export default function LandingPage() {
  return (
    <div className="flex flex-col min-h-[calc(100vh-36px)]">

      {/* ── Nav ──────────────────────────────────────────────────────────── */}
      <nav className="flex items-center justify-between px-6 md:px-10 py-4 border-b border-vault-border">
        <div className="flex items-center gap-3">
          <span className="font-display text-xl text-gray-100 tracking-tight">MindVault</span>
          <span className="hidden sm:inline font-mono text-[10px] text-ritual-green/70 border border-ritual-green/20 bg-ritual-green/5 px-2 py-0.5 rounded">
            Ritual Chain · 1979
          </span>
        </div>
        <div className="flex items-center gap-4">
          <Link href="/sessions" className="hidden sm:block font-mono text-xs text-gray-400 hover:text-gray-200 transition-colors">
            Sessions
          </Link>
          <WalletConnect />
        </div>
      </nav>

      {/* ── Hero ─────────────────────────────────────────────────────────── */}
      <section className="flex-1 flex flex-col items-center justify-center px-6 md:px-10 text-center gap-8 py-24 relative">
        {/* Mesh gradient glow behind hero */}
        <div
          aria-hidden="true"
          className="absolute inset-0 pointer-events-none overflow-hidden"
          style={{
            background:
              'radial-gradient(ellipse 60% 40% at 50% 60%, rgba(25,209,132,0.06) 0%, transparent 70%)',
          }}
        />

        <div className="relative space-y-6 max-w-2xl">
          {/* Chain badge */}
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-ritual-green/30 bg-ritual-green/5 font-mono text-xs text-ritual-green">
            <span className="w-1.5 h-1.5 rounded-full bg-ritual-green animate-pulse" aria-hidden="true" />
            ▣ Sovereign Agent · TEE-verified
          </div>

          {/* Main headline */}
          <h1
            className="font-display text-balance leading-tight text-gray-100"
            style={{ fontSize: 'clamp(2.5rem, 6vw, 4rem)', letterSpacing: '-0.02em' }}
          >
            Your mind.<br />Your chain.<br />Your keys.
          </h1>

          <p className="font-body text-gray-400 text-base md:text-lg leading-relaxed max-w-xl mx-auto">
            A fully on-chain mental wellness companion. Every conversation is encrypted
            end-to-end, runs inside a TEE, and persists as a sovereign agent on
            Ritual Chain — no server ever touches your thoughts.
          </p>

          <p className="font-mono text-xs text-gray-500">
            Not a substitute for professional therapy. &nbsp;
            <span className="text-ritual-gold">Crisis line: call or text 988</span>
          </p>
        </div>

        {/* CTAs */}
        <div className="relative flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
          <Link
            href="/chat"
            className="px-6 py-3 rounded-xl border border-ritual-green text-ritual-green font-body font-semibold text-sm
                       hover:bg-ritual-green/10 shadow-glow-green transition-all focus-ritual w-full sm:w-auto text-center"
          >
            Open Vault
          </Link>
          <Link
            href="/sessions"
            className="px-6 py-3 rounded-xl border border-gray-700 text-gray-400 font-body text-sm
                       hover:border-gray-500 hover:text-gray-200 transition-colors w-full sm:w-auto text-center"
          >
            Session History
          </Link>
        </div>
      </section>

      {/* ── Section divider ──────────────────────────────────────────────── */}
      <div className="divider-green mx-6 md:mx-10" />

      {/* ── Feature grid ─────────────────────────────────────────────────── */}
      <section className="px-6 md:px-10 py-16">
        <p className="font-mono text-xs text-gray-500 uppercase tracking-widest mb-8">
          How it protects you
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 max-w-4xl">
          {FEATURES.map((f) => (
            <article
              key={f.title}
              className="p-5 rounded-xl border border-vault-border bg-ritual-elevated shadow-card space-y-3"
            >
              <div className="flex items-center gap-2">
                <span className={`font-mono text-base ${f.iconColor}`} aria-hidden="true">{f.icon}</span>
                <span className="font-mono text-[10px] uppercase tracking-widest text-gray-500">{f.tag}</span>
              </div>
              <h3 className="font-body font-semibold text-gray-200 text-sm">{f.title}</h3>
              <p className="font-body text-gray-400 text-xs leading-relaxed">{f.body}</p>
            </article>
          ))}
        </div>
      </section>

      {/* ── Section divider ──────────────────────────────────────────────── */}
      <div className="divider-green mx-6 md:mx-10" />

      {/* ── How it works ─────────────────────────────────────────────────── */}
      <section className="px-6 md:px-10 py-16">
        <p className="font-mono text-xs text-gray-500 uppercase tracking-widest mb-10">
          How it works
        </p>
        <ol className="flex flex-col md:flex-row gap-6 max-w-4xl" aria-label="Steps">
          {STEPS.map((step, i) => (
            <li key={step.title} className="flex-1 space-y-3">
              <div className="flex items-center gap-3">
                <span className="w-7 h-7 rounded-full border border-ritual-green/40 bg-ritual-green/5 flex items-center justify-center font-mono text-xs text-ritual-green">
                  {i + 1}
                </span>
                <div className="h-px flex-1 bg-gradient-to-r from-ritual-green/20 to-transparent hidden md:block" />
              </div>
              <h3 className="font-body font-semibold text-gray-200 text-sm">{step.title}</h3>
              <p className="font-body text-gray-400 text-xs leading-relaxed">{step.body}</p>
            </li>
          ))}
        </ol>
      </section>

      {/* ── Section divider ──────────────────────────────────────────────── */}
      <div className="divider-green mx-6 md:mx-10" />

      {/* ── Footer ───────────────────────────────────────────────────────── */}
      <footer className="px-6 md:px-10 py-8 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 font-mono text-[11px] text-gray-500">
        <div className="space-y-1">
          <p>MindVault is <strong className="text-gray-300">not</strong> a substitute for professional mental health care.</p>
          <p>
            If you are in crisis:&nbsp;
            <strong className="text-ritual-gold">988 Suicide &amp; Crisis Lifeline</strong> — call or text 988 &nbsp;|&nbsp;
            <strong className="text-ritual-gold">Crisis Text Line</strong> — text HOME to 741741
          </p>
        </div>
        <div className="flex items-center gap-5 shrink-0">
          <a
            href="https://ritual.net"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-ritual-green transition-colors"
          >
            Ritual Chain ↗
          </a>
          <a
            href="https://github.com/0x0dabid/mindvault"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-gray-300 transition-colors"
          >
            GitHub ↗
          </a>
        </div>
      </footer>
    </div>
  );
}

const FEATURES = [
  {
    icon: '▣',
    tag: 'Sovereign Agent',
    iconColor: 'text-ritual-pink',
    title: 'AI Runs Inside a TEE',
    body: 'The therapeutic model executes inside a Trusted Execution Environment. Not even Ritual node operators can see your messages during inference.',
  },
  {
    icon: '◈',
    tag: 'ECIES · End-to-end',
    iconColor: 'text-ritual-green',
    title: 'Client-Side Encryption',
    body: 'Every message is encrypted in your browser before it touches the chain. Only your private key can decrypt the agent\'s responses.',
  },
  {
    icon: '⛓',
    tag: 'Ritual Chain · 1979',
    iconColor: 'text-vault-teal',
    title: 'You Own Your Data',
    body: 'Session history persists on-chain. No company can shut it down, subpoena it, or train models on it. Your vault, your keys.',
  },
];

const STEPS = [
  {
    title: 'Connect & Fund',
    body: 'Connect your wallet and deposit a small amount of RITUAL into your on-chain wallet. Covers the TEE execution fee per message (~0.5–1 RITUAL).',
  },
  {
    title: 'Start a Session',
    body: 'Derive your ECIES encryption keys from your wallet, deploy your personal vault harness, and begin an encrypted conversation.',
  },
  {
    title: 'Own Your History',
    body: 'Session state is stored on Ritual Chain. Optionally persist conversation history to your own HuggingFace dataset — encrypted at rest by the TEE.',
  },
];
