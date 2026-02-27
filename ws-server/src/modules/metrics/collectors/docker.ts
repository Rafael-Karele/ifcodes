import http from 'http';

const DOCKER_SOCKET = '/var/run/docker.sock';

interface ContainerStats {
  name: string;
  state: string;
  cpu_percent: number;
  memory_used_bytes: number;
  memory_limit_bytes: number;
  memory_percent: number;
  net_rx_bytes: number;
  net_tx_bytes: number;
}

function dockerRequest(path: string): Promise<any> {
  return new Promise((resolve, reject) => {
    const req = http.request(
      {
        socketPath: DOCKER_SOCKET,
        path,
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
      },
      (res) => {
        let data = '';
        res.on('data', (chunk) => (data += chunk));
        res.on('end', () => {
          try {
            resolve(JSON.parse(data));
          } catch {
            reject(new Error(`Invalid JSON from Docker: ${data.slice(0, 200)}`));
          }
        });
      }
    );
    req.on('error', reject);
    req.setTimeout(5000, () => {
      req.destroy(new Error('Docker request timeout'));
    });
    req.end();
  });
}

function calculateCpuPercent(stats: any): number {
  const cpuDelta =
    stats.cpu_stats.cpu_usage.total_usage -
    stats.precpu_stats.cpu_usage.total_usage;
  const systemDelta =
    stats.cpu_stats.system_cpu_usage -
    stats.precpu_stats.system_cpu_usage;
  const numCpus = stats.cpu_stats.online_cpus || 1;

  if (systemDelta <= 0 || cpuDelta < 0) return 0;
  return Math.round((cpuDelta / systemDelta) * numCpus * 10000) / 100;
}

async function getContainerStats(container: any): Promise<ContainerStats | null> {
  try {
    const stats = await dockerRequest(
      `/containers/${container.Id}/stats?stream=false`
    );

    const name = (container.Names?.[0] || '').replace(/^\//, '');

    let netRx = 0;
    let netTx = 0;
    if (stats.networks) {
      for (const iface of Object.values(stats.networks) as any[]) {
        netRx += iface.rx_bytes || 0;
        netTx += iface.tx_bytes || 0;
      }
    }

    const memUsed = stats.memory_stats?.usage || 0;
    const memLimit = stats.memory_stats?.limit || 0;

    return {
      name,
      state: container.State || 'unknown',
      cpu_percent: calculateCpuPercent(stats),
      memory_used_bytes: memUsed,
      memory_limit_bytes: memLimit,
      memory_percent:
        memLimit > 0
          ? Math.round((memUsed / memLimit) * 10000) / 100
          : 0,
      net_rx_bytes: netRx,
      net_tx_bytes: netTx,
    };
  } catch (err: any) {
    console.error(
      `[metrics] Failed to get stats for container ${container.Id?.slice(0, 12)}:`,
      err.message
    );
    return null;
  }
}

export async function collectContainers(): Promise<ContainerStats[]> {
  try {
    const containers = await dockerRequest('/containers/json');
    if (!Array.isArray(containers)) return [];

    // Fetch all container stats in parallel
    const results = await Promise.all(
      containers.map((c) => getContainerStats(c))
    );

    return results.filter((r): r is ContainerStats => r !== null);
  } catch (err: any) {
    console.error('[metrics] Failed to list containers:', err.message);
    return [];
  }
}
