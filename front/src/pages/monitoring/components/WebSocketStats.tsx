import { Wifi } from "lucide-react";
import { SectionCard } from "@/components/SectionCard";
import type { WebSocketMetrics } from "../hooks/useMetrics";

interface WebSocketStatsProps {
  websockets: WebSocketMetrics;
}

function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function Stat({ label, value }: { label: string; value: number | string }) {
  return (
    <div className="flex items-center justify-between py-2.5 px-1">
      <span className="text-sm text-stone-600">{label}</span>
      <span className="text-lg font-bold text-stone-900 tabular-nums">
        {value}
      </span>
    </div>
  );
}

function LatencyStat({ latency }: { latency: number }) {
  const color =
    latency < 0
      ? "text-stone-400"
      : latency < 50
        ? "text-emerald-600"
        : latency < 200
          ? "text-amber-600"
          : "text-red-600";

  const display = latency < 0 ? "--" : `${latency} ms`;

  return (
    <div className="flex items-center justify-between py-2.5 px-1">
      <span className="text-sm text-stone-600">Latencia</span>
      <span className={`text-lg font-bold tabular-nums ${color}`}>
        {display}
      </span>
    </div>
  );
}

function ErrorStat({ label, value }: { label: string; value: number }) {
  const color = value > 0 ? "text-red-600" : "text-stone-900";
  return (
    <div className="flex items-center justify-between py-2.5 px-1">
      <span className="text-sm text-stone-600">{label}</span>
      <span className={`text-lg font-bold tabular-nums ${color}`}>
        {value}
      </span>
    </div>
  );
}

export function WebSocketStats({ websockets }: WebSocketStatsProps) {
  return (
    <SectionCard title="WebSocket" icon={Wifi}>
      <div className="px-4 sm:px-6 divide-y divide-stone-100">
        <Stat label="Conexoes Jam" value={websockets.jam_connections} />
        <Stat
          label="Conexoes Notificacao"
          value={websockets.notification_connections}
        />
        <Stat
          label="Sessoes Jam Ativas"
          value={websockets.active_jam_sessions}
        />
        <LatencyStat latency={websockets.avg_latency_ms} />
        <Stat
          label="Msgs/s Jam"
          value={websockets.jam_msgs_per_sec}
        />
        <Stat
          label="Msgs/s Notificacoes"
          value={websockets.notif_msgs_per_sec}
        />
        <ErrorStat label="Erros Jam" value={websockets.jam_errors} />
        <ErrorStat label="Erros Notificacoes" value={websockets.notif_errors} />
        <Stat label="Desconexoes Jam" value={websockets.jam_disconnects} />
        <Stat
          label="Desconexoes Notificacoes"
          value={websockets.notif_disconnects}
        />
        <Stat
          label="Payload Jam"
          value={`${formatBytes(websockets.jam_bytes_in)} / ${formatBytes(websockets.jam_bytes_out)}`}
        />
        <Stat
          label="Payload Notificacoes"
          value={`${formatBytes(websockets.notif_bytes_in)} / ${formatBytes(websockets.notif_bytes_out)}`}
        />
      </div>
    </SectionCard>
  );
}
