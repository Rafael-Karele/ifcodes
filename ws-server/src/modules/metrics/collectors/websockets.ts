import { getJamStats } from '../../jam/handler';
import { getNotificationStats } from '../../notifications/handler';

export function collectWebSocketStats() {
  const jam = getJamStats();
  const notifications = getNotificationStats();

  return {
    jam_connections: jam.connections,
    notification_connections: notifications.connections,
    active_jam_sessions: jam.activeSessions,
  };
}
