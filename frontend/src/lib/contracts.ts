export const MINDVAULT_ROUTER_ADDRESS = (
  process.env.NEXT_PUBLIC_ROUTER_ADDRESS ?? '0x0000000000000000000000000000000000000000'
) as `0x${string}`;

export const MINDVAULT_FACTORY_ADDRESS = (
  process.env.NEXT_PUBLIC_FACTORY_ADDRESS ?? '0x0000000000000000000000000000000000000000'
) as `0x${string}`;

export const MINDVAULT_FACTORY_ABI = [
  {
    type: 'function',
    name: 'deploy',
    inputs: [],
    outputs: [{ name: 'harness', type: 'address' }],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    name: 'harnessOf',
    inputs: [{ name: 'user', type: 'address' }],
    outputs: [{ name: '', type: 'address' }],
    stateMutability: 'view',
  },
  {
    type: 'event',
    name: 'HarnessDeployed',
    inputs: [
      { name: 'user',    type: 'address', indexed: true },
      { name: 'harness', type: 'address', indexed: true },
    ],
  },
] as const;

// Harness ABI — subset used for reading session data.
// MindVaultHarness stores sessions without a user field (it's per-owner).
export const MINDVAULT_HARNESS_SESSION_ABI = [
  {
    type: 'function',
    name: 'getSessionIds',
    inputs: [],
    outputs: [{ name: '', type: 'bytes32[]' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    name: 'getSession',
    inputs: [{ name: 'sessionId', type: 'bytes32' }],
    outputs: [{
      name: '', type: 'tuple',
      components: [
        { name: 'startedAt',    type: 'uint256' },
        { name: 'messageCount', type: 'uint256' },
        { name: 'latestJobId',  type: 'bytes32' },
      ],
    }],
    stateMutability: 'view',
  },
] as const;

export const MINDVAULT_ROUTER_ABI = [
  {
    type: 'constructor',
    inputs: [],
    stateMutability: 'nonpayable',
  },
  // ── Write ─────────────────────────────────────────────────────────────────
  {
    type: 'function',
    name: 'sendMessage',
    inputs: [
      { name: 'sessionId',  type: 'bytes32' },
      // agentInput: full 23-field ABI-encoded Sovereign Agent params
      // built by lib/sovereign-agent.ts encodeSovereignAgentInput()
      { name: 'agentInput', type: 'bytes'   },
    ],
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    name: 'onSovereignAgentResult',
    inputs: [
      { name: 'jobId',  type: 'bytes32' },
      { name: 'result', type: 'bytes'   },
    ],
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    name: 'deposit',
    inputs: [{ name: 'lockDuration', type: 'uint256' }],
    outputs: [],
    stateMutability: 'payable',
  },
  // ── Read ──────────────────────────────────────────────────────────────────
  {
    type: 'function',
    name: 'getUserSessions',
    inputs: [{ name: 'user', type: 'address' }],
    outputs: [{ name: '', type: 'bytes32[]' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    name: 'getSession',
    inputs: [{ name: 'sessionId', type: 'bytes32' }],
    outputs: [
      {
        name: '',
        type: 'tuple',
        components: [
          { name: 'user',         type: 'address' },
          { name: 'startedAt',    type: 'uint256' },
          { name: 'messageCount', type: 'uint256' },
          { name: 'latestJobId',  type: 'bytes32' },
        ],
      },
    ],
    stateMutability: 'view',
  },
  {
    type: 'function',
    name: 'hasPendingJob',
    inputs: [],
    outputs: [{ name: '', type: 'bool' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    name: 'fulfilled',
    inputs: [{ name: 'jobId', type: 'bytes32' }],
    outputs: [{ name: '', type: 'bool' }],
    stateMutability: 'view',
  },
  // ── Events ────────────────────────────────────────────────────────────────
  {
    type: 'event',
    name: 'SessionCreated',
    inputs: [
      { name: 'user',      type: 'address', indexed: true  },
      { name: 'sessionId', type: 'bytes32', indexed: true  },
    ],
  },
  {
    type: 'event',
    name: 'MessageSent',
    inputs: [
      { name: 'user',      type: 'address', indexed: true  },
      { name: 'sessionId', type: 'bytes32', indexed: true  },
      { name: 'jobId',     type: 'bytes32', indexed: false },
      { name: 'timestamp', type: 'uint256', indexed: false },
    ],
  },
  {
    type: 'event',
    name: 'AgentResponse',
    inputs: [
      { name: 'jobId',     type: 'bytes32', indexed: true  },
      { name: 'sessionId', type: 'bytes32', indexed: true  },
      { name: 'success',   type: 'bool',    indexed: false },
      { name: 'text',      type: 'string',  indexed: false },
      { name: 'error',     type: 'string',  indexed: false },
    ],
  },
] as const;
