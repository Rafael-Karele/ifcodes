import WebSocket from 'ws';
import Redis from 'ioredis';
import { validateToken } from '../../shared/auth';
import { getUserTurmaIds } from '../../shared/laravel-client';
import { LaravelUser } from '../../shared/types';

interface NotificationClient {
  ws: WebSocket;
  user: LaravelUser;
  turmaIds: number[];
}

// Map userId -> Set of notification clients (a user can have multiple tabs)
const userClients = new Map<number, Set<NotificationClient>>();
// Map turmaId -> Set of notification clients
const turmaClients = new Map<number, Set<NotificationClient>>();

const REDIS_HOST = process.env.REDIS_HOST || 'laravel_redis';
const REDIS_PORT = parseInt(process.env.REDIS_PORT || '6379', 10);

let subscriber: Redis | null = null;

function ensureRedisSubscriber(): void {
  if (subscriber) return;

  subscriber = new Redis({ host: REDIS_HOST, port: REDIS_PORT, lazyConnect: true });

  subscriber.on('error', (err) => {
    console.error('[notifications] Redis error:', err.message);
  });

  subscriber.on('connect', () => {
    console.log('[notifications] Redis subscriber connected');
  });

  subscriber.connect().then(() => {
    subscriber!.psubscribe('notify:user.*', 'notify:turma.*');
  }).catch((err) => {
    console.error('[notifications] Failed to connect to Redis:', err.message);
    subscriber = null;
  });

  subscriber.on('pmessage', (_pattern, channel, message) => {
    handleRedisMessage(channel, message);
  });
}

function handleRedisMessage(channel: string, raw: string): void {
  let data: { event: string };
  try {
    data = JSON.parse(raw);
  } catch {
    return;
  }

  const event = data.event;
  if (!event) return;

  const msg = JSON.stringify({ type: 'NOTIFICATION', event });

  // notify:user.{userId}
  const userMatch = channel.match(/^notify:user\.(\d+)$/);
  if (userMatch) {
    const userId = parseInt(userMatch[1], 10);
    const clients = userClients.get(userId);
    if (clients) {
      for (const client of clients) {
        if (client.ws.readyState === WebSocket.OPEN) {
          client.ws.send(msg);
        }
      }
    }
    return;
  }

  // notify:turma.{turmaId}
  const turmaMatch = channel.match(/^notify:turma\.(\d+)$/);
  if (turmaMatch) {
    const turmaId = parseInt(turmaMatch[1], 10);
    const clients = turmaClients.get(turmaId);
    if (clients) {
      for (const client of clients) {
        if (client.ws.readyState === WebSocket.OPEN) {
          client.ws.send(msg);
        }
      }
    }
  }
}

function addClient(client: NotificationClient): void {
  const userId = client.user.id;

  if (!userClients.has(userId)) {
    userClients.set(userId, new Set());
  }
  userClients.get(userId)!.add(client);

  for (const turmaId of client.turmaIds) {
    if (!turmaClients.has(turmaId)) {
      turmaClients.set(turmaId, new Set());
    }
    turmaClients.get(turmaId)!.add(client);
  }
}

function removeClient(client: NotificationClient): void {
  const userId = client.user.id;

  const userSet = userClients.get(userId);
  if (userSet) {
    userSet.delete(client);
    if (userSet.size === 0) userClients.delete(userId);
  }

  for (const turmaId of client.turmaIds) {
    const turmaSet = turmaClients.get(turmaId);
    if (turmaSet) {
      turmaSet.delete(client);
      if (turmaSet.size === 0) turmaClients.delete(turmaId);
    }
  }
}

export function getNotificationStats() {
  let totalConnections = 0;
  for (const clients of userClients.values()) {
    totalConnections += clients.size;
  }
  return { connections: totalConnections };
}

export async function handleNotificationConnection(ws: WebSocket): Promise<void> {
  ensureRedisSubscriber();

  let client: NotificationClient | null = null;

  ws.on('message', async (raw: Buffer) => {
    let msg: any;
    try {
      msg = JSON.parse(raw.toString());
    } catch {
      ws.send(JSON.stringify({ type: 'ERROR', message: 'Invalid JSON' }));
      return;
    }

    if (msg.type === 'AUTH_NOTIFICATIONS') {
      const { token } = msg;
      if (!token) {
        ws.send(JSON.stringify({ type: 'ERROR', message: 'Missing token' }));
        ws.close();
        return;
      }

      const user = await validateToken(token);
      if (!user) {
        ws.send(JSON.stringify({ type: 'ERROR', message: 'Invalid token' }));
        ws.close();
        return;
      }

      const turmaIds = await getUserTurmaIds(token);

      client = { ws, user, turmaIds };
      addClient(client);

      ws.send(JSON.stringify({ type: 'AUTH_OK' }));
      console.log(`[notifications] User ${user.id} (${user.name}) connected, turmas: [${turmaIds.join(', ')}]`);
    }
  });

  ws.on('close', () => {
    if (client) {
      console.log(`[notifications] User ${client.user.id} disconnected`);
      removeClient(client);
      client = null;
    }
  });
}
