'use client';

import { useState, useCallback } from 'react';
import { useAccount, useSignMessage } from 'wagmi';
import { encryptMessage, decryptMessage, publicKeyFromPrivateKey } from '@/lib/encryption';

// Derive a deterministic private key for encryption by signing a fixed message with the wallet.
// This avoids storing private keys while giving each wallet a stable encryption key pair.
const KEYGEN_MESSAGE = 'MindVault: authorize encryption key derivation. This signature is never broadcast.';

export function useEncryption() {
  const { address } = useAccount();
  const { signMessageAsync } = useSignMessage();

  const [derivedPrivateKey, setDerivedPrivateKey] = useState<string | null>(null);
  const [derivedPublicKey, setDerivedPublicKey] = useState<string | null>(null);

  const deriveKeys = useCallback(async () => {
    if (!address) throw new Error('Wallet not connected');

    const sig = await signMessageAsync({ message: KEYGEN_MESSAGE });
    // Use the last 32 bytes of the signature as the private key seed
    const privKey = sig.slice(0, 66); // '0x' + 64 hex chars = 32 bytes
    const pubKey = publicKeyFromPrivateKey(privKey.replace('0x', ''));

    setDerivedPrivateKey(privKey.replace('0x', ''));
    setDerivedPublicKey(pubKey);

    return { privateKey: privKey.replace('0x', ''), publicKey: pubKey };
  }, [address, signMessageAsync]);

  const encrypt = useCallback(
    async (message: string): Promise<`0x${string}`> => {
      let pubKey = derivedPublicKey;
      if (!pubKey) {
        const keys = await deriveKeys();
        pubKey = keys.publicKey;
      }
      return encryptMessage(message, pubKey);
    },
    [derivedPublicKey, deriveKeys],
  );

  const decrypt = useCallback(
    async (encryptedHex: string): Promise<string> => {
      let privKey = derivedPrivateKey;
      if (!privKey) {
        const keys = await deriveKeys();
        privKey = keys.privateKey;
      }
      return decryptMessage(encryptedHex, privKey);
    },
    [derivedPrivateKey, deriveKeys],
  );

  return {
    derivedPublicKey,
    keysReady: !!derivedPublicKey,
    deriveKeys,
    encrypt,
    decrypt,
  };
}
