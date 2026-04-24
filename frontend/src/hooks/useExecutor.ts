'use client';

import { useReadContract } from 'wagmi';

// TEEServiceRegistry — HTTP_CALL capability (0) covers both Persistent and Sovereign agents
const TEE_REGISTRY = '0x9644e8562cE0Fe12b4deeC4163c064A8862Bf47F' as const;
const HTTP_CALL_CAPABILITY = 0;

const TEE_REGISTRY_ABI = [
  {
    type: 'function',
    name: 'getServicesByCapability',
    inputs: [
      { name: 'capability', type: 'uint8' },
      { name: 'checkValidity', type: 'bool' },
    ],
    outputs: [
      {
        name: '',
        type: 'tuple[]',
        components: [
          {
            name: 'node',
            type: 'tuple',
            components: [
              { name: 'paymentAddress', type: 'address' },
              { name: 'teeAddress', type: 'address' },
              { name: 'teeType', type: 'uint8' },
              { name: 'publicKey', type: 'bytes' },
              { name: 'endpoint', type: 'string' },
              { name: 'certPubKeyHash', type: 'bytes32' },
              { name: 'capability', type: 'uint8' },
            ],
          },
          { name: 'isValid', type: 'bool' },
          { name: 'workloadId', type: 'bytes32' },
        ],
      },
    ],
    stateMutability: 'view',
  },
] as const;

export interface ExecutorInfo {
  teeAddress: `0x${string}`;
  publicKey: `0x${string}`;
  isValid: boolean;
}

export function useExecutor() {
  const { data, isLoading, error } = useReadContract({
    address: TEE_REGISTRY,
    abi: TEE_REGISTRY_ABI,
    functionName: 'getServicesByCapability',
    args: [HTTP_CALL_CAPABILITY, true],
  });

  const executors: ExecutorInfo[] = (data ?? [])
    .filter((ctx: any) => ctx.isValid)
    .map((ctx: any) => ({
      teeAddress: ctx.node.teeAddress as `0x${string}`,
      publicKey: ctx.node.publicKey as `0x${string}`,
      isValid: ctx.isValid,
    }));

  // Pick a pseudo-random executor each render (not stored — re-selected on each send)
  const executor = executors.length > 0
    ? executors[Math.floor(Math.random() * executors.length)]
    : null;

  return { executor, executors, isLoading, error };
}
