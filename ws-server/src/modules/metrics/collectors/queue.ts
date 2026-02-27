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
