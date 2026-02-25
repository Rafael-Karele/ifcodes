import { formatDistanceToNow } from "date-fns";
import { ptBR } from "date-fns/locale/pt-BR";
import { StatusBadge, submissionStatusConfig, type SubmissionStatusKey } from "@/components/StatusBadge";
import type { Submission } from "@/types";

interface SubmissionFeedProps {
  submissions: Submission[];
}

const langDotColor: Record<string, string> = {
  c: "#3b82f6",
  cpp: "#8b5cf6",
  java: "#f97316",
  python: "#22c55e",
};

export function SubmissionFeed({ submissions }: SubmissionFeedProps) {
  if (submissions.length === 0) {
    return (
      <div className="text-sm text-stone-400 text-center py-8">
        Nenhuma submissão recente
      </div>
    );
  }

  return (
    <div className="divide-y divide-stone-100">
      {submissions.map((sub, i) => {
        const cfg = submissionStatusConfig[sub.status as SubmissionStatusKey] ?? submissionStatusConfig.unknown;
        return (
          <div
            key={sub.id}
            className="flex items-center gap-3 px-5 py-3 feed-row"
            style={{ animationDelay: `${i * 40}ms` }}
          >
            <span
              className="w-2.5 h-2.5 rounded-full shrink-0"
              style={{ backgroundColor: langDotColor[sub.language] ?? "#a8a29e" }}
              title={sub.language}
            />
            <div className="min-w-0 flex-1">
              <p className="text-sm font-medium text-stone-700 truncate">
                {sub.problemTitle ?? `Submissão #${sub.id}`}
              </p>
              <p className="text-[11px] text-stone-400">
                {formatDistanceToNow(new Date(sub.dateSubmitted), { addSuffix: true, locale: ptBR })}
              </p>
            </div>
            <StatusBadge label={cfg.label} className={cfg.className} />
          </div>
        );
      })}
    </div>
  );
}
