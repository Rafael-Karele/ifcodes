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
  XCircle,
  AlertCircle,
  PlayCircle,
  Search,
  Filter,
  TrendingUp,
  Target,
  ArrowRight,
  RefreshCw,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useData } from "@/context/DataContext";
import Loading from "@/components/Loading";

/* ── palette tokens (inline, no global leak) ────────────────── */
const palette = {
  accent: "#0d9488",        // teal-600
  accentLight: "#ccfbf1",   // teal-100
  accentSoft: "#f0fdfa",    // teal-50
  warm: "#f59e0b",          // amber-500
  warmLight: "#fef3c7",     // amber-100
  surface: "#fafaf9",       // stone-50
  cardBg: "#ffffff",
  textPrimary: "#1c1917",   // stone-900
  textSecondary: "#78716c", // stone-500
  border: "#e7e5e4",        // stone-300
  dangerText: "#dc2626",
  dangerBg: "#fef2f2",
};

// Configuracao dos possiveis status das submissoes (cor, icone, etc)
const statusConfig = {
  passed: {
    label: "Aceito",
    icon: CheckCircle2,
    className: "bg-green-100 text-green-800 border-green-200",
    dotColor: "bg-green-500",
  },
  failed: {
    label: "Resposta Errada",
    icon: XCircle,
    className: "bg-red-100 text-red-800 border-red-200",
    dotColor: "bg-red-500",
  },
  pending: {
    label: "Pendente",
    icon: Clock,
    className: "bg-yellow-100 text-yellow-800 border-yellow-200",
    dotColor: "bg-yellow-500",
  },
  processing: {
    label: "Processando",
    icon: PlayCircle,
    className: "bg-blue-100 text-blue-800 border-blue-200",
    dotColor: "bg-blue-500",
  },
  "compile-error": {
    label: "Erro de Compilacao",
    icon: AlertCircle,
    className: "bg-orange-100 text-orange-800 border-orange-200",
    dotColor: "bg-orange-500",
  },
  timeout: {
    label: "Tempo Limite",
    icon: Clock,
    className: "bg-purple-100 text-purple-800 border-purple-200",
    dotColor: "bg-purple-500",
  },
  "runtime-error": {
    label: "Erro de Execucao",
    icon: AlertCircle,
    className: "bg-pink-100 text-pink-800 border-pink-200",
    dotColor: "bg-pink-500",
  },
  "internal-error": {
    label: "Erro Interno",
    icon: AlertCircle,
    className: "bg-stone-100 text-stone-800 border-stone-200",
    dotColor: "bg-stone-500",
  },
  unknown: {
    label: "Desconhecido",
    icon: AlertCircle,
    className: "bg-stone-100 text-stone-800 border-stone-200",
    dotColor: "bg-stone-500",
  },
} as const;

interface StatusBadgeProps {
  status: keyof typeof statusConfig;
}

