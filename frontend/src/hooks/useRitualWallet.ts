'use client';

import { useReadContract } from 'wagmi';
import { useSendTransaction } from 'wagmi';
import { encodeFunctionData } from 'viem';
import { useCallback } from 'react';
import { MINDVAULT_ROUTER_ADDRESS, MINDVAULT_ROUTER_ABI } from '@/lib/contracts';

const RITUAL_WALLET = '0x532F0dF0896F353d8C3DD8cc134e8129DA2a3948' as const;

const RITUAL_WALLET_ABI = [
  {
    type: 'function',
    name: 'balanceOf',
    inputs: [{ name: 'account', type: 'address' }],
    outputs: [{ name: '', type: 'uint256' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    name: 'lockUntil',
    inputs: [{ name: 'account', type: 'address' }],
    outputs: [{ name: '', type: 'uint256' }],
    stateMutability: 'view',
  },
] as const;

export function useRitualWallet() {
  const { sendTransactionAsync } = useSendTransaction();

  // Read the router's wallet balance (the contract is the sender for precompile calls)
  const { data: balance, refetch: refetchBalance } = useReadContract({
    address: RITUAL_WALLET,
    abi: RITUAL_WALLET_ABI,
    functionName: 'balanceOf',
    args: [MINDVAULT_ROUTER_ADDRESS],
  });

  const { data: lockUntil } = useReadContract({
    address: RITUAL_WALLET,
    abi: RITUAL_WALLET_ABI,
    functionName: 'lockUntil',
    args: [MINDVAULT_ROUTER_ADDRESS],
  });

  // Deposit RITUAL into the router's RitualWallet via the router's deposit() function
  const deposit = useCallback(
    async (amountWei: bigint, lockDuration: bigint) => {
      const data = encodeFunctionData({
        abi: MINDVAULT_ROUTER_ABI,
        functionName: 'deposit',
        args: [lockDuration],
      });

      return sendTransactionAsync({
        to: MINDVAULT_ROUTER_ADDRESS,
        data,
        value: amountWei,
        gas: 200_000n,
      });
    },
    [sendTransactionAsync],
  );

  return {
    balance: balance ?? 0n,
    lockUntil: lockUntil ?? 0n,
    deposit,
    refetchBalance,
  };
}
