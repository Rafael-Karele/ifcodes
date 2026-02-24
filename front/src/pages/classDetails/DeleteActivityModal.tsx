import { Trash2 } from "lucide-react";

interface DeleteActivityModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  activityTitle: string;
}

export default function DeleteActivityModal({ isOpen, onClose, onConfirm, activityTitle }: DeleteActivityModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-xl max-w-md w-full p-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="p-2 bg-red-100 rounded-lg">
            <Trash2 className="w-6 h-6 text-red-600" />
          </div>
          <h3 className="text-xl font-bold text-stone-900">Confirmar Exclusão</h3>
        </div>
        <p className="text-stone-600 mb-6">
          Tem certeza que deseja excluir a atividade{" "}
          <span className="font-semibold text-stone-900">"{activityTitle}"</span>?
          Esta ação não pode ser desfeita.
        </p>
        <div className="flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 px-4 py-2 border border-stone-300 rounded-lg text-stone-700 hover:bg-stone-50 font-medium transition-colors"
          >
            Cancelar
          </button>
          <button
            onClick={onConfirm}
            className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 font-medium transition-colors"
          >
            Confirmar Exclusão
          </button>
        </div>
      </div>
    </div>
  );
}
