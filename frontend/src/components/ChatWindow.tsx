'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import { useAccount, useWaitForTransactionReceipt } from 'wagmi';
import { keccak256, encodePacked } from 'viem';
import { MessageBubble, Message } from './MessageBubble';
import { TxStateIndicator } from './TxStateIndicator';
import { SessionList } from './SessionList';
import { ChainGuard } from './ChainGuard';
import { useMindVault } from '@/hooks/useMindVault';
import { useEncryption } from '@/hooks/useEncryption';
import { useAgentResponse } from '@/hooks/useAgentResponse';
import { useExecutor } from '@/hooks/useExecutor';
import { encodeSovereignAgentInput } from '@/lib/sovereign-agent';

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

  const { status, sendMessage, onCommitted, onProcessing, onPendingSettlement, onSettled, onFailed, reset } = useMindVault();
  const { encrypt, decrypt, keysReady, deriveKeys, derivedPublicKey } = useEncryption();
  const { executor } = useExecutor();

  const { isSuccess: txConfirmed } = useWaitForTransactionReceipt({ hash: pendingTxHash });

  useEffect(() => {
    if (txConfirmed) {
      onCommitted();
      onProcessing();
    }
  }, [txConfirmed, onCommitted, onProcessing]);

  useAgentResponse(activeSessionId ?? undefined, async (event) => {
    onPendingSettlement();

    const placeholderId = newId();
    setMessages((prev) => [
      ...prev,
      { id: placeholderId, role: 'agent', content: '', status: 'decrypting', timestamp: Date.now() },
    ]);

    try {
      // If derivedPublicKey was passed to the agent, response text is ECIES-encrypted
      let content = event.text;
      if (!event.success) {
        content = `[Agent error: ${event.error || 'unknown'}]`;
      } else if (derivedPublicKey && event.text.startsWith('0x')) {
        content = await decrypt(event.text);
      }
      setMessages((prev) =>
        prev.map((m) => (m.id === placeholderId ? { ...m, content, status: 'ready' } : m)),
      );
      onSettled();
    } catch {
      setMessages((prev) =>
        prev.map((m) =>
          m.id === placeholderId
            ? { ...m, content: 'Failed to decrypt response.', status: 'error' }
            : m,
        ),
      );
      onFailed('Decrypt failed');
    }
  });

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const startNewSession = useCallback(() => {
    if (!address) return;
    const id = keccak256(encodePacked(['address', 'uint256'], [address, BigInt(sessionIndex)]));
    setActiveSessionId(id);
    setSessionIndex((i) => i + 1);
    setMessages([]);
    reset();
  }, [address, sessionIndex, reset]);

  const handleSend = useCallback(async () => {
    const text = input.trim();
    if (!text || !isConnected || !address || !activeSessionId) return;
    if (!executor) {
      alert('No executor available — TEEServiceRegistry returned no valid nodes.');
      return;
    }

    setInput('');

    const userMsgId = newId();
    setMessages((prev) => [
      ...prev,
      { id: userMsgId, role: 'user', content: text, status: 'sending', timestamp: Date.now() },
    ]);

    try {
      if (!keysReady) await deriveKeys();

      // Encrypt secrets server-side (12-byte ECIES nonce) and resolve DA refs.
      // The /api/secrets route encrypts {"LLM_PROVIDER":"ritual",...} to the executor's
      // public key using eciesjs with the mandatory 12-byte AES-GCM nonce.
      const secretsRes = await fetch('/api/secrets', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          executorPublicKey: executor.publicKey,
          sessionId: activeSessionId,
        }),
      });
      if (!secretsRes.ok) {
        throw new Error(`Secrets API error ${secretsRes.status}`);
      }
      const { encryptedSecrets, convoHistoryRef } = await secretsRes.json();

      // Build sovereign agent input — frontend encodes full 23-field ABI
      const agentInput = encodeSovereignAgentInput({
        executor: executor.teeAddress,
        userPublicKey: derivedPublicKey ? `0x${derivedPublicKey}` : '0x',
        prompt: text,
        encryptedSecrets,
        convoHistoryRef,
        systemPromptRef: ['', '', ''],
      });

      setMessages((prev) =>
        prev.map((m) => (m.id === userMsgId ? { ...m, status: 'delivered' } : m)),
      );

      const hash = await sendMessage(activeSessionId, agentInput);
      setPendingTxHash(hash);
    } catch (err: any) {
      setMessages((prev) =>
        prev.map((m) =>
          m.id === userMsgId ? { ...m, content: text, status: 'error' } : m,
        ),
      );
      onFailed(err?.message ?? 'Send failed');
    }
  }, [
    input, isConnected, address, activeSessionId, executor,
    keysReady, deriveKeys, derivedPublicKey, sendMessage, onFailed,
  ]);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
      if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        handleSend();
      }
    },
    [handleSend],
  );

  const isBusy = !['IDLE', 'SETTLED', 'FAILED', 'EXPIRED'].includes(status);

  return (
    <ChainGuard>
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
                  {!executor && (
                    <p className="font-mono text-amber-400 text-xs">
                      Warning: no executor found in TEEServiceRegistry
                    </p>
                  )}
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
            <TxStateIndicator state={status} />
            <div className="flex items-end gap-3">
              <textarea
                rows={1}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                disabled={!activeSessionId || isBusy}
                placeholder={
                  !activeSessionId
                    ? 'Select or start a session first'
                    : !executor
                    ? 'No executor available…'
                    : 'Share what\'s on your mind…'
                }
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
                disabled={!input.trim() || !activeSessionId || isBusy || !executor}
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
    </ChainGuard>
  );
}
