'use client';

import { useReadContract } from 'wagmi';
import { useAccount } from 'wagmi';
import { MINDVAULT_ROUTER_ADDRESS, MINDVAULT_ROUTER_ABI } from '@/lib/contracts';

export interface SessionMeta {
  sessionId: `0x${string}`;
  user: `0x${string}`;
  startedAt: bigint;
  messageCount: bigint;
  latestJobId: `0x${string}`;
}

export function useSessionHistory() {
  const { address } = useAccount();

  const { data: sessionIds, isLoading: loadingIds, refetch } = useReadContract({
    address: MINDVAULT_ROUTER_ADDRESS,
    abi: MINDVAULT_ROUTER_ABI,
    functionName: 'getUserSessions',
    args: address ? [address] : undefined,
    query: { enabled: !!address },
  });

  return {
    sessionIds: (sessionIds ?? []) as `0x${string}`[],
    loadingIds,
    refetch,
  };
}

export function useSessionMeta(sessionId: `0x${string}` | undefined) {
  const { data, isLoading } = useReadContract({
    address: MINDVAULT_ROUTER_ADDRESS,
    abi: MINDVAULT_ROUTER_ABI,
    functionName: 'getSession',
    args: sessionId ? [sessionId] : undefined,
    query: { enabled: !!sessionId },
  });

  return {
    meta: data as SessionMeta | undefined,
    isLoading,
  };
}
