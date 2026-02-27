import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/table";
import {
  getAllStudents,
  createStudent,
  updateStudent,
  deleteStudent,
} from "@/services/StudentsService";
import { getAllCourses, type Curso } from "@/services/CoursesService";
import type { Student } from "@/types";
import { useEffect, useState } from "react";
import {
  Users,
  Plus,
  Pencil,
  Trash2,
  X,
  Mail,
  UserCircle,
  BookOpen,
  IdCard,
  Sparkles,
} from "lucide-react";
import Notification from "@/components/Notification";
import Loading from "@/components/Loading";
import { HeroHeader } from "@/components/HeroHeader";
import { SearchFilter } from "@/components/SearchFilter";

/* ── palette tokens (inline, no global leak) ────────────────── */
const palette = {
  accent: "#0d9488",        // teal-600
  accentLight: "#ccfbf1",   // teal-100
  accentSoft: "#f0fdfa",    // teal-50
  warm: "#f59e0b",          // amber-500
  warmLight: "#fef3c7",     // amber-100
  surface: "#fafaf9",       // stone-50
  cardBg: "#ffffff",
  textPrimary: "#1c1917",   // stone-900
  textSecondary: "#78716c", // stone-500
  border: "#e7e5e4",        // stone-300
  dangerText: "#dc2626",
  dangerBg: "#fef2f2",
};


// Interface para props do modal de formulário
interface StudentFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (student: Omit<Student, "id"> | Student) => void;
  student: Student | null;
  mode: "create" | "edit";
  cursos: Curso[];
}

