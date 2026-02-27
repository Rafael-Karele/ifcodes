import fs from 'fs';

const PROC_BASE = '/host/proc';

interface CpuSnapshot {
  idle: number;
  total: number;
}

let prevCpu: CpuSnapshot | null = null;

function parseCpuLine(line: string): CpuSnapshot {
  // cpu  user nice system idle iowait irq softirq steal guest guest_nice
  const parts = line.trim().split(/\s+/).slice(1).map(Number);
  const idle = parts[3] + (parts[4] || 0); // idle + iowait
  const total = parts.reduce((sum, v) => sum + v, 0);
  return { idle, total };
}

export function collectCpu(): number {
  try {
    const stat = fs.readFileSync(`${PROC_BASE}/stat`, 'utf-8');
    const cpuLine = stat.split('\n').find((l) => l.startsWith('cpu '));
    if (!cpuLine) return 0;

    const current = parseCpuLine(cpuLine);

    if (!prevCpu) {
      prevCpu = current;
      return 0;
    }

    const idleDelta = current.idle - prevCpu.idle;
    const totalDelta = current.total - prevCpu.total;
    prevCpu = current;

    if (totalDelta === 0) return 0;
    return Math.round((1 - idleDelta / totalDelta) * 10000) / 100;
  } catch (err: any) {
    console.error('[metrics] Failed to read /proc/stat:', err.message);
    return 0;
  }
}

export function collectMemory(): { used: number; total: number } {
  try {
    const meminfo = fs.readFileSync(`${PROC_BASE}/meminfo`, 'utf-8');
    const lines = meminfo.split('\n');
    const getValue = (key: string): number => {
      const line = lines.find((l) => l.startsWith(key));
      if (!line) return 0;
      return parseInt(line.split(/\s+/)[1], 10) * 1024; // kB -> bytes
    };

    const total = getValue('MemTotal:');
    const free = getValue('MemFree:');
    const buffers = getValue('Buffers:');
    const cached = getValue('Cached:');
    const sReclaimable = getValue('SReclaimable:');

    const used = total - free - buffers - cached - sReclaimable;
    return { used: Math.max(0, used), total };
  } catch (err: any) {
    console.error('[metrics] Failed to read /proc/meminfo:', err.message);
    return { used: 0, total: 0 };
  }
}

export function collectUptime(): number {
  try {
    const content = fs.readFileSync(`${PROC_BASE}/uptime`, 'utf-8');
    return Math.floor(parseFloat(content.split(' ')[0]));
  } catch (err: any) {
    console.error('[metrics] Failed to read /proc/uptime:', err.message);
    return 0;
  }
}

interface NetStats {
  rx_bytes: number;
  tx_bytes: number;
}

let prevNet: NetStats | null = null;

export function collectNetwork(): NetStats {
  try {
    const content = fs.readFileSync(`${PROC_BASE}/net/dev`, 'utf-8');
    const lines = content.split('\n').slice(2); // skip headers

    let totalRx = 0;
    let totalTx = 0;

    for (const line of lines) {
      const parts = line.trim().split(/\s+/);
      if (parts.length < 10) continue;
      const iface = parts[0].replace(':', '');
      if (iface === 'lo') continue; // skip loopback

      totalRx += parseInt(parts[1], 10);
      totalTx += parseInt(parts[9], 10);
    }

    const current: NetStats = { rx_bytes: totalRx, tx_bytes: totalTx };

    if (!prevNet) {
      prevNet = current;
      return { rx_bytes: 0, tx_bytes: 0 };
    }

    const delta: NetStats = {
      rx_bytes: current.rx_bytes - prevNet.rx_bytes,
      tx_bytes: current.tx_bytes - prevNet.tx_bytes,
    };
    prevNet = current;

    return delta;
  } catch (err: any) {
    console.error('[metrics] Failed to read /proc/net/dev:', err.message);
    return { rx_bytes: 0, tx_bytes: 0 };
  }
}

export async function collectDisk(): Promise<{ used: number; total: number }> {
  try {
    const { statfs } = await import('fs/promises');
    const stats = await statfs('/');
    const total = stats.blocks * stats.bsize;
    const free = stats.bfree * stats.bsize;
    return { used: total - free, total };
  } catch (err: any) {
    console.error('[metrics] Failed to statfs /:', err.message);
    return { used: 0, total: 0 };
  }
}
