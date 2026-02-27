import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/table";
import { Button } from "@/components/ui/button";
import { SectionCard } from "@/components/SectionCard";
import { EmptyState } from "@/components/EmptyState";
import {
  StatusBadge,
  submissionStatusConfig,
  type SubmissionStatusKey,
} from "@/components/StatusBadge";
import type { Submission } from "@/types";
import {
  FileText,
  RefreshCw,
  ArrowRight,
  Loader2,
} from "lucide-react";
import { formatDate } from "./utils";

interface SubmissionsHistoryProps {
  submissions: Submission[];
  highlightedId: number | null;
  loading: boolean;
  onRefresh: () => void;
  onSubmissionClick: (submission: Submission) => void;
}

export function SubmissionsHistory({
  submissions,
  highlightedId,
  loading,
  onRefresh,
  onSubmissionClick,
}: SubmissionsHistoryProps) {
  return (
    <SectionCard
      title="Hist\u00f3rico de Submiss\u00f5es"
      icon={FileText}
      action={
        <Button
          variant="outline"
          size="sm"
          onClick={onRefresh}
          disabled={loading}
        >
          <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
          {loading ? "Atualizando..." : "Atualizar"}
        </Button>
      }
    >
      <div className="px-3 py-4 sm:px-6 sm:py-6">
        {loading ? (
          <div className="flex flex-col items-center gap-4 py-8">
            <Loader2 className="w-6 h-6 animate-spin text-teal-600" />
            <p className="text-sm text-stone-500 font-medium">
              Carregando submiss\u00f5es...
            </p>
          </div>
        ) : submissions.length === 0 ? (
          <EmptyState
            icon={FileText}
            title="Nenhuma submiss\u00e3o para esta atividade"
            description="Use o editor acima para enviar seu c\u00f3digo."
          />
        ) : (
          <>
            {/* Desktop table */}
            <div className="hidden sm:block overflow-hidden rounded-lg border border-stone-200">
              <Table>
                <TableHeader>
                  <TableRow className="bg-stone-50 hover:bg-stone-50">
                    <TableHead className="font-semibold text-stone-700 text-xs">
                      Data de Submiss\u00e3o
                    </TableHead>
                    <TableHead className="font-semibold text-stone-700 text-xs">
                      Status
                    </TableHead>
                    <TableHead className="w-12" />
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {submissions.map((submission) => {
                    const submissionDate = formatDate(submission.dateSubmitted);
                    const statusKey = submission.status as SubmissionStatusKey;
                    const statusCfg =
                      submissionStatusConfig[statusKey] ||
                      submissionStatusConfig.pending;
                    return (
                      <TableRow
                        key={submission.id}
                        onClick={() => onSubmissionClick(submission)}
                        className={`cursor-pointer hover:bg-stone-50 transition-all duration-500 group ${
                          highlightedId === submission.id
                            ? "bg-teal-50 ring-1 ring-teal-200"
                            : ""
                        }`}
                      >
                        <TableCell>
                          <div className="flex flex-col">
                            <span className="text-stone-800 text-sm font-medium">
                              {submissionDate.formatted}
                            </span>
                            <span className="text-xs text-stone-400">
                              {submissionDate.relative}
                            </span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <StatusBadge
                            label={statusCfg.label}
                            className={statusCfg.className}
                          />
                        </TableCell>
                        <TableCell>
                          <ArrowRight className="w-4 h-4 text-stone-300 group-hover:text-teal-600 transition-colors" />
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>

            {/* Mobile card list */}
            <div className="flex flex-col gap-2 sm:hidden">
              {submissions.map((submission) => {
                const submissionDate = formatDate(submission.dateSubmitted);
                const statusKey = submission.status as SubmissionStatusKey;
                const statusCfg =
                  submissionStatusConfig[statusKey] ||
                  submissionStatusConfig.pending;
                return (
                  <button
                    key={submission.id}
                    type="button"
                    onClick={() => onSubmissionClick(submission)}
                    className={`flex items-center justify-between rounded-lg border px-3 py-3 text-left transition-all duration-500 ${
                      highlightedId === submission.id
                        ? "border-teal-200 bg-teal-50"
                        : "border-stone-200 bg-white hover:bg-stone-50"
                    }`}
                  >
                    <div className="flex flex-col gap-1">
                      <span className="text-sm font-medium text-stone-800">
                        {submissionDate.formatted}
                      </span>
                      <span className="text-xs text-stone-400">
                        {submissionDate.relative}
                      </span>
                      <StatusBadge
                        label={statusCfg.label}
                        className={statusCfg.className}
                      />
                    </div>
                    <ArrowRight className="w-4 h-4 shrink-0 text-stone-300" />
                  </button>
                );
              })}
            </div>
          </>
        )}
      </div>
    </SectionCard>
  );
}
