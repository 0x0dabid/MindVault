'use client';

import { useWatchContractEvent } from 'wagmi';
import { useCallback, useRef } from 'react';
import { MINDVAULT_ROUTER_ADDRESS, MINDVAULT_ROUTER_ABI } from '@/lib/contracts';

export interface AgentResponseEvent {
  user: `0x${string}`;
  sessionId: `0x${string}`;
  encryptedResponse: `0x${string}`;
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
        const { user, sessionId: logSessionId, encryptedResponse } = log.args;
        if (!sessionId || logSessionId === sessionId) {
          onResponseRef.current({ user, sessionId: logSessionId, encryptedResponse });
        }
      }
    },
    [sessionId],
  );

  useWatchContractEvent({
    address: MINDVAULT_ROUTER_ADDRESS,
    abi: MINDVAULT_ROUTER_ABI,
    eventName: 'ResponseReceived',
    args: sessionId ? { sessionId } : undefined,
    onLogs: handleLogs,
    enabled: !!sessionId,
  });
}
