'use client';

export type MessageRole = 'user' | 'agent';
export type MessageStatus = 'sending' | 'delivered' | 'decrypting' | 'ready' | 'error';

export interface Message {
  id: string;
  role: MessageRole;
  content: string;
  status: MessageStatus;
  timestamp: number;
}

interface MessageBubbleProps {
  message: Message;
}

// Agent responses get pink top-border (AI output treatment — ritual-dapp-design skill).
// User messages get teal border with encryption indicator.
export function MessageBubble({ message }: MessageBubbleProps) {
  const isUser = message.role === 'user';

  return (
    <div className={`flex flex-col gap-1.5 animate-slide-up ${isUser ? 'items-end' : 'items-start'}`}>
      {/* AI output label — pink for agent, per design skill */}
      {!isUser && (
        <div className="flex items-center gap-1.5 px-1">
          <span className="text-ritual-pink text-[10px]" aria-hidden="true">◇</span>
          <span className="font-mono text-[10px] text-gray-500 uppercase tracking-wider">AI Output</span>
          <span className="font-mono text-[10px] text-ritual-green/70">▣ TEE verified</span>
        </div>
      )}

      <div
        className={`
          max-w-[78%] rounded-xl px-4 py-3 text-sm leading-relaxed font-body
          ${isUser
            ? 'bg-vault-surface border border-vault-teal/20 text-gray-200 rounded-tr-sm'
            : 'bg-ritual-elevated border-t-2 border-ritual-pink/30 border-x border-b border-vault-border text-gray-300 rounded-tl-sm'
          }
          ${message.status === 'decrypting' ? 'opacity-60 animate-pulse' : ''}
          ${message.status === 'error' ? '!border-red-500/30 bg-red-950/20' : ''}
        `}
      >
        {message.status === 'decrypting' ? (
          <span className="font-mono text-xs text-gray-500 italic">Decrypting…</span>
        ) : message.status === 'sending' ? (
          <span className="font-mono text-xs text-gray-500 italic">Encrypting &amp; sending…</span>
        ) : (
          <span className="whitespace-pre-wrap">{message.content}</span>
        )}
      </div>

      {/* Timestamp + encryption badge */}
      <div className="flex items-center gap-3 px-1">
        <time
          dateTime={new Date(message.timestamp).toISOString()}
          className="font-mono text-[10px] text-gray-600"
        >
          {new Date(message.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
        </time>
        {isUser ? (
          <span className="font-mono text-[10px] text-gray-600 flex items-center gap-1">
            <LockIcon />
            ECIES encrypted
          </span>
        ) : (
          <span className="font-mono text-[10px] text-ritual-green/60 flex items-center gap-1">
            <span aria-hidden="true">◈</span>
            TEE-verified output
          </span>
        )}
      </div>
    </div>
  );
}

function LockIcon() {
  return (
    <svg width="8" height="10" viewBox="0 0 10 12" fill="none" aria-hidden="true" className="text-gray-600">
      <rect x="1" y="5" width="8" height="7" rx="1.5" stroke="currentColor" strokeWidth="1.5" />
      <path d="M3 5V3.5a2 2 0 1 1 4 0V5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  );
}
