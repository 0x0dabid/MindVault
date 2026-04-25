'use client';

import Link from 'next/link';
import { useAccount } from 'wagmi';
import { WalletConnect } from '@/components/WalletConnect';
import { useSessionHistory, useSessionMeta } from '@/hooks/useSessionHistory';
import { useHarness } from '@/hooks/useHarness';

function truncateHex(hex: string) {
  return `${hex.slice(0, 10)}…${hex.slice(-8)}`;
}

function SessionCard({ sessionId }: { sessionId: `0x${string}` }) {
  const { meta } = useSessionMeta(sessionId);

  return (
    <article className="p-5 rounded-xl border border-vault-border bg-ritual-elevated shadow-card
                        hover:border-ritual-green/20 transition-colors space-y-3">
      <div className="flex items-center justify-between">
        <span className="font-mono text-xs text-gray-300">{truncateHex(sessionId)}</span>
        <Link
          href={`/chat?session=${sessionId}`}
          className="font-mono text-[10px] text-ritual-green hover:text-ritual-green/80 transition-colors"
        >
          Open →
        </Link>
      </div>

      {meta && (
        <div className="flex items-center gap-5 font-mono text-[11px] text-gray-500">
          <span>
            <span className="text-gray-400">{meta.messageCount.toString()}</span> messages
          </span>
          <span>
            Started{' '}
            <span className="text-gray-400">
              {new Date(Number(meta.startedAt) * 1000).toLocaleDateString()}
            </span>
          </span>
        </div>
      )}

      <div className="flex items-center gap-1.5 font-mono text-[10px] text-gray-600">
        <span className="text-ritual-green/50" aria-hidden="true">◈</span>
        DKMS-encrypted at rest · decrypt locally
      </div>
    </article>
  );
}

export default function SessionsPage() {
  const { isConnected } = useAccount();
  const { sessionIds, loadingIds } = useSessionHistory();
  const { hasHarness } = useHarness();

  return (
    <div className="flex flex-col min-h-[calc(100vh-36px)]">

      {/* Nav */}
      <nav className="flex items-center justify-between px-6 md:px-10 py-4 border-b border-vault-border">
        <div className="flex items-center gap-3">
          <Link href="/" className="font-display text-gray-100 hover:text-ritual-green transition-colors">
            MindVault
          </Link>
          {hasHarness && (
            <span className="font-mono text-[10px] text-ritual-green/60 border border-ritual-green/20
                             bg-ritual-green/5 px-2 py-0.5 rounded">
              Personal vault
            </span>
          )}
        </div>
        <WalletConnect />
      </nav>

      <div className="flex-1 max-w-2xl w-full mx-auto px-6 py-10 space-y-6">

        {/* Header */}
        <div className="space-y-1">
          <h1 className="font-display text-2xl text-gray-100" style={{ letterSpacing: '-0.01em' }}>
            Session History
          </h1>
          <p className="font-body text-sm text-gray-400">
            All sessions are stored on Ritual Chain.
            Agent outputs are DKMS-encrypted — only decryptable by the executor on your behalf.
          </p>
        </div>

        <div className="divider-green" />

        {/* Not connected */}
        {!isConnected && (
          <div className="p-8 rounded-xl border border-vault-border bg-ritual-elevated text-center space-y-4">
            <p className="font-body text-sm text-gray-400">Connect your wallet to view sessions.</p>
            <WalletConnect />
          </div>
        )}

        {/* Loading */}
        {isConnected && loadingIds && (
          <div className="flex items-center gap-2 font-mono text-xs text-gray-500">
            <span className="animate-ping inline-block w-1.5 h-1.5 rounded-full bg-ritual-green/50" />
            Loading sessions…
          </div>
        )}

        {/* Empty */}
        {isConnected && !loadingIds && sessionIds.length === 0 && (
          <div className="p-8 rounded-xl border border-vault-border bg-ritual-elevated text-center space-y-4">
            <p className="font-mono text-xs text-gray-500">No sessions found for this wallet.</p>
            <Link
              href="/chat"
              className="inline-block px-5 py-2.5 rounded-lg border border-ritual-green
                         text-ritual-green font-body font-semibold text-sm
                         hover:bg-ritual-green/10 transition-colors focus-ritual"
            >
              Start a session
            </Link>
          </div>
        )}

        {/* Session list */}
        {isConnected && !loadingIds && sessionIds.length > 0 && (
          <div className="space-y-3">
            {sessionIds.map((id) => (
              <SessionCard key={id} sessionId={id} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
