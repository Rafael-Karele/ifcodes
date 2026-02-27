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
  value: number | string;
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

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <div className="px-1 pt-3 pb-1">
      <span className="text-xs font-semibold uppercase tracking-wider text-stone-400">
        {children}
      </span>
    </div>
  );
}

export function QueueStats({ queue }: QueueStatsProps) {
  return (
    <SectionCard title="Fila de Processamento" icon={Activity}>
      <div className="px-4 sm:px-6 divide-y divide-stone-100">
        <SectionLabel>Laravel Queue</SectionLabel>
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

        <SectionLabel>Judge0 Workers</SectionLabel>
        <QueueItem
          label="Fila Judge0"
          value={queue.judge0_queue_size}
          variant={queue.judge0_queue_size > 10 ? "warning" : undefined}
        />
        <QueueItem
          label="Workers Ativos"
          value={`${queue.judge0_workers_working} / ${queue.judge0_workers_available}`}
        />
        <QueueItem label="Workers Ociosos" value={queue.judge0_workers_idle} />
        <QueueItem
          label="Workers Pausados"
          value={queue.judge0_workers_paused}
          variant={queue.judge0_workers_paused > 0 ? "warning" : undefined}
        />
        <QueueItem
          label="Falhados Judge0"
          value={queue.judge0_workers_failed}
          variant={queue.judge0_workers_failed > 0 ? "danger" : undefined}
        />
      </div>
    </SectionCard>
  );
}
