import Link from 'next/link';
import { WalletConnect } from '@/components/WalletConnect';

export default function LandingPage() {
  return (
    <div className="flex flex-col min-h-[calc(100vh-36px)]">
      {/* Nav */}
      <nav className="flex items-center justify-between px-6 py-4 border-b border-vault-border">
        <span className="font-serif text-lg text-vault-text tracking-tight">MindVault</span>
        <WalletConnect />
      </nav>

      {/* Hero */}
      <div className="flex-1 flex flex-col items-center justify-center px-6 text-center gap-8 py-20">
        <div className="space-y-4 max-w-xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-vault-teal/30 bg-vault-teal/5 font-mono text-xs text-vault-teal mb-2">
            <span className="w-1.5 h-1.5 rounded-full bg-vault-teal animate-pulse" />
            Ritual Chain · Chain ID 1979
          </div>
          <h1 className="font-serif text-4xl md:text-5xl text-vault-text leading-tight">
            Your mind, your chain,<br />your keys.
          </h1>
          <p className="text-vault-muted text-base leading-relaxed">
            A fully on-chain mental wellness companion. Every conversation is encrypted
            end-to-end, runs inside a TEE, and persists as a sovereign agent — no
            centralized server ever touches your thoughts.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-3">
          <Link
            href="/chat"
            className="px-6 py-3 rounded-xl bg-vault-teal/15 border border-vault-teal/30 text-vault-teal font-mono text-sm hover:bg-vault-teal/25 transition-colors"
          >
            Open Vault
          </Link>
          <Link
            href="/sessions"
            className="px-6 py-3 rounded-xl bg-vault-surface border border-vault-border text-vault-muted font-mono text-sm hover:border-vault-teal/20 hover:text-vault-text transition-colors"
          >
            Session History
          </Link>
        </div>

        {/* Feature grid */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-8 max-w-2xl w-full text-left">
          {FEATURES.map((f) => (
            <div
              key={f.title}
              className="p-4 rounded-xl border border-vault-border bg-vault-surface/60 space-y-2"
            >
              <div className="font-mono text-vault-teal text-xs">{f.icon}</div>
              <h3 className="font-serif text-sm text-vault-text">{f.title}</h3>
              <p className="font-mono text-[11px] text-vault-muted leading-relaxed">{f.body}</p>
            </div>
          ))}
        </div>
      </div>

      <footer className="px-6 py-4 border-t border-vault-border font-mono text-[10px] text-vault-muted text-center">
        Not a substitute for professional therapy. If you are in crisis, call or text{' '}
        <strong className="text-amber-400">988</strong>.
      </footer>
    </div>
  );
}

const FEATURES = [
  {
    icon: '🔐',
    title: 'ECIES Encryption',
    body: 'Messages encrypted client-side before submission. Only your private key decrypts responses.',
  },
  {
    icon: '🔮',
    title: 'TEE Inference',
    body: 'Plaintext never leaves the Trusted Execution Environment. Verifiable on-chain.',
  },
  {
    icon: '⛓️',
    title: 'Sovereign Agent',
    body: 'Session state lives on Ritual Chain. No company can shut it down or subpoena it.',
  },
];
