import { getProblemById } from "@/services/ProblemsServices";
import { getResultBySubmissionId } from "@/services/SubmissionsService";
import type { TestCaseResult, Problem } from "@/types";
import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router";
import {
  ArrowLeft,
  Calendar,
  FileText,
  User,
  Hash,
  AlertCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { HeroHeader } from "@/components/HeroHeader";
import { useData } from "@/context/DataContext";
import Loading from "@/components/Loading";

import { StatsCards } from "./StatsCards";
import { SubmissionInfoSection } from "./SubmissionInfoSection";
import { ErrorSections } from "./ErrorSections";
import { TestResultsSection } from "./TestResultsSection";
import { formatDate } from "./utils";

export default function SubmissionsDetails() {
  const params = useParams();
  const navigate = useNavigate();
  const submissionId = params.submissionId;
  const activityId = params.activityId;

  const { mapActivities, mapProblems, mapSubmissions } = useData();

  const [results, setResults] = useState<TestCaseResult[]>([]);
  const [loading, setLoading] = useState(true);
  const [fetchedProblem, setFetchedProblem] = useState<Problem | null>(null);

  const mapResultByTestId = useMemo(() => {
    const map = new Map<number, TestCaseResult>();
    results.forEach((result) => {
      map.set(result.testCaseId, result);
    });
    return map;
  }, [results]);

  const selectedActivity = useMemo(() => {
    return mapActivities.get(Number(activityId));
  }, [activityId, mapActivities]);

  const submission = useMemo(() => {
    return mapSubmissions.get(Number(submissionId));
  }, [submissionId, mapSubmissions]);

  // Tenta pegar do cache primeiro, senao usa o fetchedProblem
  const selectedProblem = useMemo(() => {
    const fromCache = mapProblems.get(Number(selectedActivity?.problemId));
    return fromCache || fetchedProblem;
  }, [selectedActivity, mapProblems, fetchedProblem]);

  // Calculo de estatisticas dos casos de teste baseado nos resultados reais
  // IMPORTANTE: Este useMemo deve estar ANTES de qualquer return condicional (regras dos Hooks)
  const testStats = useMemo(() => {
    if (!selectedProblem?.testCases || selectedProblem.testCases.length === 0) {
      return { total: 0, passed: 0, failed: 0, successRate: 0 };
    }

    const total = selectedProblem.testCases.length;
    const passed = selectedProblem.testCases.filter((tc) => {
      const result = mapResultByTestId.get(tc.id);
      return result?.status === "passed";
    }).length;
    const failed = total - passed;
    const successRate = total > 0 ? Math.round((passed / total) * 100) : 0;

    return { total, passed, failed, successRate };
  }, [selectedProblem, mapResultByTestId]);

  useEffect(() => {
    const fetchData = async () => {
      if (!submissionId) return;

      setLoading(true);
      try {
        const submissionResult = await getResultBySubmissionId(
          Number(submissionId)
        );
        setResults(submissionResult);
      } catch (error) {
        console.error("Failed to fetch submission details:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [submissionId]);

  // Busca o problema separadamente quando a atividade estiver disponivel
  useEffect(() => {
    if (selectedActivity && !mapProblems.get(selectedActivity.problemId)) {
      getProblemById(String(selectedActivity.problemId)).then((problem) => {
        if (problem) {
          setFetchedProblem(problem);
        }
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedActivity?.problemId]);

  if (loading) {
    return (
      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-6">
        <Loading />
      </div>
    );
  }

  if (!selectedActivity || !submission) {
    return (
      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-6">
        <div className="text-center py-12">
          <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-stone-900 mb-2">
            Submissao nao encontrada
          </h2>
          <p className="text-sm text-stone-600 mb-4">
            A submissao solicitada nao existe ou nao pode ser carregada.
          </p>
          <Button onClick={() => navigate("/submissions")} variant="outline">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Voltar as submissoes
          </Button>
        </div>
      </div>
    );
  }

  const dueDate = formatDate(selectedActivity.dueDate);
  const formattedSubmissionDateOnly = new Date(
    submission.dateSubmitted
  ).toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 space-y-6 pb-10">
      {/* Back button */}
      <div className="flex items-center gap-4 pt-4 sm:pt-6">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => navigate("/submissions")}
          className="flex items-center gap-2"
        >
          <ArrowLeft className="h-4 w-4" />
          Voltar
        </Button>
      </div>

      {/* Hero header */}
      <HeroHeader
        icon={FileText}
        title={selectedProblem?.title || "Problema nao encontrado"}
        description={
          <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-6">
            <div className="flex items-center gap-4 text-teal-100">
              <span className="inline-flex items-center gap-1">
                <User className="h-4 w-4" />
                <span className="text-sm">Usuario</span>
              </span>
              <span className="inline-flex items-center gap-1">
                <Hash className="h-4 w-4" />
                <span className="text-sm">ID: {submission.id}</span>
              </span>
            </div>
            <div className="inline-flex items-center gap-1 text-teal-100">
              <Calendar className="h-4 w-4" />
              <span className="text-sm">Enviado em: {formattedSubmissionDateOnly}</span>
            </div>
          </div>
        }
      />

      {/* Stats */}
      <StatsCards testStats={testStats} />

      {/* Activity info */}
      <SubmissionInfoSection
        selectedActivity={selectedActivity}
        selectedProblem={selectedProblem}
        formattedDueDate={dueDate.formatted}
      />

      {/* Compile / runtime errors */}
      <ErrorSections results={results} />

      {/* Test cases table */}
      <TestResultsSection
        testCases={selectedProblem?.testCases}
        mapResultByTestId={mapResultByTestId}
      />
    </div>
  );
}
