import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/table";
import type { Student } from "@/types";
import {
  Pencil,
  Trash2,
  Mail,
  UserCircle,
  BookOpen,
  IdCard,
} from "lucide-react";

export interface StudentTableProps {
  students: Student[];
  onEdit: (student: Student) => void;
  onDelete: (student: Student) => void;
}

export function StudentTable({ students, onEdit, onDelete }: StudentTableProps) {
  return (
    <Table>
      <TableHeader>
        <TableRow className="bg-stone-50 hover:bg-stone-50">
          <TableHead className="text-sm font-semibold text-stone-900">
            <div className="flex items-center gap-2">
              <UserCircle className="h-4 w-4" />
              Nome
            </div>
          </TableHead>
          <TableHead className="hidden text-sm font-semibold text-stone-900 md:table-cell">
            <div className="flex items-center gap-2">
              <IdCard className="h-4 w-4" />
              Matrícula
            </div>
          </TableHead>
          <TableHead className="text-sm font-semibold text-stone-900">
            <div className="flex items-center gap-2">
              <BookOpen className="h-4 w-4" />
              Curso
            </div>
          </TableHead>
          <TableHead className="hidden text-sm font-semibold text-stone-900 md:table-cell">
            <div className="flex items-center gap-2">
              <Mail className="h-4 w-4" />
              E-mail
            </div>
          </TableHead>
          <TableHead className="text-center text-sm font-semibold text-stone-900 whitespace-nowrap">
            Ações
          </TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {students.map((student) => (
          <TableRow
            key={student.id}
            className="hover:bg-stone-50 transition-colors"
          >
            <TableCell className="max-w-[160px] truncate text-sm font-medium text-stone-900 sm:max-w-none">
              {student.name}
            </TableCell>
            <TableCell className="hidden text-sm text-stone-600 md:table-cell">
              {student.matricula}
            </TableCell>
            <TableCell className="max-w-[120px] truncate text-sm text-stone-600 sm:max-w-none">
              {student.curso?.nome ||
                (student.curso_id ? `Curso ${student.curso_id}` : "N/A")}
            </TableCell>
            <TableCell className="hidden text-sm text-stone-600 md:table-cell">
              {student.email}
            </TableCell>
            <TableCell>
              <div className="flex items-center justify-center gap-2">
                <button
                  onClick={() => onEdit(student)}
                  className="rounded-lg p-2.5 text-stone-400 transition-colors hover:bg-teal-50 hover:text-teal-600"
                  title="Editar aluno"
                >
                  <Pencil className="h-4 w-4" />
                </button>
                <button
                  onClick={() => onDelete(student)}
                  className="rounded-lg p-2.5 text-stone-400 transition-colors hover:bg-red-50 hover:text-red-600"
                  title="Remover aluno"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
