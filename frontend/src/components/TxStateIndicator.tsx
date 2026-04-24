'use client';

import { TxState } from '@/hooks/useMindVault';

const STATE_CONFIG: Record<TxState, { label: string; color: string; pulse?: boolean }> = {
  IDLE: { label: '', color: '' },
  ENCRYPTING: { label: 'Encrypting message…', color: 'text-vault-teal', pulse: true },
  SUBMITTING: { label: 'Awaiting wallet signature…', color: 'text-vault-teal', pulse: true },
  PENDING: { label: 'Transaction submitted…', color: 'text-blue-400', pulse: true },
  CONFIRMED: { label: 'Transaction confirmed', color: 'text-green-400' },
  PROCESSING: { label: 'Agent is thinking…', color: 'text-vault-teal', pulse: true },
  CALLBACK_RECEIVED: { label: 'Response received', color: 'text-green-400' },
  DECRYPTING: { label: 'Decrypting response…', color: 'text-vault-teal', pulse: true },
  COMPLETE: { label: 'Complete', color: 'text-green-400' },
  TX_FAILED: { label: 'Transaction failed', color: 'text-red-400' },
  AGENT_TIMEOUT: { label: 'Agent timed out — please retry', color: 'text-orange-400' },
  DECRYPT_FAILED: { label: 'Decryption failed', color: 'text-red-400' },
};

interface TxStateIndicatorProps {
  state: TxState;
}

export function TxStateIndicator({ state }: TxStateIndicatorProps) {
  const config = STATE_CONFIG[state];
  if (!config.label) return null;

  return (
    <div className={`flex items-center gap-2 font-mono text-xs ${config.color}`}>
      {config.pulse && (
        <span className="relative flex h-2 w-2">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-current opacity-60" />
          <span className="relative inline-flex rounded-full h-2 w-2 bg-current" />
        </span>
      )}
      {!config.pulse && (
        <span className="h-2 w-2 rounded-full bg-current" />
      )}
      {config.label}
    </div>
  );
}
