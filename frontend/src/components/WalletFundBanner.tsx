'use client';

import { useState } from 'react';
import { parseEther } from 'viem';
import { useRitualWallet, RECOMMENDED_LOCK_BLOCKS } from '@/hooks/useRitualWallet';

// Shown when the connected EOA has no RITUAL deposited in RitualWallet.
// Per ritual-dapp-wallet skill: the commitment validator checks balanceOf(EOA signer),
// so sending messages will fail silently without this deposit.
export function WalletFundBanner() {
  const { hasBalance, balanceFormatted, deposit } = useRitualWallet();
  const [depositing, setDepositing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (hasBalance) return null;

  const handleDeposit = async () => {
    setDepositing(true);
    setError(null);
    try {
      await deposit(parseEther('2'), RECOMMENDED_LOCK_BLOCKS);
    } catch (err: any) {
      setError(err?.shortMessage ?? err?.message ?? 'Deposit failed');
    } finally {
      setDepositing(false);
    }
  };

  return (
    <div
      role="alert"
      className="mx-4 mt-3 p-3 rounded-xl border border-ritual-gold/30 bg-ritual-gold/5 flex flex-col sm:flex-row items-start sm:items-center gap-3"
    >
      <div className="flex-1 space-y-0.5">
        <p className="font-mono text-xs text-ritual-gold font-semibold">
          ◌ RITUAL balance required
        </p>
        <p className="font-body text-xs text-gray-400">
          Sovereign Agent executions deduct ~0.5–1 RITUAL per message from your wallet.
          Current balance: <span className="font-mono text-gray-300">{Number(balanceFormatted).toFixed(4)} RITUAL</span>
        </p>
        {error && <p className="font-mono text-xs text-red-400">{error}</p>}
      </div>
      <button
        onClick={handleDeposit}
        disabled={depositing}
        className="shrink-0 px-3 py-2 rounded-lg border border-ritual-gold/40 bg-ritual-gold/10
                   text-ritual-gold font-mono text-xs hover:bg-ritual-gold/20
                   disabled:opacity-40 disabled:cursor-not-allowed transition-colors focus-ritual"
      >
        {depositing ? 'Depositing…' : 'Deposit 2 RITUAL'}
      </button>
    </div>
  );
}
