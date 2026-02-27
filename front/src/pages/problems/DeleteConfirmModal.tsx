import { Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";

interface DeleteConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  problemTitle: string;
  activitiesCount?: number;
}

export function DeleteConfirmModal({ isOpen, onClose, onConfirm, problemTitle, activitiesCount }: DeleteConfirmModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-sm p-4">
      <div className="w-full max-w-md rounded-xl border border-stone-200 bg-white shadow-lg p-5 sm:p-6">
        <div className="mb-4 flex items-center gap-3">
          <div className="rounded-lg bg-red-50 p-2">
            <Trash2 className="w-6 h-6 text-red-600" />
          </div>
          <h3 className="text-xl font-bold text-stone-800">Confirmar Exclusao</h3>
        </div>
        <p className="mb-6 text-sm text-stone-500 sm:text-base">
          Tem certeza que deseja excluir o problema{" "}
          <span className="font-semibold text-stone-800">"{problemTitle}"</span>?
          Esta acao nao pode ser desfeita.
        </p>

        {activitiesCount !== undefined && activitiesCount > 0 && (
          <div className="mb-6 rounded-xl border border-amber-200 bg-amber-50 p-4">
            <h4 className="mb-1 flex items-center gap-2 text-sm font-semibold text-amber-800">
              <span>Atencao: Problema em uso</span>
            </h4>
            <p className="text-sm text-amber-700">
              Este problema esta atribuido a <strong>{activitiesCount}</strong> atividade{activitiesCount > 1 ? 's' : ''}.
              Exclui-lo removera todas as atividades, submissoes e correcoes associadas.
            </p>
          </div>
        )}

        <div className="flex gap-3">
          <Button
            variant="outline"
            onClick={onClose}
            className="flex-1 rounded-xl border-stone-300 text-stone-700 hover:bg-stone-50 font-medium"
          >
            Cancelar
          </Button>
          <Button
            variant="destructive"
            onClick={onConfirm}
            className="flex-1 rounded-xl font-medium hover:opacity-90"
          >
            Confirmar Exclusao
          </Button>
        </div>
      </div>
    </div>
  );
}
