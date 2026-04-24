'use client';

import { useWatchContractEvent } from 'wagmi';
import { useCallback, useRef } from 'react';
import { MINDVAULT_ROUTER_ADDRESS, MINDVAULT_ROUTER_ABI } from '@/lib/contracts';

export interface AgentResponseEvent {
  jobId: `0x${string}`;
  sessionId: `0x${string}`;
  success: boolean;
  text: string;    // plaintext response, or ECIES-encrypted if userPublicKey was set
  error: string;
}

export function useAgentResponse(
  sessionId: `0x${string}` | undefined,
  onResponse: (event: AgentResponseEvent) => void,
) {
  const onResponseRef = useRef(onResponse);
  onResponseRef.current = onResponse;

  const handleLogs = useCallback(
    (logs: any[]) => {
      for (const log of logs) {
        const { jobId, sessionId: logSessionId, success, text, error } = log.args;
        if (!sessionId || logSessionId === sessionId) {
          onResponseRef.current({ jobId, sessionId: logSessionId, success, text, error });
        }
      }
    },
    [sessionId],
  );

  useWatchContractEvent({
    address: MINDVAULT_ROUTER_ADDRESS,
    abi: MINDVAULT_ROUTER_ABI,
    eventName: 'AgentResponse',
    args: sessionId ? { sessionId } : undefined,
    onLogs: handleLogs,
    enabled: !!sessionId,
  });
}
