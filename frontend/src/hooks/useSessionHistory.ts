'use client';

import { useReadContract } from 'wagmi';
import { useAccount } from 'wagmi';
import {
  MINDVAULT_ROUTER_ADDRESS,
  MINDVAULT_ROUTER_ABI,
  MINDVAULT_HARNESS_SESSION_ABI,
} from '@/lib/contracts';
import { useHarness } from '@/hooks/useHarness';

export interface SessionMeta {
  sessionId: `0x${string}`;
  startedAt: bigint;
  messageCount: bigint;
  latestJobId: `0x${string}`;
}

// Read all session IDs for the connected user.
// If the user has deployed a harness, sessions live there; otherwise fall back to shared router.
export function useSessionHistory() {
  const { address } = useAccount();
  const { harnessAddress, hasHarness } = useHarness();

  // Harness path: getSessionIds() — no address arg (single-owner contract)
  const { data: harnessIds, isLoading: loadingHarness, refetch: refetchHarness } = useReadContract({
    address: harnessAddress,
    abi: MINDVAULT_HARNESS_SESSION_ABI,
    functionName: 'getSessionIds',
    query: { enabled: hasHarness && !!harnessAddress },
  });

  // Router path: getUserSessions(address) — fallback
  const { data: routerIds, isLoading: loadingRouter, refetch: refetchRouter } = useReadContract({
    address: MINDVAULT_ROUTER_ADDRESS,
    abi: MINDVAULT_ROUTER_ABI,
    functionName: 'getUserSessions',
    args: address ? [address] : undefined,
    query: { enabled: !hasHarness && !!address },
  });

  const sessionIds = ((hasHarness ? harnessIds : routerIds) ?? []) as `0x${string}`[];
  const loadingIds = hasHarness ? loadingHarness : loadingRouter;
  const refetch    = hasHarness ? refetchHarness : refetchRouter;

  return { sessionIds, loadingIds, refetch };
}

// Read metadata for a single session, routing to harness or router as appropriate.
export function useSessionMeta(sessionId: `0x${string}` | undefined) {
  const { harnessAddress, hasHarness } = useHarness();

  // Harness: SessionMeta has no user field
  const { data: harnessData, isLoading: loadingH } = useReadContract({
    address: harnessAddress,
    abi: MINDVAULT_HARNESS_SESSION_ABI,
    functionName: 'getSession',
    args: sessionId ? [sessionId] : undefined,
    query: { enabled: hasHarness && !!harnessAddress && !!sessionId },
  });

  // Router: SessionMeta includes user field
  const { data: routerData, isLoading: loadingR } = useReadContract({
    address: MINDVAULT_ROUTER_ADDRESS,
    abi: MINDVAULT_ROUTER_ABI,
    functionName: 'getSession',
    args: sessionId ? [sessionId] : undefined,
    query: { enabled: !hasHarness && !!sessionId },
  });

  const raw = hasHarness ? harnessData : routerData;
  const meta: SessionMeta | undefined = raw && sessionId
    ? {
        sessionId,
        startedAt:    (raw as any).startedAt    ?? 0n,
        messageCount: (raw as any).messageCount ?? 0n,
        latestJobId:  (raw as any).latestJobId  ?? ('0x' + '0'.repeat(64) as `0x${string}`),
      }
    : undefined;

  return { meta, isLoading: hasHarness ? loadingH : loadingR };
}
