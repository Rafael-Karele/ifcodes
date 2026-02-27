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
  RefreshCw,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { StatusBadge, submissionStatusConfig, type SubmissionStatusKey } from "@/components/StatusBadge";
import { StatCard } from "@/components/StatCard";
import { SearchFilter } from "@/components/SearchFilter";
import { useData } from "@/context/DataContext";
import Loading from "@/components/Loading";

/* ── palette tokens (inline, no global leak) ────────────────── */
const palette = {
  accent: "#0d9488",        // teal-600
  accentLight: "#ccfbf1",   // teal-100
  surface: "#fafaf9",       // stone-50
  cardBg: "#ffffff",
  textPrimary: "#1c1917",   // stone-900
  textSecondary: "#78716c", // stone-500
  border: "#e7e5e4",        // stone-300
};


export default function Submissions() {
  const navigate = useNavigate();

  const { loading, submissions, updateSubmissions } = useData();

  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [refreshing, setRefreshing] = useState(false);

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

  // Atualiza os dados ao clicar em "Atualizar"
  async function refreshData() {
    setRefreshing(true);
    try {
      await updateSubmissions();
    } finally {
      setRefreshing(false);
    }
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

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-6 sm:py-10 min-h-[80vh]">
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
      <div
        className="relative rounded-2xl px-5 sm:px-8 py-8 sm:py-10 mb-8 overflow-hidden"
        style={{ background: `linear-gradient(135deg, ${palette.accent} 0%, #065f56 100%)` }}
      >
        {/* decorative circles */}
        <div
          className="pointer-events-none absolute -top-12 -right-12 h-56 w-56 rounded-full opacity-10"
          style={{ background: "white" }}
        />
        <div
          className="pointer-events-none absolute bottom-0 left-1/3 h-32 w-32 rounded-full opacity-[0.07]"
          style={{ background: "white" }}
        />

        <div className="relative z-10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white flex items-center gap-3">
              <FileText className="w-6 h-6 sm:w-8 sm:h-8 opacity-90" strokeWidth={2.2} />
              Submissoes
            </h1>
            <p className="mt-2 text-teal-100 text-sm max-w-md leading-relaxed">
              Acompanhe o historico de todas as suas submissoes e monitore seu progresso.
            </p>
          </div>

          <Button
            onClick={refreshData}
            disabled={loading || refreshing}
            className="w-full sm:w-auto shrink-0 bg-white text-teal-700 font-semibold shadow-lg hover:bg-teal-50 transition-colors rounded-xl px-5 h-11"
          >
            <RefreshCw
              className={`w-4 h-4 mr-1.5 ${(loading || refreshing) ? "animate-spin" : ""}`}
            />
            Atualizar
          </Button>
        </div>
      </div>

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
      <div
        className="rounded-2xl border shadow-sm overflow-hidden"
        style={{ background: palette.cardBg, borderColor: palette.border }}
      >
        {loading ? (
          <div className="p-6">
            <Loading />
          </div>
        ) : sortedSubmissions.length === 0 ? (
          /* ── empty state ── */
          <div className="flex flex-col items-center justify-center py-24 text-center">
            <div
              className="mb-5 flex h-20 w-20 items-center justify-center rounded-2xl"
              style={{ background: palette.accentLight }}
            >
              <FileText className="w-9 h-9" style={{ color: palette.accent }} />
            </div>
            <p className="text-lg font-semibold text-stone-700">
              {searchTerm || statusFilter !== "all"
                ? "Nenhuma submissao encontrada"
                : "Nenhuma submissao ainda"}
            </p>
            <p className="mt-1 text-sm text-stone-400 max-w-xs">
              {searchTerm || statusFilter !== "all"
                ? "Tente ajustar os filtros de busca."
                : "Suas submissoes aparecerao aqui quando voce enviar solucoes."}
            </p>
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow
                className="hover:bg-stone-50"
                style={{ background: palette.surface }}
              >
                <TableHead className="font-semibold" style={{ color: palette.textPrimary }}>
                  <div className="flex items-center gap-2">
                    <Target className="w-4 h-4" />
                    Problema
                  </div>
                </TableHead>
                <TableHead className="hidden sm:table-cell font-semibold" style={{ color: palette.textPrimary }}>
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4" />
                    Data de Submissao
                  </div>
                </TableHead>
                <TableHead className="font-semibold" style={{ color: palette.textPrimary }}>
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
                    style={{ animationDelay: `${i * 40}ms` }}
                  >
                    <TableCell className="font-medium max-w-0">
                      <div className="flex flex-col">
                        <span
                          className="group-hover:text-teal-600 transition-colors truncate"
                          style={{ color: palette.textPrimary }}
                        >
                          {problemTitle}
                        </span>
                        <span className="text-xs mt-1 truncate" style={{ color: palette.accent }}>
                          Atividade ID: {submission.activityId} - Submissao ID: {submission.id}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell className="hidden sm:table-cell">
                      <div className="flex flex-col">
                        <span className="font-medium" style={{ color: palette.textPrimary }}>
                          {formattedDateOnly}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell className="whitespace-nowrap">
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
        <div className="text-center text-sm mt-6" style={{ color: palette.textSecondary }}>
          Mostrando {sortedSubmissions.length} de {submissions.length}{" "}
          submissoes
          {(searchTerm || statusFilter !== "all") && " (filtradas)"}
        </div>
      )}
    </div>
  );
}
