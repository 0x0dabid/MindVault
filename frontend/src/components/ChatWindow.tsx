'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import { useAccount, useWaitForTransactionReceipt } from 'wagmi';
import { keccak256, encodePacked } from 'viem';
import { MessageBubble, Message } from './MessageBubble';
import { TxStateIndicator } from './TxStateIndicator';
import { SessionList } from './SessionList';
import { useMindVault } from '@/hooks/useMindVault';
import { useEncryption } from '@/hooks/useEncryption';
import { useAgentResponse } from '@/hooks/useAgentResponse';

let messageCounter = 0;
function newId() {
  return `msg-${++messageCounter}`;
}

export function ChatWindow() {
  const { address, isConnected } = useAccount();
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [activeSessionId, setActiveSessionId] = useState<`0x${string}` | null>(null);
  const [sessionIndex, setSessionIndex] = useState(0);
  const [pendingTxHash, setPendingTxHash] = useState<`0x${string}` | undefined>();
  const bottomRef = useRef<HTMLDivElement>(null);

  const { txState, sendEncryptedMessage, onTxConfirmed, onAgentProcessing, onCallbackReceived, onDecrypting, onComplete, onDecryptFailed, reset } = useMindVault();
  const { encrypt, decrypt, keysReady, deriveKeys } = useEncryption();

  const { isSuccess: txConfirmed } = useWaitForTransactionReceipt({ hash: pendingTxHash });

  useEffect(() => {
    if (txConfirmed) {
      onTxConfirmed();
      onAgentProcessing();
    }
  }, [txConfirmed, onTxConfirmed, onAgentProcessing]);

  useAgentResponse(activeSessionId ?? undefined, async (event) => {
    onCallbackReceived(event.encryptedResponse as `0x${string}`);
    onDecrypting();

    const placeholderId = newId();
    setMessages((prev) => [
      ...prev,
      { id: placeholderId, role: 'agent', content: '', status: 'decrypting', timestamp: Date.now() },
    ]);

    try {
      const content = await decrypt(event.encryptedResponse);
      setMessages((prev) =>
        prev.map((m) => (m.id === placeholderId ? { ...m, content, status: 'ready' } : m)),
      );
      onComplete();
    } catch {
      setMessages((prev) =>
        prev.map((m) =>
          m.id === placeholderId ? { ...m, content: 'Failed to decrypt response.', status: 'error' } : m,
        ),
      );
      onDecryptFailed();
    }
  });

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const startNewSession = useCallback(() => {
    if (!address) return;
    const idx = sessionIndex;
    const id = keccak256(encodePacked(['address', 'uint256'], [address, BigInt(idx)]));
    setActiveSessionId(id);
    setSessionIndex((i) => i + 1);
    setMessages([]);
    reset();
  }, [address, sessionIndex, reset]);

  const handleSend = useCallback(async () => {
    const text = input.trim();
    if (!text || !isConnected || !address) return;
    if (!activeSessionId) return;

    setInput('');

    const userMsgId = newId();
    setMessages((prev) => [
      ...prev,
      { id: userMsgId, role: 'user', content: text, status: 'sending', timestamp: Date.now() },
    ]);

    try {
      if (!keysReady) await deriveKeys();
      const encrypted = await encrypt(text);

      setMessages((prev) =>
        prev.map((m) => (m.id === userMsgId ? { ...m, status: 'delivered' } : m)),
      );

      const hash = await sendEncryptedMessage(activeSessionId, encrypted);
      setPendingTxHash(hash);
    } catch (err) {
      setMessages((prev) =>
        prev.map((m) =>
          m.id === userMsgId ? { ...m, content: text, status: 'error' } : m,
        ),
      );
    }
  }, [input, isConnected, address, activeSessionId, keysReady, deriveKeys, encrypt, sendEncryptedMessage]);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
      if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        handleSend();
      }
    },
    [handleSend],
  );

  return (
    <div className="flex h-full">
      <SessionList
        activeSessionId={activeSessionId}
        onSelectSession={(id) => { setActiveSessionId(id); setMessages([]); reset(); }}
        onNewSession={startNewSession}
      />

      <div className="flex-1 flex flex-col min-w-0">
        {/* Messages */}
        <div className="flex-1 overflow-y-auto px-6 py-4 space-y-4">
          {!activeSessionId && (
            <div className="h-full flex items-center justify-center">
              <div className="text-center space-y-2">
                <p className="font-serif text-vault-text/60 text-lg">Your mind, your chain, your keys.</p>
                <p className="font-mono text-vault-muted text-xs">Start a new session to begin.</p>
              </div>
            </div>
          )}
          {messages.map((msg) => (
            <MessageBubble key={msg.id} message={msg} />
          ))}
          <div ref={bottomRef} />
        </div>

        {/* Status + Input */}
        <div className="border-t border-vault-border px-4 py-3 space-y-2 bg-vault-surface/50">
          <TxStateIndicator state={txState} />
          <div className="flex items-end gap-3">
            <textarea
              rows={1}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              disabled={!activeSessionId || txState === 'ENCRYPTING' || txState === 'SUBMITTING' || txState === 'PENDING' || txState === 'PROCESSING'}
              placeholder={activeSessionId ? 'Share what's on your mind…' : 'Select or start a session first'}
              className="
                flex-1 resize-none bg-vault-surface border border-vault-border rounded-xl
                px-4 py-3 text-sm text-vault-text placeholder:text-vault-muted
                focus:outline-none focus:border-vault-teal/50 focus:ring-1 focus:ring-vault-teal/20
                disabled:opacity-40 transition-shadow font-sans
                animate-breathe
              "
              style={{ maxHeight: '120px', overflowY: 'auto', lineHeight: '1.5' }}
            />
            <button
              onClick={handleSend}
              disabled={!input.trim() || !activeSessionId || txState === 'ENCRYPTING' || txState === 'SUBMITTING' || txState === 'PENDING' || txState === 'PROCESSING'}
              className="
                px-4 py-3 rounded-xl bg-vault-teal/15 border border-vault-teal/30
                text-vault-teal font-mono text-sm
                hover:bg-vault-teal/25 disabled:opacity-30 disabled:cursor-not-allowed
                transition-colors shrink-0
              "
            >
              Send
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