// Componente de modal de formulário para criar/editar aluno
function StudentFormModal({
  isOpen,
  onClose,
  onSave,
  student,
  mode,
  cursos,
}: StudentFormModalProps) {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    matricula: "",
    curso_id: "",
    password: "",
    password_confirmation: "",
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  // Atualiza o formulário quando o aluno selecionado muda
  useEffect(() => {
    if (student && mode === "edit") {
      const cursoId = student.curso_id || student.curso?.id || "";
      setFormData({
        name: student.name,
        email: student.email,
        matricula: student.matricula?.toString() || "",
        curso_id: cursoId.toString(),
        password: "",
        password_confirmation: "",
      });
    } else {
      setFormData({
        name: "",
        email: "",
        matricula: "",
        curso_id: "",
        password: "",
        password_confirmation: "",
      });
    }
    setErrors({});
  }, [student, mode, isOpen]);

  // Valida o email
  const isValidEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  // Valida o formulário
  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) {
      newErrors.name = "Nome é obrigatório";
    }

    if (!formData.email.trim()) {
      newErrors.email = "E-mail é obrigatório";
    } else if (!isValidEmail(formData.email)) {
      newErrors.email = "E-mail inválido";
    }

    if (!formData.matricula.trim()) {
      newErrors.matricula = "Matrícula é obrigatória";
    }

    if (!formData.curso_id.trim()) {
      newErrors.curso_id = "Curso é obrigatório";
    }

    if (mode === "create") {
      if (!formData.password) {
        newErrors.password = "Senha é obrigatória";
      } else if (formData.password.length < 8) {
        newErrors.password = "Senha deve ter no mínimo 8 caracteres";
      }

      if (formData.password !== formData.password_confirmation) {
        newErrors.password_confirmation = "As senhas não coincidem";
      }
    } else if (mode === "edit" && formData.password) {
      if (formData.password.length < 8) {
        newErrors.password = "Senha deve ter no mínimo 8 caracteres";
      }

      if (formData.password !== formData.password_confirmation) {
        newErrors.password_confirmation = "As senhas não coincidem";
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Submete o formulário
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    const studentData: Partial<Student> = {
      name: formData.name,
      email: formData.email,
      matricula: formData.matricula,
      curso_id: parseInt(formData.curso_id),
    };

    // Adiciona senha apenas se foi preenchida
    if (formData.password) {
      studentData.password = formData.password;
      studentData.password_confirmation = formData.password_confirmation;
    }

    // Adiciona ID se for edição
    if (mode === "edit" && student) {
      studentData.id = student.id;
    }

    onSave(studentData as Omit<Student, "id"> | Student);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
        {/* Header do modal */}
        <div className="flex items-center justify-between p-6 border-b border-stone-200">
          <h2 className="text-xl font-bold text-stone-900 flex items-center gap-2">
            <Users className="w-5 h-5 text-teal-600" />
            {mode === "create" ? "Novo Aluno" : "Editar Aluno"}
          </h2>
          <button
            onClick={onClose}
            className="p-2 -mr-2 rounded-lg text-stone-400 hover:text-stone-600 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Formulário */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {/* Nome */}
          <div>
            <label className="block text-sm font-medium text-stone-600 mb-1">
              Nome *
            </label>
            <div className="relative">
              <UserCircle className="absolute left-3 top-1/2 transform -translate-y-1/2 text-stone-400 w-5 h-5" />
              <input
                type="text"
                value={formData.name}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
                className={`w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent ${
                  errors.name ? "border-red-500" : "border-stone-300"
                }`}
                placeholder="Nome completo do aluno"
              />
            </div>
            {errors.name && (
              <p className="text-red-500 text-xs mt-1">{errors.name}</p>
            )}
          </div>

          {/* E-mail */}
          <div>
            <label className="block text-sm font-medium text-stone-600 mb-1">
              E-mail *
            </label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-stone-400 w-5 h-5" />
              <input
                type="email"
                value={formData.email}
                onChange={(e) =>
                  setFormData({ ...formData, email: e.target.value })
                }
                className={`w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent ${
                  errors.email ? "border-red-500" : "border-stone-300"
                }`}
                placeholder="email@exemplo.com"
              />
            </div>
            {errors.email && (
              <p className="text-red-500 text-xs mt-1">{errors.email}</p>
            )}
          </div>

          {/* Matrícula */}
          <div>
            <label className="block text-sm font-medium text-stone-600 mb-1">
              Matrícula *
            </label>
            <div className="relative">
              <IdCard className="absolute left-3 top-1/2 transform -translate-y-1/2 text-stone-400 w-5 h-5" />
              <input
                type="text"
                value={formData.matricula}
                onChange={(e) =>
                  setFormData({ ...formData, matricula: e.target.value })
                }
                disabled={mode === "edit"}
                className={`w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent ${
                  mode === "edit" ? "bg-stone-100 cursor-not-allowed" : ""
                } ${errors.matricula ? "border-red-500" : "border-stone-300"}`}
                placeholder="202501001"
              />
            </div>
            {errors.matricula && (
              <p className="text-red-500 text-xs mt-1">{errors.matricula}</p>
            )}
          </div>

          {/* Curso */}
          <div>
            <label className="block text-sm font-medium text-stone-600 mb-1">
              Curso *
            </label>
            <div className="relative">
              <BookOpen className="absolute left-3 top-1/2 transform -translate-y-1/2 text-stone-400 w-5 h-5" />
              <select
                value={formData.curso_id}
                onChange={(e) =>
                  setFormData({ ...formData, curso_id: e.target.value })
                }
                className={`w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent ${
                  errors.curso_id ? "border-red-500" : "border-stone-300"
                }`}
              >
                <option value="">Selecione um curso</option>
                {cursos.map((curso) => (
                  <option key={curso.id} value={curso.id}>
                    {curso.nome}
                  </option>
                ))}
              </select>
            </div>
            {errors.curso_id && (
              <p className="text-red-500 text-xs mt-1">{errors.curso_id}</p>
            )}
          </div>

          {/* Senha */}
          <div>
            <label className="block text-sm font-medium text-stone-600 mb-1">
              Senha {mode === "create" ? "*" : "(opcional)"}
            </label>
            <input
              type="password"
              value={formData.password}
              onChange={(e) =>
                setFormData({ ...formData, password: e.target.value })
              }
              className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent ${
                errors.password ? "border-red-500" : "border-stone-300"
              }`}
              placeholder="Mínimo 6 caracteres"
            />
            {errors.password && (
              <p className="text-red-500 text-xs mt-1">{errors.password}</p>
            )}
          </div>

          {/* Confirmar Senha */}
          <div>
            <label className="block text-sm font-medium text-stone-600 mb-1">
              Confirmar Senha {mode === "create" ? "*" : "(opcional)"}
            </label>
            <input
              type="password"
              value={formData.password_confirmation}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  password_confirmation: e.target.value,
                })
              }
              className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent ${
                errors.password_confirmation
                  ? "border-red-500"
                  : "border-stone-300"
              }`}
              placeholder="Repita a senha"
            />
            {errors.password_confirmation && (
              <p className="text-red-500 text-xs mt-1">
                {errors.password_confirmation}
              </p>
            )}
          </div>

          {/* Botões */}
          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 border border-stone-300 rounded-lg text-stone-700 hover:bg-stone-50 font-medium transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="flex-1 px-4 py-2 text-white rounded-lg font-medium transition-colors hover:opacity-90"
              style={{ backgroundColor: palette.accent }}
            >
              {mode === "create" ? "Criar" : "Salvar"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// Interface para props do dialog de confirmação
interface DeleteConfirmDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  studentName: string;
}

// Dialog de confirmação de remoção
function DeleteConfirmDialog({
  isOpen,
  onClose,
  onConfirm,
  studentName,
}: DeleteConfirmDialogProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-xl max-w-md w-full p-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="p-2 bg-red-100 rounded-lg">
            <Trash2 className="w-6 h-6 text-red-600" />
          </div>
          <h2 className="text-xl font-bold text-stone-900">Confirmar Remoção</h2>
        </div>

        <p className="text-stone-600 mb-6">
          Tem certeza que deseja remover o aluno{" "}
          <span className="font-semibold text-stone-900">{studentName}</span>?
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
            Confirmar Remoção
          </button>
        </div>
      </div>
    </div>
  );
}

