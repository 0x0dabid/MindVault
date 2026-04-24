import http from 'http';
import { createPublicClient, webSocket } from 'viem';
import { ritualChain, MINDVAULT_ROUTER_ADDRESS, RESPONSE_RECEIVED_ABI, SSE_PORT } from './config.js';
import { startHealthServer } from './health.js';

const client = createPublicClient({
  chain: ritualChain,
  transport: webSocket('wss://rpc.ritualfoundation.org'),
});

// sessionId (hex) -> Set of active SSE response writers
const subscribers = new Map<string, Set<http.ServerResponse>>();

function subscribe(sessionId: string, res: http.ServerResponse) {
  if (!subscribers.has(sessionId)) subscribers.set(sessionId, new Set());
  subscribers.get(sessionId)!.add(res);
}

function unsubscribe(sessionId: string, res: http.ServerResponse) {
  subscribers.get(sessionId)?.delete(res);
}

function broadcast(sessionId: string, data: object) {
  const writers = subscribers.get(sessionId);
  if (!writers) return;
  const payload = `data: ${JSON.stringify(data)}\n\n`;
  for (const res of writers) {
    try {
      res.write(payload);
    } catch {
      writers.delete(res);
    }
  }
}

async function startIndexer() {
  console.log('[indexer] Connecting to Ritual Chain…');

  const unwatch = client.watchContractEvent({
    address: MINDVAULT_ROUTER_ADDRESS,
    abi: RESPONSE_RECEIVED_ABI,
    eventName: 'ResponseReceived',
    onLogs: (logs) => {
      for (const log of logs) {
        const { user, sessionId, encryptedResponse } = log.args as {
          user: string;
          sessionId: string;
          encryptedResponse: string;
        };
        console.log(`[indexer] ResponseReceived  session=${sessionId}  user=${user}`);
        broadcast(sessionId, { user, sessionId, encryptedResponse, block: log.blockNumber?.toString() });
      }
    },
    onError: (err) => {
      console.error('[indexer] Watch error:', err.message);
    },
  });

  console.log(`[indexer] Watching ${MINDVAULT_ROUTER_ADDRESS} for ResponseReceived events`);
  return unwatch;
}

// SSE endpoint: GET /events/:sessionId
const server = http.createServer((req, res) => {
  const url = new URL(req.url ?? '/', `http://localhost:${SSE_PORT}`);

  if (req.method === 'GET' && url.pathname.startsWith('/events/')) {
    const sessionId = url.pathname.split('/events/')[1];
    if (!sessionId) {
      res.writeHead(400).end('Missing sessionId');
      return;
    }

    res.writeHead(200, {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      Connection: 'keep-alive',
      'Access-Control-Allow-Origin': '*',
    });
    res.write(':\n\n'); // SSE comment to confirm connection

    subscribe(sessionId, res);
    req.on('close', () => unsubscribe(sessionId, res));
    return;
  }

  res.writeHead(404).end();
});

server.listen(SSE_PORT, () => {
  console.log(`[indexer] SSE server listening on :${SSE_PORT}`);
});

startHealthServer();
startIndexer();
