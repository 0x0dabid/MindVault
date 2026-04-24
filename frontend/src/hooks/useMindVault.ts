'use client';

import { useState, useCallback } from 'react';
import { useWriteContract, useWaitForTransactionReceipt, useAccount } from 'wagmi';
import { MINDVAULT_ROUTER_ADDRESS, MINDVAULT_ROUTER_ABI } from '@/lib/contracts';

export type TxState =
  | 'IDLE'
  | 'ENCRYPTING'
  | 'SUBMITTING'
  | 'PENDING'
  | 'CONFIRMED'
  | 'PROCESSING'
  | 'CALLBACK_RECEIVED'
  | 'DECRYPTING'
  | 'COMPLETE'
  | 'TX_FAILED'
  | 'AGENT_TIMEOUT'
  | 'DECRYPT_FAILED';

export function useMindVault() {
  const { address } = useAccount();
  const [txState, setTxState] = useState<TxState>('IDLE');
  const [currentJobId, setCurrentJobId] = useState<`0x${string}` | null>(null);

  const { writeContractAsync } = useWriteContract();

  const sendEncryptedMessage = useCallback(
    async (sessionId: `0x${string}`, encryptedPayload: `0x${string}`) => {
      if (!address) throw new Error('Wallet not connected');

      setTxState('SUBMITTING');
      try {
        const hash = await writeContractAsync({
          address: MINDVAULT_ROUTER_ADDRESS,
          abi: MINDVAULT_ROUTER_ABI,
          functionName: 'sendMessage',
          args: [sessionId, encryptedPayload],
        });

        setTxState('PENDING');
        return hash;
      } catch (err) {
        setTxState('TX_FAILED');
        throw err;
      }
    },
    [address, writeContractAsync],
  );

  const onTxConfirmed = useCallback(() => setTxState('CONFIRMED'), []);
  const onAgentProcessing = useCallback(() => setTxState('PROCESSING'), []);
  const onCallbackReceived = useCallback((jobId: `0x${string}`) => {
    setCurrentJobId(jobId);
    setTxState('CALLBACK_RECEIVED');
  }, []);
  const onDecrypting = useCallback(() => setTxState('DECRYPTING'), []);
  const onComplete = useCallback(() => setTxState('COMPLETE'), []);
  const onDecryptFailed = useCallback(() => setTxState('DECRYPT_FAILED'), []);
  const onTimeout = useCallback(() => setTxState('AGENT_TIMEOUT'), []);
  const reset = useCallback(() => {
    setTxState('IDLE');
    setCurrentJobId(null);
  }, []);

  return {
    txState,
    currentJobId,
    sendEncryptedMessage,
    onTxConfirmed,
    onAgentProcessing,
    onCallbackReceived,
    onDecrypting,
    onComplete,
    onDecryptFailed,
    onTimeout,
    reset,
  };
}