// Componente principal da página de gerenciamento de alunos
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

  // Função para carregar todos os cursos
  async function loadCursos() {
    try {
      const data = await getAllCourses();
      setCursos(data);
    } catch (error) {
      console.error("Erro ao carregar cursos:", error);
    }
  }

  // Função para carregar todos os alunos
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

  // Abre o modal de criação
  function handleCreate() {
    setSelectedStudent(null);
    setModalMode("create");
    setIsModalOpen(true);
  }

  // Abre o modal de edição
  function handleEdit(student: Student) {
    setSelectedStudent(student);
    setModalMode("edit");
    setIsModalOpen(true);
  }

  // Abre o dialog de confirmação de remoção
  function handleDeleteClick(student: Student) {
    setStudentToDelete(student);
    setIsDeleteDialogOpen(true);
  }

  // Confirma a remoção do aluno
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

  // Salva o aluno (criação ou edição)
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
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-3 sm:py-5 min-h-[80vh]">
      {/* ---- scoped keyframes ---- */}
      <style>{`
        @keyframes students-fade-up {
          from { opacity: 0; transform: translateY(18px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        .stu-row {
          animation: students-fade-up .45s cubic-bezier(.22,1,.36,1) both;
        }
      `}</style>

      {/* Notificação */}
      {notification && (
        <Notification
          message={notification.message}
          type={notification.type}
          onClose={() => setNotification(null)}
        />
      )}

      {/* ═══════ HERO / HEADER AREA ═══════ */}
      <HeroHeader
        icon={Users}
        title="Gerenciamento de Alunos"
        description="Cadastre, edite e gerencie os alunos da plataforma."
      />

      {/* ═══════ SEARCH BAR + ADD BUTTON ═══════ */}
      <div className="flex items-center gap-3 mb-6">
        <div className="flex-1">
          <SearchFilter
            searchTerm={searchTerm}
            onSearchChange={setSearchTerm}
            placeholder="Buscar por nome, matrícula ou e-mail..."
          />
        </div>
        <button
          onClick={handleCreate}
          className="shrink-0 flex items-center justify-center gap-2 bg-teal-600 text-white font-semibold hover:bg-teal-700 transition-colors rounded-xl px-5 h-10"
        >
          <Plus className="w-4 h-4" />
          Adicionar Aluno
        </button>
      </div>

      {/* ═══════ TABELA DE ALUNOS ═══════ */}
      <div
        className="bg-white rounded-2xl border shadow-sm overflow-x-auto"
        style={{ borderColor: palette.border }}
      >
        {loading ? (
          <div className="p-6">
            <Loading />
          </div>
        ) : filteredStudents.length === 0 ? (
          /* ── empty state ── */
          <div className="flex flex-col items-center justify-center py-24 text-center">
            <div
              className="mb-5 flex h-20 w-20 items-center justify-center rounded-2xl"
              style={{ background: palette.accentLight }}
            >
              <Sparkles className="w-9 h-9" style={{ color: palette.accent }} />
            </div>
            <p className="text-lg font-semibold text-stone-700">
              {searchTerm
                ? "Nenhum aluno encontrado"
                : "Nenhum aluno cadastrado"}
            </p>
            <p className="mt-1 text-sm text-stone-400 max-w-xs">
              {searchTerm
                ? "Tente ajustar o termo de busca."
                : "Clique em 'Adicionar Aluno' para começar."}
            </p>
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow className="bg-stone-50 hover:bg-stone-50">
                <TableHead className="font-semibold text-stone-900">
                  <div className="flex items-center gap-2">
                    <UserCircle className="w-4 h-4" />
                    Nome
                  </div>
                </TableHead>
                <TableHead className="hidden md:table-cell font-semibold text-stone-900">
                  <div className="flex items-center gap-2">
                    <IdCard className="w-4 h-4" />
                    Matrícula
                  </div>
                </TableHead>
                <TableHead className="font-semibold text-stone-900">
                  <div className="flex items-center gap-2">
                    <BookOpen className="w-4 h-4" />
                    Curso
                  </div>
                </TableHead>
                <TableHead className="hidden md:table-cell font-semibold text-stone-900">
                  <div className="flex items-center gap-2">
                    <Mail className="w-4 h-4" />
                    E-mail
                  </div>
                </TableHead>
                <TableHead className="font-semibold text-stone-900 text-center whitespace-nowrap">
                  Ações
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredStudents.map((student, i) => (
                <TableRow
                  key={student.id}
                  className="stu-row hover:bg-stone-50 transition-colors duration-200"
                  style={{ animationDelay: `${i * 60}ms` }}
                >
                  <TableCell className="font-medium text-stone-900 max-w-[160px] sm:max-w-none truncate">
                    {student.name}
                  </TableCell>
                  <TableCell className="hidden md:table-cell text-stone-600">
                    {student.matricula}
                  </TableCell>
                  <TableCell className="text-stone-600 max-w-[120px] sm:max-w-none truncate">
                    {student.curso?.nome || (student.curso_id ? `Curso ${student.curso_id}` : "N/A")}
                  </TableCell>
                  <TableCell className="hidden md:table-cell text-stone-600">
                    {student.email}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center justify-center gap-2">
                      <button
                        onClick={() => handleEdit(student)}
                        className="p-2.5 text-stone-400 hover:text-teal-600 hover:bg-teal-50 rounded-lg transition-colors"
                        title="Editar aluno"
                      >
                        <Pencil className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDeleteClick(student)}
                        className="p-2.5 text-stone-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                        title="Remover aluno"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </div>

      {/* Modal de formulário */}
      <StudentFormModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={handleSave}
        student={selectedStudent}
        mode={modalMode}
        cursos={cursos}
      />

      {/* Dialog de confirmação de remoção */}
      <DeleteConfirmDialog
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
