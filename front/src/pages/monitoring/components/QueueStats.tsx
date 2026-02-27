import { Activity } from "lucide-react";
import { SectionCard } from "@/components/SectionCard";
import type { QueueMetrics } from "../hooks/useMetrics";

interface QueueStatsProps {
  queue: QueueMetrics;
}

function QueueItem({
  label,
  value,
  variant,
}: {
  label: string;
  value: number;
  variant?: "warning" | "danger";
}) {
  const valueColor =
    variant === "danger"
      ? "text-red-600"
      : variant === "warning"
        ? "text-amber-600"
        : "text-stone-900";

  return (
    <div className="flex items-center justify-between py-2.5 px-1">
      <span className="text-sm text-stone-600">{label}</span>
      <span className={`text-lg font-bold tabular-nums ${valueColor}`}>
        {value}
      </span>
    </div>
  );
}

export function QueueStats({ queue }: QueueStatsProps) {
  return (
    <SectionCard title="Fila de Processamento" icon={Activity}>
      <div className="px-4 sm:px-6 divide-y divide-stone-100">
        <QueueItem
          label="Pendentes"
          value={queue.pending}
          variant={queue.pending > 10 ? "warning" : undefined}
        />
        <QueueItem label="Processando" value={queue.reserved} />
        <QueueItem label="Atrasados" value={queue.delayed} />
        <QueueItem
          label="Falhados"
          value={queue.failed}
          variant={queue.failed > 0 ? "danger" : undefined}
        />
      </div>
    </SectionCard>
  );
}
