import {
  CheckCircle2,
  XCircle,
  AlertCircle,
  Clock,
  Loader2,
} from "lucide-react";

export const testStatusConfig = {
  passed: {
    label: "Aceito",
    icon: CheckCircle2,
    className: "bg-emerald-50 text-emerald-700 border-emerald-200",
    dotColor: "bg-emerald-500",
  },
  pending: {
    label: "Pendente",
    icon: Clock,
    className: "bg-amber-50 text-amber-700 border-amber-200",
    dotColor: "bg-amber-500",
  },
  processing: {
    label: "Processando",
    icon: Loader2,
    className: "bg-stone-50 text-stone-600 border-stone-200",
    dotColor: "bg-stone-500",
  },
  failed: {
    label: "Resposta Errada",
    icon: XCircle,
    className: "bg-red-50 text-red-700 border-red-200",
    dotColor: "bg-red-500",
  },
  "compile-error": {
    label: "Erro de Compilacao",
    icon: AlertCircle,
    className: "bg-amber-50 text-amber-700 border-amber-200",
    dotColor: "bg-amber-500",
  },
  timeout: {
    label: "Tempo Limite",
    icon: Clock,
    className: "bg-amber-50 text-amber-700 border-amber-200",
    dotColor: "bg-amber-500",
  },
  "runtime-error": {
    label: "Erro de Execucao",
    icon: AlertCircle,
    className: "bg-red-50 text-red-700 border-red-200",
    dotColor: "bg-red-500",
  },
  "internal-error": {
    label: "Erro Interno",
    icon: AlertCircle,
    className: "bg-stone-100 text-stone-600 border-stone-200",
    dotColor: "bg-stone-500",
  },
  unknown: {
    label: "Desconhecido",
    icon: AlertCircle,
    className: "bg-stone-100 text-stone-600 border-stone-200",
    dotColor: "bg-stone-500",
  },
} as const;

export type TestStatusKey = keyof typeof testStatusConfig;
