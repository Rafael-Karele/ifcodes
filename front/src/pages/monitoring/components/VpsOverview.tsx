import { Cpu, MemoryStick, HardDrive, Wifi } from "lucide-react";
import { StatCard } from "@/components/StatCard";
import { SectionCard } from "@/components/SectionCard";
import type { SystemMetrics } from "../hooks/useMetrics";

function formatBytes(bytes: number): string {
  if (bytes === 0) return "0 B";
  const units = ["B", "KB", "MB", "GB", "TB"];
  const i = Math.floor(Math.log(bytes) / Math.log(1024));
  const value = bytes / Math.pow(1024, i);
  return `${value.toFixed(1)} ${units[i]}`;
}

function ProgressBar({ value, color }: { value: number; color: string }) {
  return (
    <div className="w-full bg-stone-100 rounded-full h-2 mt-1">
      <div
        className={`h-2 rounded-full transition-all duration-500 ${color}`}
        style={{ width: `${Math.min(100, value)}%` }}
      />
    </div>
  );
}

interface VpsOverviewProps {
  system: SystemMetrics;
  totalWsConnections: number;
}

export function VpsOverview({ system, totalWsConnections }: VpsOverviewProps) {
  const ramPercent =
    system.ram_total_bytes > 0
      ? Math.round((system.ram_used_bytes / system.ram_total_bytes) * 100)
      : 0;
  const diskPercent =
    system.disk_total_bytes > 0
      ? Math.round((system.disk_used_bytes / system.disk_total_bytes) * 100)
      : 0;

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <StatCard
          label="CPU"
          value={`${system.cpu_percent}%`}
          icon={Cpu}
          accent={system.cpu_percent > 80}
        />
        <StatCard
          label="RAM"
          value={`${ramPercent}%`}
          icon={MemoryStick}
          accent={ramPercent > 85}
        />
        <StatCard
          label="Disco"
          value={`${diskPercent}%`}
          icon={HardDrive}
          accent={diskPercent > 90}
        />
        <StatCard
          label="Conexoes WS"
          value={totalWsConnections}
          icon={Wifi}
        />
      </div>

      <SectionCard title="Detalhes de Recursos" icon={Cpu}>
        <div className="px-4 py-4 sm:px-6 space-y-4">
          <div>
            <div className="flex justify-between text-sm">
              <span className="text-stone-600">CPU</span>
              <span className="font-medium text-stone-900">{system.cpu_percent}%</span>
            </div>
            <ProgressBar
              value={system.cpu_percent}
              color={system.cpu_percent > 80 ? "bg-red-500" : "bg-teal-500"}
            />
          </div>

          <div>
            <div className="flex justify-between text-sm">
              <span className="text-stone-600">RAM</span>
              <span className="font-medium text-stone-900">
                {formatBytes(system.ram_used_bytes)} / {formatBytes(system.ram_total_bytes)}
              </span>
            </div>
            <ProgressBar
              value={ramPercent}
              color={ramPercent > 85 ? "bg-red-500" : "bg-teal-500"}
            />
          </div>

          <div>
            <div className="flex justify-between text-sm">
              <span className="text-stone-600">Disco</span>
              <span className="font-medium text-stone-900">
                {formatBytes(system.disk_used_bytes)} / {formatBytes(system.disk_total_bytes)}
              </span>
            </div>
            <ProgressBar
              value={diskPercent}
              color={diskPercent > 90 ? "bg-red-500" : "bg-teal-500"}
            />
          </div>
        </div>
      </SectionCard>
    </div>
  );
}
