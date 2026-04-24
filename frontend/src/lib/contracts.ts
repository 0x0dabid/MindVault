export const MINDVAULT_ROUTER_ADDRESS = (
  process.env.NEXT_PUBLIC_ROUTER_ADDRESS ?? '0x0000000000000000000000000000000000000000'
) as `0x${string}`;

export const MINDVAULT_ROUTER_ABI = [
  {
    type: 'constructor',
    inputs: [{ name: '_agentId', type: 'bytes32' }],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    name: 'sendMessage',
    inputs: [
      { name: 'sessionId', type: 'bytes32' },
      { name: 'encryptedMessage', type: 'bytes' },
    ],
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    name: 'onAgentResponse',
    inputs: [
      { name: 'jobId', type: 'bytes32' },
      { name: 'sessionId', type: 'bytes32' },
      { name: 'encryptedResponse', type: 'bytes' },
    ],
    outputs: [],
    stateMutability: 'nonpayable',
  },
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
          { name: 'user', type: 'address' },
          { name: 'startedAt', type: 'uint256' },
          { name: 'messageCount', type: 'uint256' },
          { name: 'latestJobId', type: 'bytes32' },
        ],
      },
    ],
    stateMutability: 'view',
  },
  {
    type: 'function',
    name: 'agentId',
    inputs: [],
    outputs: [{ name: '', type: 'bytes32' }],
    stateMutability: 'view',
  },
  {
    type: 'event',
    name: 'MessageSent',
    inputs: [
      { name: 'user', type: 'address', indexed: true },
      { name: 'sessionId', type: 'bytes32', indexed: true },
      { name: 'jobId', type: 'bytes32', indexed: false },
      { name: 'timestamp', type: 'uint256', indexed: false },
    ],
  },
  {
    type: 'event',
    name: 'ResponseReceived',
    inputs: [
      { name: 'user', type: 'address', indexed: true },
      { name: 'sessionId', type: 'bytes32', indexed: true },
      { name: 'encryptedResponse', type: 'bytes', indexed: false },
    ],
  },
  {
    type: 'event',
    name: 'SessionCreated',
    inputs: [
      { name: 'user', type: 'address', indexed: true },
      { name: 'sessionId', type: 'bytes32', indexed: true },
    ],
  },
] as const;
