'use client';

// ritual-dapp-wallet skill:
// For two-phase async precompiles (Sovereign Agent), the commitment validator
// checks balanceOf(EOA signer), NOT balanceOf(contract sender). The EOA must
// have its own RitualWallet deposit. Depositing only into the harness/router
// will fail with "insufficient wallet balance (user: <EOA>)".
import { useReadContract, useSendTransaction, useBlockNumber } from 'wagmi';
import { useAccount } from 'wagmi';
import { formatEther, parseEther } from 'viem';
import { useCallback } from 'react';

const RITUAL_WALLET = '0x532F0dF0896F353d8C3DD8cc134e8129DA2a3948' as const;

// block-time skill: ~350ms/block on Ritual Chain.
// 10_000 blocks ≈ 58 min; 50_000 blocks ≈ 4.8h — use 50k for safe lock duration.
export const RECOMMENDED_LOCK_BLOCKS = 50_000n;
// ~0.5–1 RITUAL per Sovereign Agent call (from ritual-dapp-wallet skill cost range)
export const RECOMMENDED_DEPOSIT_ETH = '2'; // 2 RITUAL covers ~2–4 sessions

const RITUAL_WALLET_ABI = [
  {
    type: 'function', name: 'deposit', stateMutability: 'payable',
    inputs: [{ name: 'lockDuration', type: 'uint256' }], outputs: [],
  },
  {
    type: 'function', name: 'balanceOf', stateMutability: 'view',
    inputs: [{ name: 'account', type: 'address' }],
    outputs: [{ name: '', type: 'uint256' }],
  },
  {
    type: 'function', name: 'lockUntil', stateMutability: 'view',
    inputs: [{ name: 'account', type: 'address' }],
    outputs: [{ name: '', type: 'uint256' }],
  },
] as const;

export function useRitualWallet() {
  const { address } = useAccount();
  const { sendTransactionAsync } = useSendTransaction();
  const { data: currentBlock } = useBlockNumber({ watch: false });

  // Read the connected EOA's balance — this is what the commitment validator checks.
  const { data: balance, refetch: refetchBalance } = useReadContract({
    address: RITUAL_WALLET,
    abi: RITUAL_WALLET_ABI,
    functionName: 'balanceOf',
    args: [address!],
    query: { enabled: !!address },
  });

  const { data: lockUntil, refetch: refetchLock } = useReadContract({
    address: RITUAL_WALLET,
    abi: RITUAL_WALLET_ABI,
    functionName: 'lockUntil',
    args: [address!],
    query: { enabled: !!address },
  });

  const isLocked = !!lockUntil && !!currentBlock && currentBlock < lockUntil;
  const hasBalance = !!balance && balance > parseEther('0.01');

  // Deposit RITUAL directly to the EOA's RitualWallet balance.
  const deposit = useCallback(
    async (amountWei: bigint = parseEther(RECOMMENDED_DEPOSIT_ETH), lockDuration: bigint = RECOMMENDED_LOCK_BLOCKS) => {
      const { encodeFunctionData } = await import('viem');
      const data = encodeFunctionData({
        abi: RITUAL_WALLET_ABI,
        functionName: 'deposit',
        args: [lockDuration],
      });
      const hash = await sendTransactionAsync({
        to: RITUAL_WALLET,
        data,
        value: amountWei,
        gas: 150_000n,
      });
      await refetchBalance();
      await refetchLock();
      return hash;
    },
    [sendTransactionAsync, refetchBalance, refetchLock],
  );

  return {
    balance: balance ?? 0n,
    balanceFormatted: formatEther(balance ?? 0n),
    lockUntil: lockUntil ?? 0n,
    currentBlock: currentBlock ?? 0n,
    isLocked,
    hasBalance,
    deposit,
    refetchBalance,
  };
}
