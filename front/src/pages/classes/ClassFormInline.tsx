import type { CreateClassDTO } from "@/types/classes";
import type { Class } from "@/types/classes";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface ClassFormInlineProps {
  formData: CreateClassDTO;
  editingClass: Class | null;
  onFormDataChange: (data: CreateClassDTO) => void;
  onSubmit: (e: React.FormEvent) => void;
  onCancel: () => void;
}

export function ClassFormInline({
  formData,
  editingClass,
  onFormDataChange,
  onSubmit,
  onCancel,
}: ClassFormInlineProps) {
  return (
    <div className="cls-form-enter rounded-xl border border-stone-200 bg-white px-3 py-3 sm:px-5 sm:py-5 shadow-sm mb-6">
      <h2 className="text-base sm:text-lg font-bold text-stone-800 mb-4">
        {editingClass ? "Editar Turma" : "Criar Nova Turma"}
      </h2>
      <form onSubmit={onSubmit} className="flex flex-col sm:flex-row items-end gap-4">
        <div className="flex-1 w-full">
          <Label htmlFor="nome" className="mb-1.5 block text-sm font-medium text-stone-600">
            Nome da turma
          </Label>
          <Input
            id="nome"
            value={formData.nome}
            onChange={(e) => onFormDataChange({ ...formData, nome: e.target.value })}
            required
            placeholder="Ex: Programação I — 2025/1"
            className="h-11 rounded-lg"
          />
        </div>
        <div className="flex gap-2 shrink-0">
          <Button
            type="submit"
            className="h-11 rounded-xl px-6 font-semibold bg-teal-600 text-white hover:bg-teal-700"
          >
            {editingClass ? "Atualizar" : "Salvar"}
          </Button>
          <Button
            type="button"
            variant="ghost"
            onClick={onCancel}
            className="h-11 rounded-xl text-stone-500 hover:text-red-600 hover:bg-red-50"
          >
            Cancelar
          </Button>
        </div>
      </form>
    </div>
  );
}
