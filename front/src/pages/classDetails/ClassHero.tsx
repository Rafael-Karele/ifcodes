import type { Class } from "@/types/classes";
import { BookOpen } from "lucide-react";

interface ClassHeroProps {
  classData: Class;
  activityCount: number;
  studentCount: number;
}

export default function ClassHero({ classData, activityCount, studentCount }: ClassHeroProps) {
  return (
    <div
      className="relative rounded-2xl px-6 py-8 sm:px-8 sm:py-10 overflow-hidden bg-gradient-to-br from-teal-600 to-emerald-800"
    >
      <div className="absolute -top-6 -right-6 h-32 w-32 rounded-full bg-white opacity-10" />
      <div className="absolute bottom-4 left-1/3 h-20 w-20 rounded-full bg-white opacity-[0.07]" />

      <div className="relative flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white flex items-center gap-3">
            <BookOpen className="w-7 h-7 sm:w-8 sm:h-8" />
            {classData.nome}
          </h1>
          {classData.teacherName && (
            <p className="text-teal-100 text-sm mt-2">
              Professor: {classData.teacherName}
            </p>
          )}
          <div className="flex items-center gap-4 mt-3">
            <span className="text-sm font-medium px-3 py-1 rounded-full bg-white/15 text-white">
              {activityCount} atividade{activityCount !== 1 ? "s" : ""}
            </span>
            <span className="text-sm font-medium px-3 py-1 rounded-full bg-white/15 text-white">
              {studentCount} aluno{studentCount !== 1 ? "s" : ""}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
