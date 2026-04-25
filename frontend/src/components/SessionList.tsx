'use client';

import { useSessionHistory } from '@/hooks/useSessionHistory';

interface SessionListProps {
  activeSessionId: `0x${string}` | null;
  onSelectSession: (sessionId: `0x${string}`) => void;
  onNewSession: () => void;
}

function truncateHex(hex: string) {
  return `${hex.slice(0, 8)}…${hex.slice(-6)}`;
}

export function SessionList({ activeSessionId, onSelectSession, onNewSession }: SessionListProps) {
  const { sessionIds, loadingIds } = useSessionHistory();

  return (
    <aside className="w-52 shrink-0 flex flex-col border-r border-vault-border bg-ritual-elevated h-full">
      <div className="p-3 border-b border-vault-border space-y-2">
        <p className="font-mono text-[10px] text-gray-500 uppercase tracking-widest px-1">Sessions</p>
        <button
          onClick={onNewSession}
          className="w-full py-2 rounded-lg border border-ritual-green/30 bg-ritual-green/5
                     text-ritual-green font-mono text-xs hover:bg-ritual-green/10
                     transition-colors focus-ritual"
        >
          + New session
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-2 space-y-0.5">
        {loadingIds && (
          <p className="font-mono text-xs text-gray-500 text-center py-6">Loading…</p>
        )}
        {!loadingIds && sessionIds.length === 0 && (
          <p className="font-mono text-xs text-gray-500 text-center py-6 px-2 leading-relaxed">
            No sessions yet.
          </p>
        )}
        {sessionIds.map((id) => (
          <button
            key={id}
            onClick={() => onSelectSession(id)}
            className={`
              w-full text-left px-3 py-2 rounded-lg font-mono text-xs transition-colors focus-ritual
              ${activeSessionId === id
                ? 'bg-ritual-green/10 border border-ritual-green/25 text-ritual-green'
                : 'text-gray-500 hover:bg-ritual-surface hover:text-gray-300 border border-transparent'
              }
            `}
          >
            {truncateHex(id)}
          </button>
        ))}
      </div>
    </aside>
  );
}
