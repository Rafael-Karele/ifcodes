import type { ClassStudent } from "@/types/classes";
import type { Student } from "@/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { UserPlus, UserMinus, Users, Search } from "lucide-react";
import { useUserRole } from "@/hooks/useUserRole";

interface StudentsTabProps {
  students: ClassStudent[];
  showAddStudent: boolean;
  searchTerm: string;
  filteredStudents: Student[];
  onToggleAddStudent: () => void;
  onSearchTermChange: (term: string) => void;
  onAddStudent: (studentId: number) => void;
  onRemoveStudent: (studentId: number) => void;
}

export default function StudentsTab({
  students,
  showAddStudent,
  searchTerm,
  filteredStudents,
  onToggleAddStudent,
  onSearchTermChange,
  onAddStudent,
  onRemoveStudent,
}: StudentsTabProps) {
  const { hasAnyRole } = useUserRole();

  return (
    <div className="bg-white p-6 rounded-2xl border border-stone-200 shadow-sm">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-lg font-semibold text-stone-800">Alunos Matriculados</h2>
        {hasAnyRole(["professor", "admin"]) && (
          <Button onClick={onToggleAddStudent}>
            <UserPlus className="w-4 h-4 mr-2" />
            Adicionar Aluno
          </Button>
        )}
      </div>

      {showAddStudent && (
        <div className="mb-6 p-4 bg-stone-50 rounded-lg">
          <div className="mb-4">
            <div className="relative">
              <Search className="absolute left-3 top-3 w-4 h-4 text-stone-400" />
              <Input
                type="text"
                placeholder="Buscar alunos disponíveis..."
                value={searchTerm}
                onChange={(e) => onSearchTermChange(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>

          <div className="max-h-64 overflow-y-auto space-y-2">
            {filteredStudents.length === 0 ? (
              <p className="text-stone-500 text-center py-4">
                {searchTerm
                  ? "Nenhum aluno encontrado"
                  : "Todos os alunos já estão matriculados"}
              </p>
            ) : (
              filteredStudents.map((student) => (
                <div
                  key={student.id}
                  className="flex justify-between items-center p-3 bg-white rounded border hover:border-teal-300 transition-colors"
                >
                  <div>
                    <p className="font-medium">{student.name}</p>
                    <p className="text-sm text-stone-600">
                      {student.email}
                    </p>
                  </div>
                  <Button
                    size="sm"
                    onClick={() => onAddStudent(student.id)}
                  >
                    <UserPlus className="w-4 h-4" />
                  </Button>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      <div className="space-y-2">
        {students.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16">
            <div className="h-16 w-16 rounded-2xl flex items-center justify-center mb-4" style={{ backgroundColor: "#ccfbf1" }}>
              <Users className="w-7 h-7" style={{ color: "#0d9488" }} />
            </div>
            <p className="text-sm font-medium text-stone-600">Nenhum aluno matriculado</p>
            <p className="text-xs text-stone-400 mt-1">Adicione alunos a esta turma</p>
          </div>
        ) : (
          students.map((student) => (
            <div
              key={student.id}
              className="flex justify-between items-center p-4 bg-stone-50 rounded-lg hover:bg-stone-100 transition-colors"
            >
              <div>
                <p className="font-medium">{student.studentName}</p>
                <p className="text-sm text-stone-600">
                  {student.studentEmail}
                </p>
                <p className="text-xs text-stone-500 mt-1">
                  Matriculado em:{" "}
                  {new Date(student.enrolledAt).toLocaleDateString("pt-BR")}
                </p>
              </div>
              {hasAnyRole(["professor", "admin"]) && (
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => onRemoveStudent(student.studentId)}
                  className="text-red-600 hover:text-red-700 hover:bg-red-50"
                >
                  <UserMinus className="w-4 h-4" />
                </Button>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
}
