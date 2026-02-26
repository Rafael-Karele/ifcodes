import { useEffect, useState } from "react";
import type { Activity, Problem, Submission, SubmissionStatus } from "@/types";
import { getActivitySubmissions } from "@/services/ActivitiesService";
import { getProblemById } from "@/services/ProblemsServices";
import { getResultBySubmissionId } from "@/services/SubmissionsService";
import { Button } from "@/components/ui/button";
import Loading from "@/components/Loading";
import { Users, Calendar, Clock, X, Loader2, Hash, Terminal, Target as TargetIcon, TestTube } from "lucide-react";
import { CodeViewer } from "@/components/CodeSubmission";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/table";
import type { StudentSubmission } from "./types";
import { mapStatusToSubmissionStatus } from "./types";
import SubmissionStatusBadge from "./SubmissionStatusBadge";
import TestCaseRow from "./TestCaseRow";

interface SubmissionsModalProps {
  isOpen: boolean;
  onClose: () => void;
  activity: Activity | null;
  classId: number;
}

export default function SubmissionsModal({ isOpen, onClose, activity, classId }: SubmissionsModalProps) {
  const [submissions, setSubmissions] = useState<StudentSubmission[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedSubmission, setSelectedSubmission] = useState<{
    code: string;
    submission: Submission;
    studentName: string;
  } | null>(null);
  const [loadingDetails, setLoadingDetails] = useState(false);
  const [testResults, setTestResults] = useState<any[]>([]);
  const [problem, setProblem] = useState<Problem | null>(null);

  useEffect(() => {
    if (isOpen && activity) {
      loadSubmissions();
      loadProblem();
    }
  }, [isOpen, activity]);

  const loadProblem = async () => {
    if (!activity) return;

    try {
      const problemData = await getProblemById(String(activity.problemId));
      setProblem(problemData ?? null);
    } catch (error) {
      console.error("Erro ao carregar problema:", error);
    }
  };

  const loadSubmissions = async () => {
    if (!activity) return;

    setLoading(true);
    try {
      const data = await getActivitySubmissions(classId, activity.id);

      const submissionsByUser = new Map<number, any>();

      data.forEach((item: any) => {
        const userId = item.user_id;
        const existing = submissionsByUser.get(userId);

        if (!existing) {
          submissionsByUser.set(userId, item);
        } else {
          const isCurrentAccepted = item.status === "Aceita";
          const isExistingAccepted = existing.status === "Aceita";
          const currentDate = new Date(item.created_at);
          const existingDate = new Date(existing.created_at);

          if (isCurrentAccepted && !isExistingAccepted) {
            submissionsByUser.set(userId, item);
          } else if (isCurrentAccepted && isExistingAccepted && currentDate > existingDate) {
            submissionsByUser.set(userId, item);
          } else if (!isCurrentAccepted && !isExistingAccepted && currentDate > existingDate) {
            submissionsByUser.set(userId, item);
          }
        }
      });

      const mappedSubmissions: StudentSubmission[] = Array.from(submissionsByUser.values()).map((item: any) => ({
        studentId: item.user_id,
        studentName: item.user_name,
        submissionDate: item.created_at,
        status: mapStatusToSubmissionStatus(item.status),
        submissionId: item.id,
        code: item.codigo,
        language: item.linguagem === 50 ? 'c' : 'c',
      }));

      mappedSubmissions.sort((a, b) => a.studentName.localeCompare(b.studentName));

      setSubmissions(mappedSubmissions);
    } catch (error) {
      console.error("Erro ao carregar submissões:", error);
      setSubmissions([]);
    } finally {
      setLoading(false);
    }
  };

  const handleRowClick = async (submission: StudentSubmission) => {
    if (!submission.submissionId || !submission.code) return;

    setLoadingDetails(true);
    try {
      setSelectedSubmission({
        code: submission.code,
        submission: {
          id: submission.submissionId,
          activityId: activity!.id,
          dateSubmitted: submission.submissionDate || new Date().toISOString(),
          language: (submission.language || 'c') as any,
          status: submission.status,
          problemTitle: null,
        },
        studentName: submission.studentName,
      });

      const results = await getResultBySubmissionId(submission.submissionId);
      setTestResults(results);
    } catch (error) {
      console.error("Erro ao carregar detalhes da submissão:", error);
    } finally {
      setLoadingDetails(false);
    }
  };

  const handleCloseDetails = () => {
    setSelectedSubmission(null);
    setTestResults([]);
  };

  if (!isOpen || !activity) return null;

  if (selectedSubmission) {
    return (
      <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-2xl shadow-xl max-w-6xl w-full max-h-[90vh] overflow-hidden flex flex-col">
          <div className="p-6 border-b border-stone-200">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl font-bold text-stone-900">
                  Submissão de {selectedSubmission.studentName}
                </h2>
                <p className="text-sm text-stone-500 mt-1">
                  {new Date(selectedSubmission.submission.dateSubmitted).toLocaleString("pt-BR")}
                </p>
              </div>
              <button
                onClick={handleCloseDetails}
                className="text-stone-400 hover:text-stone-600 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto p-6 space-y-6">
            <CodeViewer code={selectedSubmission.code} language={selectedSubmission.submission.language} />

            {problem && problem.testCases && problem.testCases.length > 0 && (
              <div className="bg-white rounded-lg border border-stone-200 shadow-sm">
                <div className="border-b border-stone-200 p-6">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-green-100 rounded-lg">
                      <TestTube className="w-5 h-5 text-green-600" />
                    </div>
                    <h2 className="text-2xl font-bold text-stone-900">
                      Casos de Teste
                    </h2>
                  </div>
                </div>

                <div className="p-6">
                  <div className="overflow-hidden">
                    <Table>
                      <TableHeader>
                        <TableRow className="bg-stone-50 hover:bg-stone-50">
                          <TableHead className="font-semibold text-stone-900">
                            <div className="flex items-center gap-2">
                              <Hash className="w-4 h-4" />
                              Teste
                            </div>
                          </TableHead>
                          <TableHead className="font-semibold text-stone-900">
                            <div className="flex items-center gap-2">
                              <Clock className="w-4 h-4" />
                              Status
                            </div>
                          </TableHead>
                          <TableHead className="font-semibold text-stone-900">
                            <div className="flex items-center gap-2">
                              <Terminal className="w-4 h-4" />
                              Saída Atual
                            </div>
                          </TableHead>
                          <TableHead className="font-semibold text-stone-900">
                            <div className="flex items-center gap-2">
                              <TargetIcon className="w-4 h-4" />
                              Saída Esperada
                            </div>
                          </TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {problem.testCases.map((testCase, index) => {
                          const result = testResults.find(r => r.testCaseId === testCase.id);
                          return (
                            <TestCaseRow
                              key={testCase.id}
                              testCase={testCase}
                              result={result}
                              index={index}
                            />
                          );
                        })}
                      </TableBody>
                    </Table>
                  </div>
                </div>
              </div>
            )}
          </div>

          <div className="p-6 border-t border-stone-200 flex justify-end">
            <Button onClick={handleCloseDetails} variant="outline">
              Voltar para lista
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-xl max-w-5xl w-full max-h-[90vh] overflow-hidden flex flex-col">
        <div className="p-6 border-b border-stone-200">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold text-stone-900">Submissões da Atividade</h2>
            <button
              onClick={onClose}
              className="text-stone-400 hover:text-stone-600 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-6">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <Loading />
            </div>
          ) : submissions.length === 0 ? (
            <div className="text-center py-12">
              <Users className="w-12 h-12 text-stone-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-stone-900 mb-2">
                Nenhuma submissão encontrada
              </h3>
              <p className="text-stone-500">
                Ainda não há submissões para esta atividade
              </p>
            </div>
          ) : (
            <div className="bg-white rounded-lg border border-stone-200 shadow-sm overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow className="bg-stone-50 hover:bg-stone-50">
                    <TableHead className="font-semibold text-stone-900">
                      <div className="flex items-center gap-2">
                        <Users className="w-4 h-4" />
                        Nome
                      </div>
                    </TableHead>
                    <TableHead className="font-semibold text-stone-900">
                      <div className="flex items-center gap-2">
                        <Calendar className="w-4 h-4" />
                        Data de Submissão
                      </div>
                    </TableHead>
                    <TableHead className="font-semibold text-stone-900">
                      <div className="flex items-center gap-2">
                        <Clock className="w-4 h-4" />
                        Status
                      </div>
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {submissions.map((submission) => (
                    <TableRow
                      key={submission.studentId}
                      onClick={() => handleRowClick(submission)}
                      className="cursor-pointer hover:bg-teal-50 transition-colors duration-200 group"
                    >
                      <TableCell className="font-medium">
                        <span className="text-stone-900 group-hover:text-teal-600 transition-colors">
                          {submission.studentName}
                        </span>
                      </TableCell>
                      <TableCell>
                        {submission.submissionDate ? (
                          <div className="flex flex-col">
                            <span className="text-stone-900 font-medium">
                              {new Date(submission.submissionDate).toLocaleDateString("pt-BR")}
                            </span>
                            <span className="text-xs text-stone-500">
                              {new Date(submission.submissionDate).toLocaleTimeString("pt-BR", {
                                hour: "2-digit",
                                minute: "2-digit",
                                second: "2-digit",
                              })}
                            </span>
                          </div>
                        ) : (
                          <span className="text-stone-400 text-sm">Não submetido</span>
                        )}
                      </TableCell>
                      <TableCell>
                        <SubmissionStatusBadge status={submission.status} />
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}

          {loadingDetails && (
            <div className="fixed inset-0 bg-black/20 flex items-center justify-center z-50">
              <div className="bg-white rounded-lg p-6 shadow-xl">
                <Loader2 className="w-8 h-8 animate-spin text-teal-600 mx-auto mb-2" />
                <p className="text-stone-600">Carregando detalhes...</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
