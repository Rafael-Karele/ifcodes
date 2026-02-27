import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/table";
import {
  getAllProfessors,
  createProfessor,
  updateProfessor,
  deleteProfessor,
} from "@/services/ProfessorsService";
import type { Professor } from "@/types";
import { useEffect, useState } from "react";
import {
  GraduationCap,
  Plus,
  Pencil,
  Trash2,
  X,
  Mail,
  UserCircle,
  Briefcase,
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

// Interface para props do modal de formulario
interface ProfessorFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (professor: Omit<Professor, "id"> | Professor) => void;
  professor: Professor | null;
  mode: "create" | "edit";
}

// Componente de modal de formulario para criar/editar professor
function ProfessorFormModal({
  isOpen,
  onClose,
  onSave,
  professor,
  mode,
}: ProfessorFormModalProps) {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    area_atuacao: "",
    password: "",
    password_confirmation: "",
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  // Atualiza o formulario quando o professor selecionado muda
  useEffect(() => {
    if (professor && mode === "edit") {
      setFormData({
        name: professor.name,
        email: professor.email,
        area_atuacao: professor.area_atuacao,
        password: "",
        password_confirmation: "",
      });
    } else {
      setFormData({
        name: "",
        email: "",
        area_atuacao: "",
        password: "",
        password_confirmation: "",
      });
    }
    setErrors({});
  }, [professor, mode, isOpen]);

  // Valida o email
  const isValidEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  // Valida o formulario
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

    if (!formData.area_atuacao.trim()) {
      newErrors.area_atuacao = "Área de atuação é obrigatória";
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

  // Submete o formulario
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    const professorData: Partial<Professor> = {
      name: formData.name,
      email: formData.email,
      area_atuacao: formData.area_atuacao,
    };

    // Adiciona senha apenas se foi preenchida
    if (formData.password) {
      professorData.password = formData.password;
      professorData.password_confirmation = formData.password_confirmation;
    }

    // Adiciona ID se for edicao
    if (mode === "edit" && professor) {
      professorData.id = professor.id;
    }

    onSave(professorData as Omit<Professor, "id"> | Professor);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
        {/* Header do modal */}
        <div className="flex items-center justify-between p-6 border-b border-stone-200">
          <h2 className="text-xl font-bold text-stone-900 flex items-center gap-2">
            <GraduationCap className="w-5 h-5" style={{ color: palette.accent }} />
            {mode === "create" ? "Novo Professor" : "Editar Professor"}
          </h2>
          <button
            onClick={onClose}
            className="text-stone-400 hover:text-stone-600 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Formulario */}
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
                placeholder="Nome completo do professor"
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

          {/* Area de Atuacao */}
          <div>
            <label className="block text-sm font-medium text-stone-600 mb-1">
              Área de Atuação *
            </label>
            <div className="relative">
              <Briefcase className="absolute left-3 top-1/2 transform -translate-y-1/2 text-stone-400 w-5 h-5" />
              <input
                type="text"
                value={formData.area_atuacao}
                onChange={(e) =>
                  setFormData({ ...formData, area_atuacao: e.target.value })
                }
                className={`w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent ${
                  errors.area_atuacao ? "border-red-500" : "border-stone-300"
                }`}
                placeholder="Ex: Matemática, Física, Programação"
              />
            </div>
            {errors.area_atuacao && (
              <p className="text-red-500 text-xs mt-1">{errors.area_atuacao}</p>
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
              placeholder="Mínimo 8 caracteres"
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

          {/* Botoes */}
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
              className="flex-1 px-4 py-2 text-white rounded-lg hover:opacity-90 font-medium transition-opacity"
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

// Interface para props do dialog de confirmacao
interface DeleteConfirmDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  professorName: string;
}

// Dialog de confirmacao de remocao
function DeleteConfirmDialog({
  isOpen,
  onClose,
  onConfirm,
  professorName,
}: DeleteConfirmDialogProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-xl max-w-md w-full p-6" style={{ borderColor: palette.border }}>
        <div className="flex items-center gap-3 mb-4">
          <div className="p-2 rounded-lg" style={{ backgroundColor: palette.dangerBg }}>
            <Trash2 className="w-6 h-6" style={{ color: palette.dangerText }} />
          </div>
          <h2 className="text-xl font-bold text-stone-900">Confirmar Remoção</h2>
        </div>

        <p className="text-stone-500 mb-6">
          Tem certeza que deseja remover o professor{" "}
          <span className="font-semibold text-stone-900">{professorName}</span>?
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
            className="flex-1 px-4 py-2 text-white rounded-lg hover:opacity-90 font-medium transition-opacity"
            style={{ backgroundColor: palette.dangerText }}
          >
            Confirmar Remoção
          </button>
        </div>
      </div>
    </div>
  );
}

// Componente principal da pagina de gerenciamento de professores
export default function Teachers() {
  const [professors, setProfessors] = useState<Professor[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedProfessor, setSelectedProfessor] = useState<Professor | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<"create" | "edit">("create");
  const [notification, setNotification] = useState<{
    message: string;
    type: "success" | "error" | "warning";
  } | null>(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [professorToDelete, setProfessorToDelete] = useState<Professor | null>(null);

  // Carrega os professores ao montar o componente
  useEffect(() => {
    loadProfessors();
  }, []);

  // Funcao para carregar todos os professores
  async function loadProfessors() {
    setLoading(true);
    try {
      const data = await getAllProfessors();
      setProfessors(data);
    } catch (_error) {
      setNotification({
        message: "Erro ao carregar professores",
        type: "error",
      });
    } finally {
      setLoading(false);
    }
  }

  // Abre o modal de criacao
  function handleCreate() {
    setSelectedProfessor(null);
    setModalMode("create");
    setIsModalOpen(true);
  }

  // Abre o modal de edicao
  function handleEdit(professor: Professor) {
    setSelectedProfessor(professor);
    setModalMode("edit");
    setIsModalOpen(true);
  }

  // Abre o dialog de confirmacao de remocao
  function handleDeleteClick(professor: Professor) {
    setProfessorToDelete(professor);
    setIsDeleteDialogOpen(true);
  }

  // Confirma a remocao do professor
  async function confirmDelete() {
    if (!professorToDelete) return;

    try {
      await deleteProfessor(professorToDelete.id);
      setIsDeleteDialogOpen(false);
      setProfessorToDelete(null);

      // Recarrega a lista de professores
      await loadProfessors();

      setNotification({
        message: "Professor removido com sucesso!",
        type: "success",
      });
    } catch (_error) {
      setNotification({
        message: "Erro ao remover professor",
        type: "error",
      });
      setIsDeleteDialogOpen(false);
      setProfessorToDelete(null);
    }
  }

  // Salva o professor (criacao ou edicao)
  async function handleSave(professorData: Omit<Professor, "id"> | Professor) {
    try {
      if (modalMode === "create") {
        await createProfessor(professorData as Omit<Professor, "id">);
      } else {
        const { id, ...dataToUpdate } = professorData as Professor;
        await updateProfessor(id, dataToUpdate);
      }

      // Fecha o modal
      setIsModalOpen(false);

      // Recarrega a lista de professores
      await loadProfessors();

      // Mostra notificacao de sucesso
      setNotification({
        message: modalMode === "create"
          ? "Professor criado com sucesso!"
          : "Professor atualizado com sucesso!",
        type: "success",
      });
    } catch (error) {
      let errorMessage = "Erro ao salvar professor";
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

  // Filtra professores conforme o termo de busca
  const filteredProfessors = professors.filter((professor) => {
    const searchLower = searchTerm.toLowerCase();
    return (
      professor.name.toLowerCase().includes(searchLower) ||
      professor.email.toLowerCase().includes(searchLower) ||
      professor.area_atuacao.toLowerCase().includes(searchLower)
    );
  });

  return (
    <div className="min-h-[80vh]">
      {/* ---- scoped keyframes ---- */}
      <style>{`
        @keyframes teachers-fade-up {
          from { opacity: 0; transform: translateY(18px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        .teacher-row {
          animation: teachers-fade-up .45s cubic-bezier(.22,1,.36,1) both;
        }
      `}</style>

      {/* Notificacao */}
      {notification && (
        <Notification
          message={notification.message}
          type={notification.type}
          onClose={() => setNotification(null)}
        />
      )}

      {/* ══════ HERO HEADER ══════ */}
      <HeroHeader
        icon={GraduationCap}
        title="Gerenciamento de Professores"
        description="Cadastre, edite e gerencie os professores da plataforma."
      />

      {/* ══════ SEARCH BAR + ADD BUTTON ══════ */}
      <div className="flex items-center gap-3 mb-6">
        <div className="flex-1">
          <SearchFilter
            searchTerm={searchTerm}
            onSearchChange={setSearchTerm}
            placeholder="Buscar por nome, área de atuação ou e-mail..."
          />
        </div>
        <button
          onClick={handleCreate}
          className="shrink-0 flex items-center gap-2 bg-teal-600 text-white font-semibold hover:bg-teal-700 transition-colors rounded-xl px-5 h-10"
        >
          <Plus className="w-4 h-4" />
          Adicionar Professor
        </button>
      </div>

      {/* ══════ TABLE ══════ */}
      <div
        className="rounded-2xl border shadow-sm overflow-hidden"
        style={{ borderColor: palette.border, backgroundColor: palette.cardBg }}
      >
        {loading ? (
          <div className="p-6">
            <Loading />
          </div>
        ) : filteredProfessors.length === 0 ? (
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
                ? "Nenhum professor encontrado"
                : "Nenhum professor cadastrado"}
            </p>
            <p className="mt-1 text-sm text-stone-400 max-w-xs">
              {searchTerm
                ? "Tente ajustar o termo de busca."
                : "Clique em 'Adicionar Professor' para começar."}
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
                <TableHead className="font-semibold text-stone-900">
                  <div className="flex items-center gap-2">
                    <Mail className="w-4 h-4" />
                    E-mail
                  </div>
                </TableHead>
                <TableHead className="font-semibold text-stone-900">
                  <div className="flex items-center gap-2">
                    <Briefcase className="w-4 h-4" />
                    Área de Atuação
                  </div>
                </TableHead>
                <TableHead className="font-semibold text-stone-900 text-center">
                  Ações
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredProfessors.map((professor, i) => (
                <TableRow
                  key={professor.id}
                  className="teacher-row hover:bg-stone-50 transition-colors duration-200"
                  style={{ animationDelay: `${i * 60}ms` }}
                >
                  <TableCell className="font-medium text-stone-900">
                    {professor.name}
                  </TableCell>
                  <TableCell className="text-stone-500">
                    {professor.email}
                  </TableCell>
                  <TableCell className="text-stone-500">
                    {professor.area_atuacao}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center justify-center gap-2">
                      <button
                        onClick={() => handleEdit(professor)}
                        className="p-2 rounded-lg text-stone-400 hover:text-teal-600 hover:bg-teal-50 transition-colors"
                        title="Editar professor"
                      >
                        <Pencil className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDeleteClick(professor)}
                        className="p-2 rounded-lg text-stone-400 hover:text-red-600 hover:bg-red-50 transition-colors"
                        title="Remover professor"
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

      {/* Modal de formulario */}
      <ProfessorFormModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={handleSave}
        professor={selectedProfessor}
        mode={modalMode}
      />

      {/* Dialog de confirmacao de remocao */}
      <DeleteConfirmDialog
        isOpen={isDeleteDialogOpen}
        onClose={() => {
          setIsDeleteDialogOpen(false);
          setProfessorToDelete(null);
        }}
        onConfirm={confirmDelete}
        professorName={professorToDelete?.name || ""}
      />
    </div>
  );
}
