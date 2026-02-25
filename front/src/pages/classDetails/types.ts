import type { SubmissionStatus } from "@/types";
import { CheckCircle2, XCircle, Clock, Loader2, AlertCircle } from "lucide-react";

export interface StudentSubmission {
  studentId: number;
  studentName: string;
  submissionDate: string | null;
  status: SubmissionStatus;
  submissionId?: number;
  code?: string;
  language?: string;
}

export interface ActivityFormData {
  problema_id: number;
  data_entrega: string;
  tempo_limite?: number | null;
  memoria_limite?: number | null;
  compiler_options?: string | null;
  command_line_arguments?: string | null;
  redirect_stderr_to_stdout?: boolean | null;
  wall_time_limit?: number | null;
  stack_limit?: number | null;
  max_file_size?: number | null;
  max_processes_and_or_threads?: number | null;
}

export const submissionStatusConfig = {
  passed: {
    label: "Aprovado",
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
    icon: Loader2,
    className: "bg-teal-100 text-teal-800 border-teal-200",
    dotColor: "bg-teal-500",
  },
  "compile-error": {
    label: "Erro de Compilação",
    icon: AlertCircle,
    className: "bg-orange-100 text-orange-800 border-orange-200",
    dotColor: "bg-orange-500",
  },
  timeout: {
    label: "Tempo Excedido",
    icon: Clock,
    className: "bg-teal-100 text-teal-800 border-teal-200",
    dotColor: "bg-teal-500",
  },
  "runtime-error": {
    label: "Erro de Execução",
    icon: AlertCircle,
    className: "bg-pink-100 text-pink-800 border-pink-200",
    dotColor: "bg-pink-500",
  },
  "internal-error": {
    label: "Erro Interno",
    icon: XCircle,
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

export function mapStatusToSubmissionStatus(status: string): SubmissionStatus {
  const statusMap: Record<string, SubmissionStatus> = {
    "Aceita": "passed",
    "Resposta Errada": "failed",
    "Erro de Compilação": "compile-error",
    "Erro de Execução (NZEC)": "runtime-error",
    "Tempo Limite Excedido": "timeout",
    "Erro Interno": "internal-error",
    "Processando": "processing",
    "Pendente": "pending",
  };

  return statusMap[status] || "unknown";
}

export function formatDateForApi(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  const hours = String(date.getHours()).padStart(2, '0');
  const minutes = String(date.getMinutes()).padStart(2, '0');
  const seconds = String(date.getSeconds()).padStart(2, '0');
  return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
}
