'use client';

import Link from 'next/link';
import { useAccount } from 'wagmi';
import { WalletConnect } from '@/components/WalletConnect';
import { useSessionHistory, useSessionMeta } from '@/hooks/useSessionHistory';

function SessionCard({ sessionId }: { sessionId: `0x${string}` }) {
  const { meta } = useSessionMeta(sessionId);

  return (
    <div className="p-4 rounded-xl border border-vault-border bg-vault-surface space-y-2 hover:border-vault-teal/20 transition-colors">
      <div className="flex items-center justify-between">
        <span className="font-mono text-xs text-vault-teal">{sessionId.slice(0, 10)}…{sessionId.slice(-8)}</span>
        <Link
          href={`/chat?session=${sessionId}`}
          className="font-mono text-[10px] text-vault-muted hover:text-vault-teal transition-colors"
        >
          Open →
        </Link>
      </div>
      {meta && (
        <div className="flex items-center gap-4 font-mono text-[11px] text-vault-muted">
          <span>Messages: {meta.messageCount.toString()}</span>
          <span>Started: {new Date(Number(meta.startedAt) * 1000).toLocaleDateString()}</span>
        </div>
      )}
      <div className="font-mono text-[10px] text-vault-muted/50 flex items-center gap-1">
        <svg width="8" height="10" viewBox="0 0 10 12" fill="none" className="text-vault-teal/40">
          <rect x="1" y="5" width="8" height="7" rx="1.5" stroke="currentColor" strokeWidth="1.5" />
          <path d="M3 5V3.5a2 2 0 1 1 4 0V5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
        </svg>
        Encrypted at rest · decrypt locally
      </div>
    </div>
  );
}

export default function SessionsPage() {
  const { isConnected } = useAccount();
  const { sessionIds, loadingIds } = useSessionHistory();

  return (
    <div className="flex flex-col min-h-[calc(100vh-36px)]">
      <nav className="flex items-center justify-between px-6 py-3 border-b border-vault-border">
        <Link href="/" className="font-serif text-vault-text hover:text-vault-teal transition-colors">
          MindVault
        </Link>
        <WalletConnect />
      </nav>

      <div className="flex-1 max-w-2xl w-full mx-auto px-6 py-8 space-y-4">
        <div className="space-y-1">
          <h1 className="font-serif text-2xl text-vault-text">Session History</h1>
          <p className="font-mono text-xs text-vault-muted">
            All sessions are encrypted on-chain. Responses are decrypted locally in your browser.
          </p>
        </div>

        {!isConnected && (
          <div className="p-6 rounded-xl border border-vault-border bg-vault-surface text-center space-y-3">
            <p className="font-mono text-sm text-vault-muted">Connect your wallet to view sessions.</p>
            <WalletConnect />
          </div>
        )}

        {isConnected && loadingIds && (
          <div className="font-mono text-xs text-vault-muted">Loading sessions…</div>
        )}

        {isConnected && !loadingIds && sessionIds.length === 0 && (
          <div className="p-6 rounded-xl border border-vault-border bg-vault-surface text-center space-y-3">
            <p className="font-mono text-sm text-vault-muted">No sessions found for this wallet.</p>
            <Link
              href="/chat"
              className="inline-block px-4 py-2 rounded-lg border border-vault-teal/30 bg-vault-teal/10 text-vault-teal font-mono text-sm hover:bg-vault-teal/20 transition-colors"
            >
              Start a session
            </Link>
          </div>
        )}

        {isConnected && sessionIds.map((id) => (
          <SessionCard key={id} sessionId={id} />
        ))}
      </div>
    </div>
  );
}
