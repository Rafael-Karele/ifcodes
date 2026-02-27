import { Server } from "lucide-react";
import { SectionCard } from "@/components/SectionCard";

function formatBytes(bytes: number): string {
  if (bytes === 0) return "0 B";
  const units = ["B", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(1024));
  const value = bytes / Math.pow(1024, i);
  return `${value.toFixed(1)} ${units[i]}`;
}

interface NetworkStatsProps {
  rxBytes: number;
  txBytes: number;
}

export function NetworkStats({ rxBytes, txBytes }: NetworkStatsProps) {
  return (
    <SectionCard title="Trafego de Rede" icon={Server}>
      <div className="px-4 sm:px-6 divide-y divide-stone-100">
        <div className="flex items-center justify-between py-2.5 px-1">
          <span className="text-sm text-stone-600">Recebido (delta)</span>
          <span className="text-lg font-bold text-stone-900 tabular-nums">
            {formatBytes(rxBytes)}
          </span>
        </div>
        <div className="flex items-center justify-between py-2.5 px-1">
          <span className="text-sm text-stone-600">Enviado (delta)</span>
          <span className="text-lg font-bold text-stone-900 tabular-nums">
            {formatBytes(txBytes)}
          </span>
        </div>
      </div>
    </SectionCard>
  );
}
