'use client';

import { useAccount, useSwitchChain } from 'wagmi';
import { ritualChain } from '@/lib/ritual-chain';

export function ChainGuard({ children }: { children: React.ReactNode }) {
  const { chain, isConnected } = useAccount();
  const { switchChain, isPending } = useSwitchChain();

  if (isConnected && chain?.id !== ritualChain.id) {
    return (
      <div className="flex items-center justify-center h-full py-12">
        <div className="text-center space-y-4">
          <p className="font-mono text-sm text-vault-muted">
            Connected to <strong className="text-red-400">{chain?.name ?? 'unknown network'}</strong>
          </p>
          <button
            onClick={() => switchChain({ chainId: ritualChain.id })}
            disabled={isPending}
            className="
              px-4 py-2 rounded-lg border border-amber-500/40 bg-amber-500/10
              text-amber-400 font-mono text-sm
              hover:bg-amber-500/20 disabled:opacity-50 transition-colors
            "
          >
            {isPending ? 'Switching…' : 'Switch to Ritual Chain'}
          </button>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
