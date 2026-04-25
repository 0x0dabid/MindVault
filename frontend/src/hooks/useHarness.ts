'use client';

import { useReadContract, useSendTransaction } from 'wagmi';
import { useAccount } from 'wagmi';
import { encodeFunctionData } from 'viem';
import { MINDVAULT_FACTORY_ADDRESS, MINDVAULT_FACTORY_ABI } from '@/lib/contracts';

const ZERO_ADDRESS = '0x0000000000000000000000000000000000000000';
const factoryDeployed = MINDVAULT_FACTORY_ADDRESS !== ZERO_ADDRESS;

export function useHarness() {
  const { address } = useAccount();
  const { sendTransactionAsync, isPending } = useSendTransaction();

  const { data: harnessAddress, refetch, isLoading } = useReadContract({
    address: MINDVAULT_FACTORY_ADDRESS,
    abi: MINDVAULT_FACTORY_ABI,
    functionName: 'harnessOf',
    args: [address!],
    query: { enabled: !!address && factoryDeployed },
  });

  const hasHarness =
    !!harnessAddress && harnessAddress !== ZERO_ADDRESS;

  const deployHarness = async () => {
    const data = encodeFunctionData({
      abi: MINDVAULT_FACTORY_ABI,
      functionName: 'deploy',
      args: [],
    });
    const hash = await sendTransactionAsync({
      to: MINDVAULT_FACTORY_ADDRESS,
      data,
      gas: 600_000n,
    });
    // Refetch after tx lands — caller should also wait for receipt
    await refetch();
    return hash;
  };

  return {
    // Harness address if deployed, undefined otherwise
    harnessAddress: hasHarness ? (harnessAddress as `0x${string}`) : undefined,
    hasHarness,
    factoryDeployed,
    isLoading,
    isDeploying: isPending,
    deployHarness,
    refetch,
  };
}
