import http from 'http';

const HEALTH_PORT = Number(process.env.HEALTH_PORT ?? 3002);

export function startHealthServer() {
  const server = http.createServer((req, res) => {
    if (req.method === 'GET' && req.url === '/health') {
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ status: 'ok', ts: Date.now() }));
      return;
    }
    res.writeHead(404).end();
  });

  server.listen(HEALTH_PORT, () => {
    console.log(`[health] Listening on :${HEALTH_PORT}/health`);
  });

  return server;
}
