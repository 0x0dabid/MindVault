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
    <aside className="w-56 shrink-0 flex flex-col border-r border-vault-border bg-vault-surface h-full">
      <div className="p-4 border-b border-vault-border">
        <h2 className="font-serif text-sm text-vault-text mb-3">Sessions</h2>
        <button
          onClick={onNewSession}
          className="w-full py-2 rounded-lg border border-vault-teal/30 bg-vault-teal/10 text-vault-teal font-mono text-xs hover:bg-vault-teal/20 transition-colors"
        >
          + New session
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-2">
        {loadingIds && (
          <div className="font-mono text-xs text-vault-muted text-center py-4">Loading…</div>
        )}
        {!loadingIds && sessionIds.length === 0 && (
          <div className="font-mono text-xs text-vault-muted text-center py-4 px-2">
            No sessions yet. Start a new conversation.
          </div>
        )}
        {sessionIds.map((id) => (
          <button
            key={id}
            onClick={() => onSelectSession(id)}
            className={`
              w-full text-left px-3 py-2 rounded-lg mb-1 font-mono text-xs transition-colors
              ${activeSessionId === id
                ? 'bg-vault-teal/15 border border-vault-teal/25 text-vault-teal'
                : 'text-vault-muted hover:bg-vault-border/50 hover:text-vault-text border border-transparent'
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
