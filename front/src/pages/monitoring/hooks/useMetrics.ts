import { useEffect, useRef, useState, useCallback } from "react";

export interface SystemMetrics {
  cpu_percent: number;
  ram_used_bytes: number;
  ram_total_bytes: number;
  disk_used_bytes: number;
  disk_total_bytes: number;
  net_rx_bytes: number;
  net_tx_bytes: number;
  uptime_seconds: number;
}

export interface ContainerMetrics {
  name: string;
  state: string;
  cpu_percent: number;
  memory_used_bytes: number;
  memory_limit_bytes: number;
  memory_percent: number;
  net_rx_bytes: number;
  net_tx_bytes: number;
}

export interface WebSocketMetrics {
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
  jam_bytes_in: number;
  jam_bytes_out: number;
  notif_bytes_in: number;
  notif_bytes_out: number;
}

export interface QueueMetrics {
  pending: number;
  reserved: number;
  delayed: number;
  failed: number;
  judge0_queue_size: number;
  judge0_workers_available: number;
  judge0_workers_idle: number;
  judge0_workers_working: number;
  judge0_workers_paused: number;
  judge0_workers_failed: number;
}

export interface MetricsSnapshot {
  system: SystemMetrics;
  containers: ContainerMetrics[];
  websockets: WebSocketMetrics;
  queue: QueueMetrics;
  collected_at: string;
}

type ConnectionStatus = "connecting" | "connected" | "disconnected" | "error";

export function useMetrics() {
  const [metrics, setMetrics] = useState<MetricsSnapshot | null>(null);
  const [status, setStatus] = useState<ConnectionStatus>("connecting");
  const wsRef = useRef<WebSocket | null>(null);
  const reconnectRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const connect = useCallback(() => {
    const token = localStorage.getItem("auth_token");
    if (!token) {
      setStatus("error");
      return;
    }

    const wsUrl = import.meta.env.VITE_WS_URL || "ws://localhost:3002";
    const ws = new WebSocket(`${wsUrl}/admin/metrics`);
    wsRef.current = ws;

    ws.onopen = () => {
      ws.send(JSON.stringify({ type: "AUTH_METRICS", token }));
    };

    ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        if (data.type === "AUTH_OK") {
          setStatus("connected");
          return;
        }
        if (data.type === "ERROR") {
          setStatus("error");
          ws.close();
          return;
        }
        // Metrics snapshot
        if (data.system) {
          setMetrics(data);
        }
      } catch {
        // ignore parse errors
      }
    };

    ws.onclose = () => {
      setStatus("disconnected");
      wsRef.current = null;
      // Reconnect after 3 seconds
      reconnectRef.current = setTimeout(connect, 3000);
    };

    ws.onerror = () => {
      setStatus("error");
    };
  }, []);

  useEffect(() => {
    connect();

    return () => {
      if (wsRef.current) {
        wsRef.current.close();
        wsRef.current = null;
      }
      if (reconnectRef.current) {
        clearTimeout(reconnectRef.current);
        reconnectRef.current = null;
      }
    };
  }, [connect]);

  return { metrics, status };
}