// Exibe o badge de status da submissao
function StatusBadge({ status }: StatusBadgeProps) {
  const config = statusConfig[status] || statusConfig.pending;
  const Icon = config.icon;

  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border ${config.className}`}
    >
      <div className={`w-1.5 h-1.5 rounded-full ${config.dotColor}`} />
      <Icon className="w-3 h-3" />
      {config.label}
    </span>
  );
}

// note: relative formatting removed from this file; table shows only date

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
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {/* Total */}
          <div
            className="rounded-2xl border p-5 shadow-sm"
            style={{ background: palette.cardBg, borderColor: palette.border }}
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium" style={{ color: palette.textSecondary }}>
                  Total de Submissoes
                </p>
                <p className="text-2xl font-bold mt-1" style={{ color: palette.textPrimary }}>
                  {stats.total}
                </p>
                <p className="text-xs mt-1" style={{ color: palette.textSecondary }}>
                  Todas as tentativas
                </p>
              </div>
              <div
                className="p-3 rounded-xl"
                style={{ background: `linear-gradient(135deg, ${palette.accent}, #0f766e)` }}
              >
                <FileText className="w-6 h-6 text-white" />
              </div>
            </div>
          </div>

          {/* Aceitas */}
          <div
            className="rounded-2xl border p-5 shadow-sm"
            style={{ background: palette.cardBg, borderColor: palette.border }}
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium" style={{ color: palette.textSecondary }}>
                  Aceitas
                </p>
                <p className="text-2xl font-bold mt-1" style={{ color: palette.textPrimary }}>
                  {stats.accepted}
                </p>
                <p className="text-xs mt-1" style={{ color: palette.textSecondary }}>
                  Solucoes aprovadas
                </p>
              </div>
              <div
                className="p-3 rounded-xl"
                style={{ background: "linear-gradient(135deg, #10b981, #059669)" }}
              >
                <CheckCircle2 className="w-6 h-6 text-white" />
              </div>
            </div>
          </div>

          {/* Taxa de Sucesso */}
          <div
            className="rounded-2xl border p-5 shadow-sm"
            style={{ background: palette.cardBg, borderColor: palette.border }}
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium" style={{ color: palette.textSecondary }}>
                  Taxa de Sucesso
                </p>
                <p className="text-2xl font-bold mt-1" style={{ color: palette.textPrimary }}>
                  {stats.acceptanceRate}%
                </p>
                <p className="text-xs mt-1" style={{ color: palette.textSecondary }}>
                  {stats.acceptanceRate}% de aprovacao
                </p>
              </div>
              <div
                className="p-3 rounded-xl"
                style={{ background: `linear-gradient(135deg, #14b8a6, ${palette.accent})` }}
              >
                <TrendingUp className="w-6 h-6 text-white" />
              </div>
            </div>
          </div>

          {/* Pendentes */}
          <div
            className="rounded-2xl border p-5 shadow-sm"
            style={{ background: palette.cardBg, borderColor: palette.border }}
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium" style={{ color: palette.textSecondary }}>
                  Pendentes
                </p>
                <p className="text-2xl font-bold mt-1" style={{ color: palette.textPrimary }}>
                  {stats.pending}
                </p>
                <p className="text-xs mt-1" style={{ color: palette.textSecondary }}>
                  Aguardando avaliacao
                </p>
              </div>
              <div
                className="p-3 rounded-xl"
                style={{ background: `linear-gradient(135deg, ${palette.warm}, #d97706)` }}
              >
                <Clock className="w-6 h-6 text-white" />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ═══════ SEARCH + FILTER BAR ═══════ */}
      <div className="flex flex-col sm:flex-row items-center gap-4 mb-6">
        <div className="relative flex-1 w-full">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400" />
          <Input
            type="text"
            placeholder="Buscar por problema..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 h-11 rounded-xl border-stone-200 bg-white shadow-sm focus-visible:ring-teal-500/30 focus-visible:border-teal-400"
          />
        </div>

        <div className="relative w-full sm:w-auto sm:shrink-0">
          <Filter className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-400 w-4 h-4 z-10 pointer-events-none" />
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="pl-10 pr-8 h-11 rounded-xl border border-stone-200 bg-white shadow-sm focus:ring-2 focus:ring-teal-500/30 focus:border-teal-400 min-w-[160px] text-sm"
            style={{ color: palette.textPrimary }}
          >
            <option value="all">Todos os status</option>
            {uniqueStatuses.map((status) => (
              <option key={status} value={status}>
                {statusConfig[status as keyof typeof statusConfig]?.label ||
                  status}
              </option>
            ))}
          </select>
        </div>

        {/* count badge */}
        <div
          className="shrink-0 flex items-center gap-2 rounded-xl px-4 h-11 text-sm font-medium"
          style={{ background: palette.accentSoft, color: palette.accent }}
        >
          <FileText className="w-4 h-4" />
          {sortedSubmissions.length}{" "}
          {sortedSubmissions.length === 1 ? "resultado" : "resultados"}
        </div>
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
                      <StatusBadge status={submission.status as keyof typeof statusConfig} />
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
