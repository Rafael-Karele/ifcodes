interface StatusBadgeProps {
  label: string;
  className: string;
}

export function StatusBadge({ label, className }: StatusBadgeProps) {
  return (
    <span className={`text-xs font-medium px-2 py-0.5 rounded-md ${className}`}>
      {label}
    </span>
  );
}

/* ── pre-built config maps ────────────────────────── */

export const activityStatusConfig = {
  completed: {
    label: "Concluída",
    className: "bg-emerald-50 text-emerald-600",
    barColor: "bg-emerald-500",
  },
  pending: {
    label: "Pendente",
    className: "bg-amber-100 text-amber-700",
    barColor: "bg-amber-500",
  },
  overdue: {
    label: "Atrasada",
    className: "bg-red-100 text-red-700",
    barColor: "bg-red-500",
  },
  draft: {
    label: "Rascunho",
    className: "bg-zinc-100 text-zinc-500",
    barColor: "bg-zinc-300",
  },
} as const;

export type ActivityStatusKey = keyof typeof activityStatusConfig;

export const submissionStatusConfig = {
  passed: {
    label: "Aceito",
    className: "bg-emerald-50 text-emerald-600",
  },
  failed: {
    label: "Resposta Errada",
    className: "bg-red-100 text-red-700",
  },
  pending: {
    label: "Pendente",
    className: "bg-amber-100 text-amber-700",
  },
  processing: {
    label: "Processando",
    className: "bg-zinc-100 text-zinc-500",
  },
  "compile-error": {
    label: "Erro de Compilação",
    className: "bg-red-100 text-red-700",
  },
  timeout: {
    label: "Tempo Limite",
    className: "bg-amber-100 text-amber-700",
  },
  "runtime-error": {
    label: "Erro de Execução",
    className: "bg-red-100 text-red-700",
  },
  "internal-error": {
    label: "Erro Interno",
    className: "bg-zinc-100 text-zinc-500",
  },
  unknown: {
    label: "Desconhecido",
    className: "bg-zinc-100 text-zinc-500",
  },
} as const;

export type SubmissionStatusKey = keyof typeof submissionStatusConfig;
