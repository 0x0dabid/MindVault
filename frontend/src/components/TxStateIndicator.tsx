'use client';

import type { AsyncTxStatus } from '@/hooks/useMindVault';

// 9-state async lifecycle — icons and colors from ritual-dapp-design skill.
// Pink = AI/agent processing. Gold = pending/waiting. Green = settled/done.
const STATE_CONFIG: Record<
  AsyncTxStatus,
  { label: string; icon: string; color: string; pulse: boolean }
> = {
  IDLE:                { label: '',                                     icon: '',  color: '',                     pulse: false },
  SUBMITTING:          { label: 'Awaiting signature…',                  icon: '·', color: 'text-gray-400',        pulse: true  },
  PENDING_COMMITMENT:  { label: 'Awaiting executor…',                   icon: '◌', color: 'text-ritual-gold',     pulse: true  },
  COMMITTED:           { label: 'Committed to executor',                icon: '◉', color: 'text-ritual-gold',     pulse: false },
  EXECUTOR_PROCESSING: { label: 'Agent is thinking…',                   icon: '⟳', color: 'text-ritual-pink',    pulse: true  },
  RESULT_READY:        { label: 'Result ready — settling…',             icon: '◈', color: 'text-ritual-green',    pulse: false },
  PENDING_SETTLEMENT:  { label: 'Delivering response…',                 icon: '◎', color: 'text-ritual-gold',     pulse: false },
  SETTLED:             { label: 'Complete',                             icon: '✓', color: 'text-ritual-green',    pulse: false },
  FAILED:              { label: 'Failed',                               icon: '✗', color: 'text-red-400',         pulse: false },
  EXPIRED:             { label: 'Job expired — retry',                  icon: '⊘', color: 'text-gray-500',        pulse: false },
};

interface TxStateIndicatorProps {
  state: AsyncTxStatus;
}

export function TxStateIndicator({ state }: TxStateIndicatorProps) {
  const cfg = STATE_CONFIG[state];
  if (!cfg.label) return null;

  return (
    <div
      role="status"
      aria-label={`Job status: ${cfg.label}`}
      className={`flex items-center gap-2 font-mono text-xs ${cfg.color}`}
    >
      {cfg.pulse ? (
        <span className="relative flex h-2 w-2 shrink-0" aria-hidden="true">
          <span className="animate-ping absolute inset-0 rounded-full bg-current opacity-50" />
          <span className="relative rounded-full h-2 w-2 bg-current" />
        </span>
      ) : (
        <span className="shrink-0 leading-none" aria-hidden="true">{cfg.icon}</span>
      )}
      <span>{cfg.label}</span>
    </div>
  );
}
