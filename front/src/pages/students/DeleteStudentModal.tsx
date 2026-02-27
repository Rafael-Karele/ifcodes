import { Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";

export interface DeleteStudentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  studentName: string;
}

export function DeleteStudentModal({
  isOpen,
  onClose,
  onConfirm,
  studentName,
}: DeleteStudentModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-sm p-4">
      <div className="w-full max-w-lg rounded-xl border border-stone-200 bg-white p-4 shadow-lg sm:p-6">
        <div className="mb-4 flex items-center gap-3">
          <div className="rounded-lg bg-red-100 p-2">
            <Trash2 className="h-6 w-6 text-red-600" />
          </div>
          <h2 className="text-xl font-bold text-stone-900">Confirmar Remoção</h2>
        </div>

        <p className="mb-6 text-sm text-stone-600 sm:text-base">
          Tem certeza que deseja remover o aluno{" "}
          <span className="font-semibold text-stone-900">{studentName}</span>?
          Esta ação não pode ser desfeita.
        </p>

        <div className="flex gap-3">
          <Button
            variant="outline"
            onClick={onClose}
            className="flex-1 rounded-xl"
          >
            Cancelar
          </Button>
          <Button
            variant="destructive"
            onClick={onConfirm}
            className="flex-1 rounded-xl"
          >
            Confirmar Remoção
          </Button>
        </div>
      </div>
    </div>
  );
}
