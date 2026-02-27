import { useNavigate } from "react-router";
import type { Class } from "@/types/classes";
import { Button } from "@/components/ui/button";
import {
  Edit,
  Trash2,
  Users,
  UserPlus,
  ChevronRight,
} from "lucide-react";

interface ClassCardProps {
  cls: Class;
  index: number;
  isProfOrAdmin: boolean;
  onEdit: (cls: Class) => void;
  onDelete: (id: number) => void;
}

export function ClassCard({
  cls,
  index,
  isProfOrAdmin,
  onEdit,
  onDelete,
}: ClassCardProps) {
  const navigate = useNavigate();

  return (
    <div
      className="cls-card group relative flex flex-col rounded-xl border border-stone-200 bg-white shadow-sm hover:shadow-md transition-shadow duration-300"
      style={{ animationDelay: `${index * 60}ms` }}
    >
      <div className="flex flex-col flex-1 px-3 py-3 sm:px-5 sm:py-5">
        {/* header row */}
        <div className="flex items-start justify-between gap-3 mb-3">
          <h3 className="text-sm sm:text-base font-bold leading-snug text-stone-800 line-clamp-2">
            {cls.nome}
          </h3>

          {isProfOrAdmin && (
            <div className="flex gap-1 shrink-0 opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-opacity">
              <button
                onClick={() => onEdit(cls)}
                className="rounded-lg p-1.5 text-stone-400 hover:text-teal-600 hover:bg-teal-50 transition-colors"
                title="Editar"
              >
                <Edit className="w-4 h-4" />
              </button>
              <button
                onClick={() => onDelete(cls.id)}
                className="rounded-lg p-1.5 text-stone-400 hover:text-red-600 hover:bg-red-50 transition-colors"
                title="Excluir"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>

        {/* meta */}
        <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-stone-500 mb-5">
          {cls.teacherName && (
            <span className="flex items-center gap-1.5">
              <span className="inline-flex h-5 w-5 items-center justify-center rounded-full bg-teal-600 text-[10px] font-bold text-white">
                {cls.teacherName.charAt(0).toUpperCase()}
              </span>
              {cls.teacherName}
            </span>
          )}
          <span className="flex items-center gap-1.5">
            <Users className="w-3.5 h-3.5" />
            {cls.studentsCount || 0} aluno{(cls.studentsCount ?? 0) !== 1 && "s"}
          </span>
        </div>

        {/* spacer */}
        <div className="flex-1" />

        {/* actions */}
        <div className="flex gap-2">
          <Button
            variant="ghost"
            onClick={() => navigate(`/classes/${cls.id}`)}
            className="flex-1 flex items-center justify-center gap-2 rounded-xl h-10 text-sm font-semibold bg-teal-50 text-teal-600 hover:bg-teal-600 hover:text-white transition-colors"
          >
            Ver Detalhes
            <ChevronRight className="w-4 h-4" />
          </Button>

          {isProfOrAdmin && (
            <Button
              variant="outline"
              aria-label="Gerenciar alunos"
              onClick={() => navigate(`/classes/${cls.id}?tab=students`)}
              className="flex items-center justify-center gap-2 rounded-xl h-10 px-4 text-sm font-semibold border-stone-300 text-stone-500 hover:border-teal-600 hover:text-teal-600 hover:bg-teal-50 transition-colors"
            >
              <UserPlus className="w-4 h-4" />
              <span className="hidden sm:inline">Alunos</span>
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
