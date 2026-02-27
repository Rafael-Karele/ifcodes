import { Server, Loader2, WifiOff } from "lucide-react";
import { useMetrics } from "./hooks/useMetrics";
import { VpsOverview } from "./components/VpsOverview";
import { ContainerGrid } from "./components/ContainerGrid";
import { WebSocketStats } from "./components/WebSocketStats";
import { QueueStats } from "./components/QueueStats";
import { NetworkStats } from "./components/NetworkStats";

function formatUptime(seconds: number): string {
  const d = Math.floor(seconds / 86400);
  const h = Math.floor((seconds % 86400) / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const parts: string[] = [];
  if (d > 0) parts.push(`${d}d`);
  if (h > 0) parts.push(`${h}h`);
  parts.push(`${m}m`);
  return parts.join(" ");
}

function LoadingState() {
  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-16">
      <div className="bg-stone-50 border border-stone-200 rounded-xl p-12 flex flex-col items-center gap-4">
        <Loader2 className="w-6 h-6 animate-spin text-teal-600" />
        <p className="text-sm text-stone-500 font-medium">
          Conectando ao servidor de metricas...
        </p>
      </div>
    </div>
  );
}

function ErrorState({ status }: { status: string }) {
  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-16">
      <div className="bg-red-50 border border-red-200 rounded-xl p-12 flex flex-col items-center gap-4">
        <WifiOff className="w-6 h-6 text-red-500" />
        <p className="text-sm text-red-600 font-medium">
          {status === "error"
            ? "Erro ao conectar. Verifique suas permissoes de admin."
            : "Conexao perdida. Reconectando..."}
        </p>
      </div>
    </div>
  );
}

export default function Monitoring() {
  const { metrics, status } = useMetrics();

  if (!metrics && (status === "connecting" || status === "connected")) {
    return <LoadingState />;
  }

  if (!metrics) {
    return <ErrorState status={status} />;
  }

  const totalWs =
    metrics.websockets.jam_connections +
    metrics.websockets.notification_connections;

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-10 space-y-6">
      {/* Hero Header */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-stone-900 via-stone-800 to-stone-900 px-6 py-8 sm:px-8 sm:py-10">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-teal-500/10 via-transparent to-transparent" />
        <div className="relative">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 rounded-lg bg-teal-500/20">
              <Server className="w-5 h-5 text-teal-400" />
            </div>
            <h1 className="text-xl sm:text-2xl font-bold text-white">
              Monitoramento do Sistema
            </h1>
          </div>
          <div className="flex items-center gap-4 mt-3">
            <p className="text-sm text-stone-400">
              Uptime: {formatUptime(metrics.system.uptime_seconds)}
            </p>
            {status === "connected" && (
              <span className="inline-flex items-center gap-1.5 text-xs text-emerald-400">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                Ao vivo
              </span>
            )}
            {status === "disconnected" && (
              <span className="inline-flex items-center gap-1.5 text-xs text-amber-400">
                <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
                Reconectando...
              </span>
            )}
          </div>
        </div>
      </div>

      {/* VPS Overview (StatCards + Resource Details) */}
      <VpsOverview system={metrics.system} totalWsConnections={totalWs} />

      {/* Containers */}
      <ContainerGrid containers={metrics.containers} />

      {/* Bottom grid: Network + Queue + WebSocket */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <NetworkStats
          rxBytes={metrics.system.net_rx_bytes}
          txBytes={metrics.system.net_tx_bytes}
        />
        <QueueStats queue={metrics.queue} />
        <WebSocketStats websockets={metrics.websockets} />
      </div>
    </div>
  );
}
