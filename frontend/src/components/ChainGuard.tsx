'use client';

import { useAccount, useSwitchChain } from 'wagmi';
import { ritualChain } from '@/lib/ritual-chain';

export function ChainGuard({ children }: { children: React.ReactNode }) {
  const { chain, isConnected } = useAccount();
  const { switchChain, isPending } = useSwitchChain();

  if (isConnected && chain?.id !== ritualChain.id) {
    return (
      <div className="flex items-center justify-center h-full py-12" role="alert">
        <div className="text-center space-y-4 p-8 rounded-xl border border-vault-border bg-ritual-elevated max-w-sm">
          <p className="font-mono text-xs text-gray-500 uppercase tracking-widest">Wrong Network</p>
          <p className="font-body text-sm text-gray-300">
            Connected to <strong className="text-ritual-gold">{chain?.name ?? 'unknown'}</strong>.
            MindVault runs on Ritual Chain (ID&nbsp;1979).
          </p>
          <button
            onClick={() => switchChain({ chainId: ritualChain.id })}
            disabled={isPending}
            className="w-full px-4 py-2.5 rounded-lg border border-ritual-green text-ritual-green
                       font-body font-semibold text-sm hover:bg-ritual-green/10
                       disabled:opacity-50 transition-colors focus-ritual"
          >
            {isPending ? 'Switching…' : 'Switch to Ritual Chain'}
          </button>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
