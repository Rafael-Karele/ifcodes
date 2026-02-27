import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/table";
import { getProblemById } from "@/services/ProblemsServices";
import {
  getSubmissionsByActivityId,
  postSubmission,
} from "@/services/SubmissionsService";
import type { Activity, Problem, Submission } from "@/types";
import { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router";
import {
  Calendar,
  FileText,
  Upload,
  XCircle,
  ArrowLeft,
  RefreshCw,
  User,
  Target,
  ArrowRight,
  Loader2,
} from "lucide-react";
import { CodeSubmissionComponent } from "../../components/CodeSubmission";
import { useData } from "@/context/DataContext";
import { RichTextViewer } from "@/components/RichTextEditor";
import { StatCard } from "@/components/StatCard";
import { SectionCard } from "@/components/SectionCard";
import { EmptyState } from "@/components/EmptyState";
import {
  StatusBadge,
  submissionStatusConfig,
  type SubmissionStatusKey,
} from "@/components/StatusBadge";

/* ── helpers ────────────────────────────────────────── */

function formatDate(dateString: string) {
  const date = new Date(dateString);
  const now = new Date();
  const diffTime = date.getTime() - now.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

  const formatted = date.toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });

  let relative = "";
  let isOverdue = false;

  if (diffDays < 0) {
    relative = `${Math.abs(diffDays)} dias atrás`;
    isOverdue = true;
  } else if (diffDays === 0) {
    relative = "Hoje";
  } else if (diffDays === 1) {
    relative = "Amanhã";
  } else {
    relative = `Em ${diffDays} dias`;
  }

  return { formatted, relative, isOverdue };
}

/* ── main component ─────────────────────────────────── */

