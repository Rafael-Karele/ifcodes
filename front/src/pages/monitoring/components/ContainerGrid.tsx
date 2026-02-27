import { Layers } from "lucide-react";
import { SectionCard } from "@/components/SectionCard";
import { formatBytes } from "@/utils/formatBytes";
import type { ContainerMetrics } from "../hooks/useMetrics";

function StateBadge({ state }: { state: string }) {
  const isRunning = state === "running";
  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-xs font-medium ${
        isRunning
          ? "bg-emerald-50 text-emerald-700"
          : "bg-stone-100 text-stone-600"
      }`}
    >
      <span
        className={`w-1.5 h-1.5 rounded-full ${
          isRunning ? "bg-emerald-500" : "bg-stone-400"
        }`}
      />
      {state}
    </span>
  );
}

function MiniBar({ value, color }: { value: number; color: string }) {
  return (
    <div className="w-full bg-stone-100 rounded-full h-1.5">
      <div
        className={`h-1.5 rounded-full transition-all duration-500 ${color}`}
        style={{ width: `${Math.min(100, value)}%` }}
      />
    </div>
  );
}

interface ContainerGridProps {
  containers: ContainerMetrics[];
}

export function ContainerGrid({ containers }: ContainerGridProps) {
  if (containers.length === 0) {
    return (
      <SectionCard title="Containers Docker" icon={Layers}>
        <div className="px-4 py-8 text-center text-sm text-stone-400">
          Nenhum container encontrado
        </div>
      </SectionCard>
    );
  }

  return (
    <SectionCard
      title="Containers Docker"
      icon={Layers}
      action={
        <span className="text-xs text-stone-400 font-medium">
          {containers.length} containers
        </span>
      }
    >
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-px bg-stone-100">
        {containers.map((c) => (
          <div key={c.name} className="bg-white p-4 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm font-semibold text-stone-800 truncate">
                {c.name}
              </span>
              <StateBadge state={c.state} />
            </div>

            <div className="space-y-2">
              <div>
                <div className="flex justify-between text-xs text-stone-500 mb-0.5">
                  <span>CPU</span>
                  <span className="font-medium text-stone-700">{c.cpu_percent}%</span>
                </div>
                <MiniBar
                  value={c.cpu_percent}
                  color={c.cpu_percent > 80 ? "bg-red-500" : "bg-teal-500"}
                />
              </div>

              <div>
                <div className="flex justify-between text-xs text-stone-500 mb-0.5">
                  <span>RAM</span>
                  <span className="font-medium text-stone-700">
                    {formatBytes(c.memory_used_bytes)}
                  </span>
                </div>
                <MiniBar
                  value={c.memory_percent}
                  color={c.memory_percent > 80 ? "bg-red-500" : "bg-teal-500"}
                />
              </div>

              <div className="flex justify-between text-xs text-stone-500 pt-1">
                <span>Rede: {formatBytes(c.net_rx_bytes)} in</span>
                <span>{formatBytes(c.net_tx_bytes)} out</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </SectionCard>
  );
}
