import { defineChain } from 'viem';

export const ritualChain = defineChain({
  id: 1979,
  name: 'Ritual Chain',
  nativeCurrency: { name: 'Ether', symbol: 'ETH', decimals: 18 },
  rpcUrls: {
    default: {
      http: ['https://rpc.ritualfoundation.org'],
      webSocket: ['wss://rpc.ritualfoundation.org'],
    },
  },
  testnet: true,
});

export const MINDVAULT_ROUTER_ADDRESS = (
  process.env.ROUTER_ADDRESS ?? '0x0000000000000000000000000000000000000000'
) as `0x${string}`;

export const RESPONSE_RECEIVED_ABI = [
  {
    type: 'event',
    name: 'ResponseReceived',
    inputs: [
      { name: 'user', type: 'address', indexed: true },
      { name: 'sessionId', type: 'bytes32', indexed: true },
      { name: 'encryptedResponse', type: 'bytes', indexed: false },
    ],
  },
] as const;

export const SSE_PORT = Number(process.env.PORT ?? 3001);