export default function ActivitiesDetails() {
  const params = useParams();
  const navigate = useNavigate();
  const {
    mapActivities,
    mapProblems,
    loading,
    updateSubmissions,
    submissions,
    pushNotification,
  } = useData();

  const [activitySubmissions, setActivitySubmissions] = useState<Submission[]>([]);
  const [fetchedProblem, setFetchedProblem] = useState<Problem | undefined>(undefined);
  const [highlightedId, setHighlightedId] = useState<number | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const historyRef = useRef<HTMLDivElement>(null);

  const activityId = params.id;
  const [localLoading, setLocalLoading] = useState(false);

  const selectedActivity = useMemo(() => {
    return activityId ? mapActivities.get(Number(activityId)) : undefined;
  }, [activityId, mapActivities]);

  const selectedProblem = useMemo(() => {
    const problemFromMap = selectedActivity
      ? mapProblems.get(selectedActivity.problemId)
      : undefined;
    return problemFromMap || fetchedProblem;
  }, [selectedActivity, mapProblems, fetchedProblem]);

  const fetchSubmissions = async (activity: Activity) => {
    try {
      setLocalLoading(true);
      const data = await getSubmissionsByActivityId(String(activity.id));

      if (!mapProblems.get(activity.problemId)) {
        const problem = await getProblemById(`${activity.problemId}`);
        setFetchedProblem(problem);
      }

      setActivitySubmissions(data);
    } catch (error) {
      console.error("Erro ao buscar submissões da atividade:", error);
      setActivitySubmissions([]);
    } finally {
      setLocalLoading(false);
    }
  };

  useEffect(() => {
    if (selectedActivity) {
      fetchSubmissions(selectedActivity);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedActivity?.id]);

  useEffect(() => {
    const hasPending = activitySubmissions.some(
      (s) => s.status === "pending" || s.status === "processing"
    );
    if (hasPending && selectedActivity) {
      getSubmissionsByActivityId(String(selectedActivity.id)).then((data) => {
        setActivitySubmissions(data);
      });
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [submissions]);

  function redirectToSubmission(submission: Submission) {
    navigate(`/submissions/${submission.activityId}/${submission.id}`);
  }

  async function handleSubmit(code: string, activityId: number) {
    if (submitting) return;
    setSubmitting(true);
    try {
      const response = await postSubmission({
        code: code,
        activityId: activityId,
      });

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const raw = response as any;
      const newSubmission: Submission = {
        id: raw?.id ?? Date.now(),
        activityId: raw?.atividade_id ?? activityId,
        dateSubmitted: raw?.data_submissao ?? new Date().toISOString(),
        language: raw?.linguagem ?? "c",
        status: "pending",
      };

      setActivitySubmissions((prev) => [newSubmission, ...prev]);
      updateSubmissions();

      pushNotification("Submissão enviada! Aguarde a avaliação.", "success");
      setHighlightedId(newSubmission.id);
      setTimeout(() => setHighlightedId(null), 3000);
      setTimeout(() => historyRef.current?.scrollIntoView({ behavior: "smooth", block: "start" }), 100);

      // Cooldown de 5s antes de permitir nova submissão
      setTimeout(() => setSubmitting(false), 5000);
    } catch (error) {
      pushNotification("Erro ao submeter o código. Tente novamente.", "error");
      console.error("Error submitting code:", error);
      setSubmitting(false);
    }
  }

  /* ── loading state ── */
  if (loading || (selectedActivity && !selectedProblem && localLoading)) {
    return (
      <div className="max-w-5xl mx-auto px-6 py-16">
        <div className="bg-stone-50 border border-stone-200 rounded-xl p-12 flex flex-col items-center gap-4">
          <Loader2 className="w-6 h-6 animate-spin text-teal-600" />
          <p className="text-sm text-stone-500 font-medium">Carregando detalhes da atividade...</p>
        </div>
      </div>
    );
  }

  /* ── activity not found ── */
  if (selectedActivity === undefined) {
    return (
      <div className="max-w-5xl mx-auto px-6 py-16">
        <EmptyState
          icon={XCircle}
          title="Atividade não encontrada"
          description="A atividade que você está procurando não existe ou foi removida."
          action={{
            label: "Voltar para Atividades",
            onClick: () => navigate("/activities"),
            icon: ArrowLeft,
          }}
        />
      </div>
    );
  }

  /* ── problem not found ── */
  if (selectedProblem === undefined) {
    return (
      <div className="max-w-5xl mx-auto px-6 py-16">
        <EmptyState
          icon={XCircle}
          title="Problema não encontrado"
          description="O problema associado a esta atividade não foi encontrado."
          action={{
            label: "Voltar para Atividades",
            onClick: () => navigate("/activities"),
            icon: ArrowLeft,
          }}
        />
      </div>
    );
  }

  const dueDate = formatDate(selectedActivity.dueDate);

  return (
    <div className="max-w-5xl mx-auto px-6 py-10 space-y-8">

      {/* ── back link + header ── */}
      <div>
        <button
          onClick={() => navigate("/activities")}
          className="inline-flex items-center gap-1 text-sm font-medium text-teal-600 hover:text-teal-700 transition-colors mb-4"
        >
          <ArrowLeft className="w-4 h-4" />
          Voltar para Atividades
        </button>

        <p className="text-sm text-stone-400 font-medium">Atividade #{selectedActivity.id}</p>
        <h1 className="text-2xl font-bold text-stone-900 tracking-tight mt-1">
          {selectedProblem.title}
        </h1>
      </div>

      {/* ── stat cards (prazo + submissões) ── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <StatCard
          label={dueDate.relative}
          value={dueDate.formatted}
          icon={Calendar}
          accent={dueDate.isOverdue}
        />
        <StatCard
          label="Submissões"
          value={localLoading ? <Loader2 className="w-6 h-6 animate-spin text-teal-600" /> : activitySubmissions.length}
          icon={User}
        />
      </div>

      {/* ── enunciado ── */}
      <SectionCard title="Enunciado" icon={Target}>
        <div className="p-6">
          <RichTextViewer
            value={selectedProblem.statement}
            className="text-stone-700 leading-relaxed"
          />
        </div>
      </SectionCard>

      {/* ── nova submissão ── */}
      <SectionCard title="Nova Submissão" icon={Upload}>
        <CodeSubmissionComponent
          onSubmit={(code) => handleSubmit(code, selectedActivity.id)}
          disabled={submitting}
        />
      </SectionCard>

      {/* ── histórico de submissões ── */}
      <div ref={historyRef} />
      <SectionCard
        title="Histórico de Submissões"
        icon={FileText}
        action={
          <Button
            variant="outline"
            size="sm"
            onClick={() => selectedActivity && fetchSubmissions(selectedActivity)}
            disabled={localLoading}
          >
            <RefreshCw className={`w-4 h-4 ${localLoading ? 'animate-spin' : ''}`} />
            {localLoading ? 'Atualizando...' : 'Atualizar'}
          </Button>
        }
      >
        <div className="p-6">
          {localLoading ? (
            <div className="flex flex-col items-center gap-4 py-8">
              <Loader2 className="w-6 h-6 animate-spin text-teal-600" />
              <p className="text-sm text-stone-500 font-medium">Carregando submissões...</p>
            </div>
          ) : activitySubmissions.length === 0 ? (
            <EmptyState
              icon={FileText}
              title="Nenhuma submissão para esta atividade"
              description="Use o editor acima para enviar seu código."
            />
          ) : (
            <div className="overflow-hidden rounded-lg border border-stone-200">
              <Table>
                <TableHeader>
                  <TableRow className="bg-stone-50 hover:bg-stone-50">
                    <TableHead className="font-semibold text-stone-700 text-xs">
                      Data de Submissão
                    </TableHead>
                    <TableHead className="font-semibold text-stone-700 text-xs">
                      Status
                    </TableHead>
                    <TableHead className="w-12"></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {activitySubmissions.map((submission: Submission) => {
                    const submissionDate = formatDate(submission.dateSubmitted);
                    const statusKey = submission.status as SubmissionStatusKey;
                    const statusCfg = submissionStatusConfig[statusKey] || submissionStatusConfig.pending;
                    return (
                      <TableRow
                        key={submission.id}
                        onClick={() => redirectToSubmission(submission)}
                        className={`cursor-pointer hover:bg-stone-50 transition-all duration-500 group ${
                          highlightedId === submission.id ? "bg-teal-50 ring-1 ring-teal-200" : ""
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
          )}
        </div>
      </SectionCard>
    </div>
  );
}
