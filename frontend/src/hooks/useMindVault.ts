'use client';

import { useState, useCallback } from 'react';
import { useSendTransaction, useAccount } from 'wagmi';
import { encodeFunctionData } from 'viem';
import { MINDVAULT_ROUTER_ADDRESS, MINDVAULT_ROUTER_ABI } from '@/lib/contracts';

// Harness and router share the same sendMessage ABI — harness is just a per-user deploy.
const SEND_MESSAGE_ABI = MINDVAULT_ROUTER_ABI;

// Canonical async TX states from ritual-dapp-frontend skill.
// writeContractAsync CANNOT be used here — it runs eth_call simulation which
// fails on any function that internally calls an async precompile.
// useSendTransaction + encodeFunctionData skips simulation entirely.
export type AsyncTxStatus =
  | 'IDLE'
  | 'SUBMITTING'
  | 'PENDING_COMMITMENT'
  | 'COMMITTED'
  | 'EXECUTOR_PROCESSING'
  | 'RESULT_READY'
  | 'PENDING_SETTLEMENT'
  | 'SETTLED'
  | 'FAILED'
  | 'EXPIRED';

// contractAddress: pass user's harness address if deployed; falls back to shared router.
export function useMindVault(contractAddress?: `0x${string}`) {
  const { address } = useAccount();
  const [status, setStatus] = useState<AsyncTxStatus>('IDLE');
  const [txHash, setTxHash] = useState<`0x${string}` | null>(null);
  const [error, setError] = useState<string | null>(null);

  const { sendTransactionAsync } = useSendTransaction();

  const target = contractAddress ?? MINDVAULT_ROUTER_ADDRESS;

  const sendMessage = useCallback(
    async (sessionId: `0x${string}`, agentInput: `0x${string}`) => {
      if (!address) throw new Error('Wallet not connected');

      setStatus('SUBMITTING');
      setError(null);

      try {
        // encodeFunctionData + sendTransaction skips wagmi's simulateContract,
        // which would fail with "call to non-contract address" on the precompile.
        const data = encodeFunctionData({
          abi: SEND_MESSAGE_ABI,
          functionName: 'sendMessage',
          args: [sessionId, agentInput],
        });

        const hash = await sendTransactionAsync({
          to: target,
          data,
          gas: 2_000_000n,
        });

        setTxHash(hash);
        setStatus('PENDING_COMMITMENT');
        return hash;
      } catch (err: any) {
        setStatus('FAILED');
        setError(err?.message ?? 'Transaction failed');
        throw err;
      }
    },
    [address, sendTransactionAsync],
  );

  // State transition helpers — called by consumers as lifecycle events arrive
  const onCommitted  = useCallback(() => setStatus('COMMITTED'), []);
  const onProcessing = useCallback(() => setStatus('EXECUTOR_PROCESSING'), []);
  const onResultReady = useCallback(() => setStatus('RESULT_READY'), []);
  const onPendingSettlement = useCallback(() => setStatus('PENDING_SETTLEMENT'), []);
  const onSettled   = useCallback(() => setStatus('SETTLED'), []);
  const onFailed    = useCallback((msg: string) => { setStatus('FAILED'); setError(msg); }, []);
  const onExpired   = useCallback(() => setStatus('EXPIRED'), []);
  const reset       = useCallback(() => { setStatus('IDLE'); setTxHash(null); setError(null); }, []);

  return {
    status,
    txHash,
    error,
    isIdle: status === 'IDLE',
    isBusy: !['IDLE', 'SETTLED', 'FAILED', 'EXPIRED'].includes(status),
    sendMessage,
    onCommitted,
    onProcessing,
    onResultReady,
    onPendingSettlement,
    onSettled,
    onFailed,
    onExpired,
    reset,
  };
}
