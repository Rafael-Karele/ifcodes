import { SectionCard } from "@/components/SectionCard";
import { Target } from "lucide-react";
import type { Activity, Problem } from "@/types";

interface SubmissionInfoSectionProps {
  selectedActivity: Activity;
  selectedProblem: Problem | null;
  formattedDueDate: string;
}

export function SubmissionInfoSection({
  selectedActivity,
  selectedProblem,
  formattedDueDate,
}: SubmissionInfoSectionProps) {
  return (
    <SectionCard title="Informacoes da Atividade" icon={Target}>
      <div className="px-4 py-4 sm:px-6 sm:py-5 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        <div>
          <label className="text-sm font-medium text-stone-500">Titulo</label>
          <div className="mt-1 text-sm sm:text-base font-semibold text-stone-900">
            {selectedProblem?.title || "Titulo nao encontrado"}
          </div>
        </div>
        <div>
          <label className="text-sm font-medium text-stone-500">
            Prazo de Entrega
          </label>
          <div className="mt-1 text-sm sm:text-base font-semibold text-stone-900">
            {formattedDueDate}
          </div>
        </div>
        <div>
          <label className="text-sm font-medium text-stone-500">
            ID da Atividade
          </label>
          <div className="mt-1 text-sm sm:text-base font-semibold text-stone-900">
            {selectedActivity.id}
          </div>
        </div>
      </div>
    </SectionCard>
  );
}
