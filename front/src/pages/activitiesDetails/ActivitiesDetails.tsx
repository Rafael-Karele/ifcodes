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
  Upload,
  XCircle,
  ArrowLeft,
  User,
  Target,
  Loader2,
} from "lucide-react";
import { CodeSubmissionComponent } from "../../components/CodeSubmission";
import { useData } from "@/context/DataContext";
import { RichTextViewer } from "@/components/RichTextEditor";
import { StatCard } from "@/components/StatCard";
import { SectionCard } from "@/components/SectionCard";
import { EmptyState } from "@/components/EmptyState";
import { SubmissionsHistory } from "./SubmissionsHistory";
import { formatDate } from "./utils";

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

  const hasPendingSubmission = activitySubmissions.some(
    (s) => s.status === "pending" || s.status === "processing"
  );
  const submitDisabled = submitting || hasPendingSubmission;

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
      console.error("Erro ao buscar submiss\u00f5es da atividade:", error);
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

      pushNotification("Submiss\u00e3o enviada! Aguarde a avalia\u00e7\u00e3o.", "success");
      setHighlightedId(newSubmission.id);
      setTimeout(() => setHighlightedId(null), 3000);
      setTimeout(() => historyRef.current?.scrollIntoView({ behavior: "smooth", block: "start" }), 100);
    } catch (error) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const axiosError = error as any;
      const backendMsg = axiosError?.response?.data?.message;
      pushNotification(backendMsg || "Erro ao submeter o c\u00f3digo. Tente novamente.", "error");
      console.error("Error submitting code:", error);
    } finally {
      setSubmitting(false);
    }
  }

  /* ── loading state ── */
  if (loading || (selectedActivity && !selectedProblem && localLoading)) {
    return (
      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-16">
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
      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-16">
        <EmptyState
          icon={XCircle}
          title="Atividade n\u00e3o encontrada"
          description="A atividade que voc\u00ea est\u00e1 procurando n\u00e3o existe ou foi removida."
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
      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-16">
        <EmptyState
          icon={XCircle}
          title="Problema n\u00e3o encontrado"
          description="O problema associado a esta atividade n\u00e3o foi encontrado."
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
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-6 sm:py-10 space-y-6 sm:space-y-8">

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
        <h1 className="text-xl sm:text-2xl font-bold text-stone-900 tracking-tight mt-1">
          {selectedProblem.title}
        </h1>
      </div>

      {/* ── stat cards (prazo + submiss\u00f5es) ── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <StatCard
          label={dueDate.relative}
          value={dueDate.formatted}
          icon={Calendar}
          accent={dueDate.isOverdue}
        />
        <StatCard
          label="Submiss\u00f5es"
          value={localLoading ? <Loader2 className="w-6 h-6 animate-spin text-teal-600" /> : activitySubmissions.length}
          icon={User}
        />
      </div>

      {/* ── enunciado ── */}
      <SectionCard title="Enunciado" icon={Target}>
        <div className="px-3 py-4 sm:px-6 sm:py-6">
          <RichTextViewer
            value={selectedProblem.statement}
            className="text-sm sm:text-base text-stone-700 leading-relaxed"
          />
        </div>
      </SectionCard>

      {/* ── nova submiss\u00e3o ── */}
      <SectionCard title="Nova Submiss\u00e3o" icon={Upload}>
        <CodeSubmissionComponent
          onSubmit={(code) => handleSubmit(code, selectedActivity.id)}
          disabled={submitDisabled}
        />
      </SectionCard>

      {/* ── hist\u00f3rico de submiss\u00f5es ── */}
      <div ref={historyRef} />
      <SubmissionsHistory
        submissions={activitySubmissions}
        highlightedId={highlightedId}
        loading={localLoading}
        onRefresh={() => selectedActivity && fetchSubmissions(selectedActivity)}
        onSubmissionClick={redirectToSubmission}
      />
    </div>
  );
}
