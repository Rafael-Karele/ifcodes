// src/components/ProblemCard.tsx

import { useState, useEffect, useRef } from "react";
import type { Problem } from "@/types";
import { Pencil, Trash2, Eye } from "lucide-react";
import { getPlainTextFromRichValue } from "@/components/RichTextEditor";

const stripColours = [
  "linear-gradient(90deg, #14b8a6, #34d399)",
  "linear-gradient(90deg, #f59e0b, #fb923c)",
  "linear-gradient(90deg, #38bdf8, #22d3ee)",
  "linear-gradient(90deg, #fb7185, #f472b6)",
  "linear-gradient(90deg, #a78bfa, #c084fc)",
  "linear-gradient(90deg, #a3e635, #4ade80)",
];

type ProblemCardProps = {
  problem: Problem;
  onDelete: (problem: Problem) => void;
  onEdit: (problem: Problem) => void;
  onView: (problem: Problem) => void;
  index?: number;
};

export function ProblemCard({ problem, onDelete, onEdit, onView, index = 0 }: ProblemCardProps) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsMenuOpen(false);
      }
    };

    if (isMenuOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    } else {
      document.removeEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isMenuOpen]);

  return (
    <div
      className="group bg-white rounded-2xl border border-stone-200 shadow-sm hover:shadow-md transition-shadow duration-300 overflow-hidden cursor-pointer"
      onClick={() => onView(problem)}
      style={{ animation: "problems-fade-up 0.5s cubic-bezier(.22,1,.36,1) both", animationDelay: `${index * 60}ms` }}
    >
      {/* Color strip */}
      <div className="h-1.5" style={{ background: stripColours[index % stripColours.length] }} />

      <div className="p-5 flex items-center justify-between gap-4">
        {/* Content */}
        <div className="min-w-0 flex-1">
          <h3 className="text-[1.05rem] font-bold leading-snug text-stone-800 truncate">
            {problem.title}
          </h3>
          <p className="text-sm text-stone-500 line-clamp-2 mt-1">
            {getPlainTextFromRichValue(problem.statement)}
          </p>
          <div className="flex items-center gap-3 mt-2">
            {problem.testCasesCount !== undefined && (
              <span className="text-xs font-medium px-2 py-0.5 rounded-md" style={{ backgroundColor: "#f0fdfa", color: "#0d9488" }}>
                {problem.testCasesCount} caso{problem.testCasesCount !== 1 ? "s" : ""} de teste
              </span>
            )}
            {problem.atividades_count !== undefined && problem.atividades_count > 0 && (
              <span className="text-xs font-medium px-2 py-0.5 rounded-md bg-amber-50 text-amber-600">
                {problem.atividades_count} atividade{problem.atividades_count !== 1 ? "s" : ""}
              </span>
            )}
          </div>
        </div>

        {/* Action buttons (show on hover) */}
        <div className="flex items-center gap-1 opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-opacity" ref={menuRef}>
          <button
            onClick={(e) => { e.stopPropagation(); onView(problem); }}
            className="rounded-lg p-1.5 text-stone-400 hover:text-teal-600 hover:bg-teal-50 transition-colors"
            title="Ver detalhes"
          >
            <Eye className="w-4 h-4" />
          </button>
          <button
            onClick={(e) => { e.stopPropagation(); onEdit(problem); }}
            className="rounded-lg p-1.5 text-stone-400 hover:text-teal-600 hover:bg-teal-50 transition-colors"
            title="Editar"
          >
            <Pencil className="w-4 h-4" />
          </button>
          <button
            onClick={(e) => { e.stopPropagation(); onDelete(problem); }}
            className="rounded-lg p-1.5 text-stone-400 hover:text-red-600 hover:bg-red-50 transition-colors"
            title="Apagar"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
