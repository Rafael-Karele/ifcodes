import { Wifi } from "lucide-react";
import { SectionCard } from "@/components/SectionCard";
import type { WebSocketMetrics } from "../hooks/useMetrics";

interface WebSocketStatsProps {
  websockets: WebSocketMetrics;
}

function Stat({ label, value }: { label: string; value: number }) {
  return (
    <div className="flex items-center justify-between py-2.5 px-1">
      <span className="text-sm text-stone-600">{label}</span>
      <span className="text-lg font-bold text-stone-900 tabular-nums">
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
      </div>
    </SectionCard>
  );
}
