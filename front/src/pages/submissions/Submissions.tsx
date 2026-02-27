import { useMemo, useState } from "react";
import type { Submission } from "@/types";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/table";
import { useNavigate } from "react-router";
import {
  FileText,
  Calendar,
  Clock,
  CheckCircle2,
  TrendingUp,
  Target,
  ArrowRight,
} from "lucide-react";
import { StatusBadge, submissionStatusConfig, type SubmissionStatusKey } from "@/components/StatusBadge";
import { StatCard } from "@/components/StatCard";
import { SearchFilter } from "@/components/SearchFilter";
import { HeroHeader } from "@/components/HeroHeader";
import { EmptyState } from "@/components/EmptyState";
import { useData } from "@/context/DataContext";
import Loading from "@/components/Loading";


export default function Submissions() {
  const navigate = useNavigate();

  const { loading, submissions } = useData();

  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");

  // Calcula estatisticas rapidas sobre as submissoes
  const stats = useMemo(() => {
    const total = submissions.length;
    const accepted = submissions.filter((s) => s.status === "passed").length;
    const rejected = submissions.filter((s) =>
      s.status === "failed" ||
      s.status === "compile-error" ||
      s.status === "timeout" ||
      s.status === "runtime-error"
    ).length;
    const pending = submissions.filter(
      (s) => s.status === "pending" || s.status === "processing"
    ).length;
    const acceptanceRate = total > 0 ? Math.round((accepted / total) * 100) : 0;

    return { total, accepted, rejected, pending, acceptanceRate };
  }, [submissions]);

  // Redireciona para o detalhe da submissao ao clicar na linha da tabela
  function redirectToSubmission(submission: Submission) {
    navigate(`/submissions/${submission.activityId}/${submission.id}`);
  }

  // Filtra submissoes pelo termo de busca e filtro de status
  const filteredSubmissions = submissions.filter((submission) => {
    const problemTitle = submission.problemTitle || "";
    const matchesSearch = problemTitle
      .toLowerCase()
      .includes(searchTerm.toLowerCase());
    const matchesStatus =
      statusFilter === "all" || submission.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  // Ordena submissoes da mais recente para a mais antiga
  const sortedSubmissions = [...filteredSubmissions].sort(
    (a, b) =>
      new Date(b.dateSubmitted).getTime() - new Date(a.dateSubmitted).getTime()
  );

  // Obtem os status unicos presentes para montar o filtro do select
  const uniqueStatuses = [...new Set(submissions.map((s) => s.status))];

  const isFiltered = searchTerm || statusFilter !== "all";

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-3 sm:py-5 min-h-[80vh]">
      {/* ---- scoped keyframes ---- */}
      <style>{`
        @keyframes submissions-fade-in {
          from { opacity: 0; transform: translateY(10px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        .sub-row {
          animation: submissions-fade-in .35s cubic-bezier(.22,1,.36,1) both;
        }
      `}</style>

      {/* ═══════ HERO / HEADER AREA ═══════ */}
      <HeroHeader
        icon={FileText}
        title="Submissões"
        description="Acompanhe o histórico de todas as suas submissões e monitore seu progresso."
      />

      {/* ═══════ STAT CARDS ═══════ */}
      {!loading && (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-8">
          <StatCard label="Total" value={stats.total} icon={FileText} />
          <StatCard label="Aceitas" value={stats.accepted} icon={CheckCircle2} />
          <StatCard label="Taxa de Sucesso" value={`${stats.acceptanceRate}%`} icon={TrendingUp} />
          <StatCard label="Pendentes" value={stats.pending} icon={Clock} />
        </div>
      )}

      {/* ═══════ SEARCH + FILTER BAR ═══════ */}
      <div className="mb-6">
      <SearchFilter
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
        placeholder="Buscar por problema..."
        statusFilter={statusFilter}
        onStatusFilterChange={setStatusFilter}
        statusOptions={uniqueStatuses.map((status) => ({
          value: status,
          label: submissionStatusConfig[status as SubmissionStatusKey]?.label || status,
        }))}
      />
      </div>

      {/* ═══════ TABLE ═══════ */}
      <div className="rounded-xl border border-stone-200 bg-white overflow-hidden shadow-sm">
        {loading ? (
          <div className="p-6">
            <Loading />
          </div>
        ) : sortedSubmissions.length === 0 ? (
          /* ── empty state ── */
          <EmptyState
            icon={FileText}
            title={isFiltered ? "Nenhuma submissao encontrada" : "Nenhuma submissao ainda"}
            description={
              isFiltered
                ? "Tente ajustar os filtros de busca."
                : "Suas submissoes aparecerao aqui quando voce enviar solucoes."
            }
          />
        ) : (
          <Table>
            <TableHeader>
              <TableRow className="bg-stone-50 hover:bg-stone-50">
                <TableHead className="font-semibold text-stone-900">
                  <div className="flex items-center gap-2">
                    <Target className="w-4 h-4" />
                    Problema
                  </div>
                </TableHead>
                <TableHead className="hidden sm:table-cell font-semibold text-stone-900">
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4" />
                    Data de Submissao
                  </div>
                </TableHead>
                <TableHead className="font-semibold text-stone-900">
                  Status
                </TableHead>
                <TableHead className="w-12"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {sortedSubmissions.map((submission, i) => {
                const formattedDateOnly = new Date(
                  submission.dateSubmitted
                ).toLocaleDateString("pt-BR", {
                  day: "2-digit",
                  month: "2-digit",
                  year: "numeric",
                  hour: "2-digit",
                  minute: "2-digit",
                });

                // Usa o titulo do problema que vem do backend
                const problemTitle = submission.problemTitle || "Problema nao encontrado";

                return (
                  <TableRow
                    key={submission.id}
                    onClick={() => redirectToSubmission(submission)}
                    className="sub-row cursor-pointer hover:bg-teal-50 transition-colors duration-200 group"
                  >
                    <TableCell className="font-medium text-sm max-w-0">
                      <div className="flex flex-col">
                        <span className="text-stone-900 group-hover:text-teal-600 transition-colors truncate">
                          {problemTitle}
                        </span>
                        <span className="text-xs mt-1 text-teal-600 truncate">
                          Atividade ID: {submission.activityId} - Submissao ID: {submission.id}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell className="hidden sm:table-cell text-sm">
                      <div className="flex flex-col">
                        <span className="font-medium text-stone-900">
                          {formattedDateOnly}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell className="whitespace-nowrap text-sm">
                      {(() => {
                        const cfg = submissionStatusConfig[submission.status as SubmissionStatusKey] ?? submissionStatusConfig.unknown;
                        return <StatusBadge label={cfg.label} className={cfg.className} />;
                      })()}
                    </TableCell>
                    <TableCell>
                      <ArrowRight className="w-4 h-4 text-stone-400 group-hover:text-teal-600 transition-colors" />
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        )}
      </div>

      {/* Rodape com info sobre os filtros aplicados */}
      {!loading && sortedSubmissions.length > 0 && (
        <div className="text-center text-sm mt-6 text-stone-500">
          Mostrando {sortedSubmissions.length} de {submissions.length}{" "}
          submissoes
          {isFiltered && " (filtradas)"}
        </div>
      )}
    </div>
  );
}
