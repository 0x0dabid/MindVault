import { encodeAbiParameters, parseAbiParameters, toFunctionSelector } from 'viem';
import { MINDVAULT_ROUTER_ADDRESS } from './contracts';

// Delivery selector for MindVaultRouter.onSovereignAgentResult(bytes32,bytes)
export const DELIVERY_SELECTOR = toFunctionSelector('onSovereignAgentResult(bytes32,bytes)');

// CLI types — use ZeroClaw(6) with LLM_PROVIDER=ritual for zero-key setup,
// or Claude Code(0) with LLM_PROVIDER=anthropic for best quality.
export const CLI_TYPE = {
  CLAUDE_CODE: 0,
  CRUSH: 5,
  ZEROCLAW: 6,
} as const;

// 23-field Sovereign Agent ABI (precompile 0x080C)
const SOVEREIGN_AGENT_ABI = parseAbiParameters([
  // Base + delivery
  'address executor',
  'uint256 ttl',
  'bytes userPublicKey',
  'uint64 pollIntervalBlocks',
  'uint64 maxPollBlock',
  'string taskIdMarker',
  'address deliveryTarget',
  'bytes4 deliverySelector',
  'uint256 deliveryGasLimit',
  'uint256 deliveryMaxFeePerGas',
  'uint256 deliveryMaxPriorityFeePerGas',
  // Agent
  'uint16 cliType',
  'string prompt',
  'bytes encryptedSecrets',
  // Storage refs
  '(string platform, string path, string keyRef) convoHistory',
  '(string platform, string path, string keyRef) output',
  '(string platform, string path, string keyRef)[] skills',
  '(string platform, string path, string keyRef) systemPrompt',
  // LLM
  'string model',
  'string[] tools',
  'uint16 maxTurns',
  'uint32 maxTokens',
  'string rpcUrls',
].join(', '));

export interface SovereignAgentParams {
  executor: `0x${string}`;
  userPublicKey: `0x${string}`; // 65-byte uncompressed secp256k1 for encrypted response
  prompt: string;               // the user's plaintext message
  encryptedSecrets: `0x${string}`; // ECIES-encrypted JSON: {"LLM_PROVIDER":"ritual"} etc.
  convoHistoryRef: [string, string, string]; // [platform, path, keyRef] for DA conversation history
  systemPromptRef: [string, string, string]; // [platform, path, keyRef] for SOUL.md
  ttl?: bigint;                 // Phase 1 TTL in blocks (default 300 ≈ 105s)
  maxPollBlock?: bigint;        // Phase 2 deadline offset (default 30000 ≈ ~2.9h)
  cliType?: number;             // default ZeroClaw (6)
  model?: string;               // default zai-org/GLM-4.7-FP8
  maxTurns?: number;            // default 5
  maxTokens?: number;           // default 2048
}

export function encodeSovereignAgentInput(params: SovereignAgentParams): `0x${string}` {
  const {
    executor,
    userPublicKey,
    prompt,
    encryptedSecrets,
    convoHistoryRef,
    systemPromptRef,
    ttl = 300n,
    maxPollBlock = 30_000n,
    cliType = CLI_TYPE.ZEROCLAW,
    model = 'zai-org/GLM-4.7-FP8',
    maxTurns = 5,
    maxTokens = 2048,
  } = params;

  const emptyRef: [string, string, string] = ['', '', ''];

  return encodeAbiParameters(SOVEREIGN_AGENT_ABI, [
    executor,
    ttl,
    userPublicKey,
    5n,          // pollIntervalBlocks
    maxPollBlock,
    '',          // taskIdMarker
    MINDVAULT_ROUTER_ADDRESS,
    DELIVERY_SELECTOR,
    500_000n,    // deliveryGasLimit
    1_000_000_000n, // deliveryMaxFeePerGas (1 gwei)
    100_000_000n,   // deliveryMaxPriorityFeePerGas (0.1 gwei)
    cliType,
    prompt,
    encryptedSecrets,
    { platform: convoHistoryRef[0], path: convoHistoryRef[1], keyRef: convoHistoryRef[2] },
    { platform: emptyRef[0], path: emptyRef[1], keyRef: emptyRef[2] },
    [],          // skills
    { platform: systemPromptRef[0], path: systemPromptRef[1], keyRef: systemPromptRef[2] },
    model,
    [],          // tools — ZeroClaw decides based on context
    maxTurns,
    maxTokens,
    JSON.stringify({ ritual: process.env.NEXT_PUBLIC_RPC_URL ?? 'https://rpc.ritualfoundation.org' }),
  ]) as `0x${string}`;
}

// Decode the sovereign agent callback result emitted as AgentResponse event
export interface AgentResult {
  success: boolean;
  text: string;    // response text (may be ECIES-encrypted if userPublicKey was set)
  error: string;
}

export function decodeAgentResult(encoded: `0x${string}`): AgentResult {
  try {
    const [success, error, text] = encoded.split(','); // simplified — use viem decode in practice
    return { success: success === 'true', text, error };
  } catch {
    return { success: false, text: '', error: 'decode failed' };
  }
}
