import WebSocket from 'ws';
import { Request, Response } from 'express';
import { validateToken } from '../../shared/auth';
import { adminConnected, adminDisconnected, getLatestSnapshot } from './aggregator';
import { setLatencyMs } from './collectors/websockets';

const adminClients = new Set<WebSocket>();
let broadcastTimer: NodeJS.Timeout | null = null;

// Ping/pong latency tracking
const latencyMap = new Map<WebSocket, number>();

setInterval(() => {
  for (const ws of adminClients) {
    if (ws.readyState === WebSocket.OPEN) {
      latencyMap.set(ws, Date.now());
      ws.ping();
    }
  }
}, 5000);

function startBroadcast(): void {
  if (broadcastTimer) return;
  broadcastTimer = setInterval(() => {
    const snapshot = getLatestSnapshot();
    if (!snapshot || adminClients.size === 0) return;

    const msg = JSON.stringify(snapshot);
    for (const ws of adminClients) {
      if (ws.readyState === WebSocket.OPEN) {
        ws.send(msg);
      }
    }
  }, 2000);
}

function stopBroadcast(): void {
  if (broadcastTimer && adminClients.size === 0) {
    clearInterval(broadcastTimer);
    broadcastTimer = null;
  }
}

export async function handleMetricsConnection(ws: WebSocket): Promise<void> {
  // Wait for AUTH message
  ws.on('message', async (raw: Buffer) => {
    let msg: any;
    try {
      msg = JSON.parse(raw.toString());
    } catch {
      ws.send(JSON.stringify({ type: 'ERROR', message: 'Invalid JSON' }));
      return;
    }

    if (msg.type === 'AUTH_METRICS') {
      const { token } = msg;
      if (!token) {
        ws.send(JSON.stringify({ type: 'ERROR', message: 'Missing token' }));
        ws.close();
        return;
      }

      const user = await validateToken(token);
      if (!user || !user.roles.includes('admin')) {
        ws.send(JSON.stringify({ type: 'ERROR', message: 'Unauthorized' }));
        ws.close();
        return;
      }

      adminClients.add(ws);
      adminConnected(token);
      startBroadcast();

      // Track pong responses for latency measurement
      ws.on('pong', () => {
        const sent = latencyMap.get(ws);
        if (sent) {
          setLatencyMs(Date.now() - sent);
          latencyMap.delete(ws);
        }
      });

      ws.send(JSON.stringify({ type: 'AUTH_OK' }));
      console.log(`[metrics] Admin ${user.id} (${user.name}) connected`);

      // Send immediate snapshot if available
      const snapshot = getLatestSnapshot();
      if (snapshot) {
        ws.send(JSON.stringify(snapshot));
      }
    }
  });

  ws.on('close', () => {
    if (adminClients.has(ws)) {
      latencyMap.delete(ws);
      adminClients.delete(ws);
      adminDisconnected();
      stopBroadcast();
      console.log('[metrics] Admin disconnected');
    }
  });
}

export async function handleMetricsRest(req: Request, res: Response): Promise<void> {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    res.status(401).json({ error: 'Missing token' });
    return;
  }

  const token = authHeader.slice(7);
  const user = await validateToken(token);
  if (!user || !user.roles.includes('admin')) {
    res.status(403).json({ error: 'Unauthorized' });
    return;
  }

  const snapshot = getLatestSnapshot();
  if (!snapshot) {
    res.status(503).json({ error: 'Metrics not yet available' });
    return;
  }

  res.json(snapshot);
}
