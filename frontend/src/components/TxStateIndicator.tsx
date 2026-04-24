'use client';

import type { AsyncTxStatus } from '@/hooks/useMindVault';

const STATE_CONFIG: Record<AsyncTxStatus, { label: string; color: string; pulse?: boolean }> = {
  IDLE:                { label: '',                                     color: ''                },
  SUBMITTING:          { label: 'Awaiting wallet signature…',           color: 'text-vault-teal', pulse: true  },
  PENDING_COMMITMENT:  { label: 'Transaction submitted…',               color: 'text-blue-400',   pulse: true  },
  COMMITTED:           { label: 'Committed — executor notified',        color: 'text-green-400'               },
  EXECUTOR_PROCESSING: { label: 'Agent is thinking…',                   color: 'text-vault-teal', pulse: true  },
  RESULT_READY:        { label: 'Phase 1 settled — delivering result…', color: 'text-vault-teal', pulse: true  },
  PENDING_SETTLEMENT:  { label: 'Decrypting response…',                 color: 'text-vault-teal', pulse: true  },
  SETTLED:             { label: 'Complete',                             color: 'text-green-400'               },
  FAILED:              { label: 'Failed',                               color: 'text-red-400'                 },
  EXPIRED:             { label: 'Job expired — please retry',           color: 'text-orange-400'              },
};

interface TxStateIndicatorProps {
  state: AsyncTxStatus;
}

export function TxStateIndicator({ state }: TxStateIndicatorProps) {
  const config = STATE_CONFIG[state];
  if (!config.label) return null;

  return (
    <div className={`flex items-center gap-2 font-mono text-xs ${config.color}`}>
      {config.pulse ? (
        <span className="relative flex h-2 w-2">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-current opacity-60" />
          <span className="relative inline-flex rounded-full h-2 w-2 bg-current" />
        </span>
      ) : (
        <span className="h-2 w-2 rounded-full bg-current" />
      )}
      {config.label}
    </div>
  );
}
