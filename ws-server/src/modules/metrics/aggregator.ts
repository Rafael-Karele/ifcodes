import { collectCpu, collectMemory, collectDisk, collectNetwork, collectUptime } from './collectors/system';
import { collectContainers } from './collectors/docker';
import { collectWebSocketStats } from './collectors/websockets';
import { collectQueueStats, collectFailedJobs } from './collectors/queue';

export interface MetricsSnapshot {
  system: {
    cpu_percent: number;
    ram_used_bytes: number;
    ram_total_bytes: number;
    disk_used_bytes: number;
    disk_total_bytes: number;
    net_rx_bytes: number;
    net_tx_bytes: number;
    uptime_seconds: number;
  };
  containers: {
    name: string;
    state: string;
    cpu_percent: number;
    memory_used_bytes: number;
    memory_limit_bytes: number;
    memory_percent: number;
    net_rx_bytes: number;
    net_tx_bytes: number;
  }[];
  websockets: {
    jam_connections: number;
    notification_connections: number;
    active_jam_sessions: number;
    jam_msgs_per_sec: number;
    notif_msgs_per_sec: number;
    jam_errors: number;
    notif_errors: number;
    jam_disconnects: number;
    notif_disconnects: number;
    avg_latency_ms: number;
  };
  queue: {
    pending: number;
    reserved: number;
    delayed: number;
    failed: number;
  };
  collected_at: string;
}

let latestSnapshot: MetricsSnapshot | null = null;
let collectionTimer: NodeJS.Timeout | null = null;
let adminCount = 0;
let adminToken: string | null = null;

// Disk is collected less frequently
let diskCache = { used: 0, total: 0 };
let diskTick = 0;

// Failed jobs collected every 5 ticks (10s at 2s interval)
let failedJobsCache = 0;
let failedJobsTick = 0;

async function collect(): Promise<MetricsSnapshot> {
  const cpuPercent = collectCpu();
  const memory = collectMemory();
  const network = collectNetwork();
  const uptime = collectUptime();
  const wsStats = collectWebSocketStats();

  // Disk every 3 ticks (~6s)
  if (diskTick % 3 === 0) {
    diskCache = await collectDisk();
  }
  diskTick++;

  // Failed jobs every 5 ticks (~10s)
  if (failedJobsTick % 5 === 0 && adminToken) {
    failedJobsCache = await collectFailedJobs(adminToken);
  }
  failedJobsTick++;

  const [containers, queueStats] = await Promise.all([
    collectContainers(),
    collectQueueStats(),
  ]);

  return {
    system: {
      cpu_percent: cpuPercent,
      ram_used_bytes: memory.used,
      ram_total_bytes: memory.total,
      disk_used_bytes: diskCache.used,
      disk_total_bytes: diskCache.total,
      net_rx_bytes: network.rx_bytes,
      net_tx_bytes: network.tx_bytes,
      uptime_seconds: uptime,
    },
    containers,
    websockets: wsStats,
    queue: {
      ...queueStats,
      failed: failedJobsCache,
    },
    collected_at: new Date().toISOString(),
  };
}

function startLoop(): void {
  if (collectionTimer) return;

  console.log('[metrics] Metrics collector started');

  // Collect immediately on start
  collect().then((s) => { latestSnapshot = s; }).catch(() => {});

  collectionTimer = setInterval(async () => {
    try {
      latestSnapshot = await collect();
    } catch (err: any) {
      console.error('[metrics] Collection error:', err.message);
    }
  }, 2000);
}

function stopLoop(): void {
  if (collectionTimer) {
    clearInterval(collectionTimer);
    collectionTimer = null;
    console.log('[metrics] No admin clients, pausing metrics');
  }
}

export function adminConnected(token: string): void {
  adminCount++;
  adminToken = token;
  startLoop();
}

export function adminDisconnected(): void {
  adminCount = Math.max(0, adminCount - 1);
  if (adminCount === 0) {
    stopLoop();
  }
}

export function getLatestSnapshot(): MetricsSnapshot | null {
  return latestSnapshot;
}
