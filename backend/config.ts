import { defineChain } from 'viem';

export const ritualChain = defineChain({
  id: 1979,
  name: 'Ritual',
  nativeCurrency: { name: 'RITUAL', symbol: 'RITUAL', decimals: 18 },
  rpcUrls: {
    default: {
      http: ['https://rpc.ritualfoundation.org'],
      webSocket: ['wss://rpc.ritualfoundation.org/ws'], // note: /ws suffix required
    },
  },
  testnet: true,
});

export const MINDVAULT_ROUTER_ADDRESS = (
  process.env.ROUTER_ADDRESS ?? '0x0000000000000000000000000000000000000000'
) as `0x${string}`;

// AgentResponse(bytes32 indexed jobId, bytes32 indexed sessionId, bool success, string text, string error)
export const AGENT_RESPONSE_ABI = [
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

export const SSE_PORT    = Number(process.env.PORT        ?? 3001);
export const HEALTH_PORT = Number(process.env.HEALTH_PORT ?? 3002);
