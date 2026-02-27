import {
  getAllStudents,
  createStudent,
  updateStudent,
  deleteStudent,
} from "@/services/StudentsService";
import { getAllCourses, type Curso } from "@/services/CoursesService";
import type { Student } from "@/types";
import { useEffect, useState } from "react";
import { Users, Plus } from "lucide-react";
import Notification from "@/components/Notification";
import Loading from "@/components/Loading";
import { HeroHeader } from "@/components/HeroHeader";
import { SearchFilter } from "@/components/SearchFilter";
import { EmptyState } from "@/components/EmptyState";
import { Button } from "@/components/ui/button";
import { StudentFormModal } from "./StudentFormModal";
import { DeleteStudentModal } from "./DeleteStudentModal";
import { StudentTable } from "./StudentTable";

// Componente principal da pagina de gerenciamento de alunos
export default function Students() {
  const [students, setStudents] = useState<Student[]>([]);
  const [cursos, setCursos] = useState<Curso[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<"create" | "edit">("create");
  const [notification, setNotification] = useState<{
    message: string;
    type: "success" | "error" | "warning";
  } | null>(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [studentToDelete, setStudentToDelete] = useState<Student | null>(null);

  // Carrega os alunos e cursos ao montar o componente
  useEffect(() => {
    loadStudents();
    loadCursos();
  }, []);

  // Funcao para carregar todos os cursos
  async function loadCursos() {
    try {
      const data = await getAllCourses();
      setCursos(data);
    } catch (error) {
      console.error("Erro ao carregar cursos:", error);
    }
  }

  // Funcao para carregar todos os alunos
  async function loadStudents() {
    setLoading(true);
    try {
      const data = await getAllStudents();
      setStudents(data);
    } catch (error) {
      console.error("Erro ao carregar alunos:", error);
      setNotification({
        message: "Erro ao carregar alunos",
        type: "error",
      });
    } finally {
      setLoading(false);
    }
  }

  // Abre o modal de criacao
  function handleCreate() {
    setSelectedStudent(null);
    setModalMode("create");
    setIsModalOpen(true);
  }

  // Abre o modal de edicao
  function handleEdit(student: Student) {
    setSelectedStudent(student);
    setModalMode("edit");
    setIsModalOpen(true);
  }

  // Abre o dialog de confirmacao de remocao
  function handleDeleteClick(student: Student) {
    setStudentToDelete(student);
    setIsDeleteDialogOpen(true);
  }

  // Confirma a remocao do aluno
  async function confirmDelete() {
    if (!studentToDelete) return;

    try {
      await deleteStudent(studentToDelete.id);
      setNotification({
        message: "Aluno removido com sucesso!",
        type: "success",
      });
      loadStudents();
    } catch (error) {
      console.error("Erro ao remover aluno:", error);
      setNotification({
        message: "Erro ao remover aluno",
        type: "error",
      });
    } finally {
      setIsDeleteDialogOpen(false);
      setStudentToDelete(null);
    }
  }

  // Salva o aluno (criacao ou edicao)
  async function handleSave(studentData: Omit<Student, "id"> | Student) {
    try {
      if (modalMode === "create") {
        await createStudent(studentData as Omit<Student, "id">);
        setNotification({
          message: "Aluno criado com sucesso!",
          type: "success",
        });
      } else {
        const { id, ...dataToUpdate } = studentData as Student;
        await updateStudent(id, dataToUpdate);
        setNotification({
          message: "Aluno atualizado com sucesso!",
          type: "success",
        });
      }
      setIsModalOpen(false);
      loadStudents();
    } catch (error) {
      console.error("Erro ao salvar aluno:", error);
      let errorMessage = "Erro ao salvar aluno";
      if (error && typeof error === "object" && "response" in error) {
        const axiosError = error as { response?: { data?: { message?: string } } };
        errorMessage = axiosError.response?.data?.message || errorMessage;
      }
      setNotification({
        message: errorMessage,
        type: "error",
      });
    }
  }

  // Filtra alunos conforme o termo de busca
  const filteredStudents = students.filter((student) => {
    const searchLower = searchTerm.toLowerCase();
    const matriculaStr = student.matricula?.toString() || "";
    return (
      student.name.toLowerCase().includes(searchLower) ||
      matriculaStr.toLowerCase().includes(searchLower) ||
      student.email.toLowerCase().includes(searchLower) ||
      student.curso?.nome.toLowerCase().includes(searchLower)
    );
  });

  return (
    <div className="mx-auto max-w-5xl px-4 py-3 sm:px-6 sm:py-5 min-h-[80vh]">
      {/* Notificacao */}
      {notification && (
        <Notification
          message={notification.message}
          type={notification.type}
          onClose={() => setNotification(null)}
        />
      )}

      {/* Hero / Header */}
      <HeroHeader
        icon={Users}
        title="Gerenciamento de Alunos"
        description="Cadastre, edite e gerencie os alunos da plataforma."
      />

      {/* Search bar + Add button */}
      <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="flex-1">
          <SearchFilter
            searchTerm={searchTerm}
            onSearchChange={setSearchTerm}
            placeholder="Buscar por nome, matrícula ou e-mail..."
          />
        </div>
        <Button
          onClick={handleCreate}
          className="shrink-0 gap-2 rounded-xl bg-teal-600 text-white hover:bg-teal-700"
          size="lg"
        >
          <Plus className="h-4 w-4" />
          <span className="hidden sm:inline">Adicionar Aluno</span>
          <span className="sm:hidden">Adicionar</span>
        </Button>
      </div>

      {/* Tabela de alunos */}
      <div className="rounded-xl border border-stone-200 bg-white">
        {loading ? (
          <div className="p-6">
            <Loading />
          </div>
        ) : filteredStudents.length === 0 ? (
          <EmptyState
            title={
              searchTerm
                ? "Nenhum aluno encontrado"
                : "Nenhum aluno cadastrado"
            }
            description={
              searchTerm
                ? "Tente ajustar o termo de busca."
                : "Clique em 'Adicionar Aluno' para começar."
            }
          />
        ) : (
          <StudentTable
            students={filteredStudents}
            onEdit={handleEdit}
            onDelete={handleDeleteClick}
          />
        )}
      </div>

      {/* Modal de formulario */}
      <StudentFormModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={handleSave}
        student={selectedStudent}
        mode={modalMode}
        cursos={cursos}
      />

      {/* Dialog de confirmacao de remocao */}
      <DeleteStudentModal
        isOpen={isDeleteDialogOpen}
        onClose={() => {
          setIsDeleteDialogOpen(false);
          setStudentToDelete(null);
        }}
        onConfirm={confirmDelete}
        studentName={studentToDelete?.name || ""}
      />
    </div>
  );
}
