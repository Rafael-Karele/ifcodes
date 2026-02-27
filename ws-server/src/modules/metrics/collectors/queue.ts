import Redis from 'ioredis';
import client from '../../../shared/laravel-client';

const REDIS_HOST = process.env.REDIS_HOST || 'laravel_redis';
const REDIS_PORT = parseInt(process.env.REDIS_PORT || '6379', 10);
const REDIS_PREFIX = process.env.REDIS_PREFIX || 'laravel_database_';

// Eager connection — no lazyConnect
const redis = new Redis({ host: REDIS_HOST, port: REDIS_PORT });
redis.on('error', (err) => {
  console.error('[metrics] Queue Redis error:', err.message);
});
redis.on('connect', () => {
  console.log('[metrics] Queue Redis connected');
});

export async function collectQueueStats(): Promise<{
  pending: number;
  reserved: number;
  delayed: number;
}> {
  try {
    const [pending, reserved, delayed] = await Promise.all([
      redis.llen(`${REDIS_PREFIX}queues:default`),
      redis.zcard(`${REDIS_PREFIX}queues:default:reserved`),
      redis.zcard(`${REDIS_PREFIX}queues:default:delayed`),
    ]);
    return { pending, reserved, delayed };
  } catch (err: any) {
    console.error('[metrics] Failed to collect queue stats:', err.message);
    return { pending: 0, reserved: 0, delayed: 0 };
  }
}

const JUDGE0_API_URL = process.env.JUDGE0_API_URL || 'http://judge0_server:2358';

export async function collectJudge0Workers(): Promise<{
  queue_size: number;
  workers_available: number;
  workers_idle: number;
  workers_working: number;
  workers_paused: number;
  workers_failed: number;
}> {
  try {
    const res = await fetch(`${JUDGE0_API_URL}/workers`);
    const data = await res.json();
    const q = data?.[0] ?? {};
    return {
      queue_size: q.size ?? 0,
      workers_available: q.available ?? 0,
      workers_idle: q.idle ?? 0,
      workers_working: q.working ?? 0,
      workers_paused: q.paused ?? 0,
      workers_failed: q.failed ?? 0,
    };
  } catch (err: any) {
    console.error('[metrics] Failed to collect Judge0 workers:', err.message);
    return { queue_size: 0, workers_available: 0, workers_idle: 0, workers_working: 0, workers_paused: 0, workers_failed: 0 };
  }
}

export async function collectFailedJobs(adminToken: string): Promise<number> {
  try {
    const res = await client.get('/api/admin/failed-jobs', {
      headers: { Authorization: `Bearer ${adminToken}` },
    });
    return res.data?.count ?? 0;
  } catch (err: any) {
    console.error('[metrics] Failed to fetch failed jobs:', err.message);
    return 0;
  }
}
