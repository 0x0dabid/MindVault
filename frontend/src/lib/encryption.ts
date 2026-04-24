import EthCrypto from 'eth-crypto';

export interface EncryptedPayload {
  iv: string;
  ephemPublicKey: string;
  ciphertext: string;
  mac: string;
}

export async function encryptMessage(
  message: string,
  recipientPublicKey: string,
): Promise<`0x${string}`> {
  const payload = JSON.stringify({
    content: message,
    timestamp: Date.now(),
    nonce: crypto.randomUUID(),
  });

  const encrypted: EncryptedPayload = await EthCrypto.encryptWithPublicKey(
    recipientPublicKey,
    payload,
  );

  const hex = Buffer.from(JSON.stringify(encrypted)).toString('hex');
  return `0x${hex}`;
}

export async function decryptMessage(
  encryptedHex: string,
  privateKey: string,
): Promise<string> {
  const json = Buffer.from(encryptedHex.replace(/^0x/, ''), 'hex').toString();
  const encrypted: EncryptedPayload = JSON.parse(json);
  const decrypted = await EthCrypto.decryptWithPrivateKey(privateKey, encrypted);
  const { content } = JSON.parse(decrypted);
  return content;
}

export function publicKeyFromPrivateKey(privateKey: string): string {
  return EthCrypto.publicKeyByPrivateKey(privateKey);
}

// Derive a deterministic session ID from user address + session index
export function deriveSessionId(userAddress: string, index: number): `0x${string}` {
  const { keccak256, encodePacked } = require('viem');
  return keccak256(encodePacked(['address', 'uint256'], [userAddress as `0x${string}`, BigInt(index)]));
}
