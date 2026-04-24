'use client';

import { EncryptionBadge } from './EncryptionBadge';

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

export function MessageBubble({ message }: MessageBubbleProps) {
  const isUser = message.role === 'user';

  return (
    <div className={`flex flex-col gap-1 animate-slide-up ${isUser ? 'items-end' : 'items-start'}`}>
      <div
        className={`
          max-w-[75%] rounded-2xl px-4 py-3 text-sm leading-relaxed
          ${isUser
            ? 'bg-vault-teal/15 border border-vault-teal/20 text-vault-text rounded-tr-sm'
            : 'bg-vault-surface border border-vault-border text-vault-text rounded-tl-sm'
          }
          ${message.status === 'decrypting' ? 'opacity-60 animate-pulse' : ''}
          ${message.status === 'error' ? 'border-red-500/30 bg-red-950/20' : ''}
        `}
      >
        {message.status === 'decrypting' ? (
          <span className="font-mono text-xs text-vault-muted">Decrypting…</span>
        ) : message.status === 'sending' ? (
          <span className="font-mono text-xs text-vault-muted">Encrypting &amp; sending…</span>
        ) : (
          message.content
        )}
      </div>
      <div className="flex items-center gap-3 px-1">
        <span className="font-mono text-[10px] text-vault-muted">
          {new Date(message.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
        </span>
        <EncryptionBadge />
      </div>
    </div>
  );
}
