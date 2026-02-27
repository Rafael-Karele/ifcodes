import { getJamStats } from '../../jam/handler';
import { getNotificationStats } from '../../notifications/handler';

// State for msgs/s calculation
let lastJamMsgCount = 0;
let lastNotifMsgCount = 0;
let lastCollectedAt = Date.now();

// Latency value pushed from the metrics handler (avoids circular import)
let currentLatencyMs = -1;

export function setLatencyMs(ms: number): void {
  currentLatencyMs = ms;
}

export function collectWebSocketStats() {
  const jam = getJamStats();
  const notifications = getNotificationStats();

  // Calculate messages per second since last collection
  const now = Date.now();
  const elapsed = (now - lastCollectedAt) / 1000;

  const jamMsgsPerSec = elapsed > 0 ? (jam.msgCount - lastJamMsgCount) / elapsed : 0;
  const notifMsgsPerSec = elapsed > 0 ? (notifications.msgCount - lastNotifMsgCount) / elapsed : 0;

  lastJamMsgCount = jam.msgCount;
  lastNotifMsgCount = notifications.msgCount;
  lastCollectedAt = now;

  return {
    jam_connections: jam.connections,
    notification_connections: notifications.connections,
    active_jam_sessions: jam.activeSessions,
    jam_msgs_per_sec: Math.round(jamMsgsPerSec * 10) / 10,
    notif_msgs_per_sec: Math.round(notifMsgsPerSec * 10) / 10,
    jam_errors: jam.errorCount,
    notif_errors: notifications.errorCount,
    jam_disconnects: jam.disconnectCount,
    notif_disconnects: notifications.disconnectCount,
    avg_latency_ms: currentLatencyMs,
    jam_bytes_in: jam.bytesIn,
    jam_bytes_out: jam.bytesOut,
    notif_bytes_in: notifications.bytesIn,
    notif_bytes_out: notifications.bytesOut,
  };
}
