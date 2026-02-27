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
  Mail,
  UserCircle,
  Briefcase,
} from "lucide-react";
import Notification from "@/components/Notification";
import Loading from "@/components/Loading";
import { HeroHeader } from "@/components/HeroHeader";
import { SearchFilter } from "@/components/SearchFilter";
import { EmptyState } from "@/components/EmptyState";
import { Button } from "@/components/ui/button";
import { TeacherFormModal } from "./TeacherFormModal";
import { DeleteTeacherModal } from "./DeleteTeacherModal";

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

  useEffect(() => { loadProfessors(); }, []);

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

  function handleCreate() {
    setSelectedProfessor(null);
    setModalMode("create");
    setIsModalOpen(true);
  }

  function handleEdit(professor: Professor) {
    setSelectedProfessor(professor);
    setModalMode("edit");
    setIsModalOpen(true);
  }

  function handleDeleteClick(professor: Professor) {
    setProfessorToDelete(professor);
    setIsDeleteDialogOpen(true);
  }

  async function confirmDelete() {
    if (!professorToDelete) return;

    try {
      await deleteProfessor(professorToDelete.id);
      setIsDeleteDialogOpen(false);
      setProfessorToDelete(null);

      await loadProfessors();
      setNotification({ message: "Professor removido com sucesso!", type: "success" });
    } catch (_error) {
      setNotification({ message: "Erro ao remover professor", type: "error" });
      setIsDeleteDialogOpen(false);
      setProfessorToDelete(null);
    }
  }

  async function handleSave(professorData: Omit<Professor, "id"> | Professor) {
    try {
      if (modalMode === "create") {
        await createProfessor(professorData as Omit<Professor, "id">);
      } else {
        const { id, ...dataToUpdate } = professorData as Professor;
        await updateProfessor(id, dataToUpdate);
      }

      setIsModalOpen(false);
      await loadProfessors();
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
      setNotification({ message: errorMessage, type: "error" });
    }
  }

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
      {notification && (
        <Notification
          message={notification.message}
          type={notification.type}
          onClose={() => setNotification(null)}
        />
      )}
      <HeroHeader
        icon={GraduationCap}
        title="Gerenciamento de Professores"
        description="Cadastre, edite e gerencie os professores da plataforma."
      />
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center mb-6">
        <div className="flex-1">
          <SearchFilter
            searchTerm={searchTerm}
            onSearchChange={setSearchTerm}
            placeholder="Buscar por nome, área de atuação ou e-mail..."
          />
        </div>
        <Button
          onClick={handleCreate}
          className="shrink-0 rounded-xl bg-teal-600 text-white hover:bg-teal-700"
          size="lg"
        >
          <Plus className="h-4 w-4" />
          <span className="hidden sm:inline">Adicionar Professor</span>
          <span className="sm:hidden">Adicionar</span>
        </Button>
      </div>
      <div className="rounded-xl border border-stone-200 bg-white overflow-hidden">
        {loading ? (
          <div className="p-6">
            <Loading />
          </div>
        ) : filteredProfessors.length === 0 ? (
          <EmptyState
            icon={GraduationCap}
            title={
              searchTerm
                ? "Nenhum professor encontrado"
                : "Nenhum professor cadastrado"
            }
            description={
              searchTerm
                ? "Tente ajustar o termo de busca."
                : "Clique em 'Adicionar Professor' para começar."
            }
          />
        ) : (
          <Table>
            <TableHeader>
              <TableRow className="bg-stone-50 hover:bg-stone-50">
                <TableHead className="font-semibold text-stone-900">
                  <div className="flex items-center gap-2">
                    <UserCircle className="h-4 w-4" />
                    Nome
                  </div>
                </TableHead>
                <TableHead className="hidden font-semibold text-stone-900 sm:table-cell">
                  <div className="flex items-center gap-2">
                    <Mail className="h-4 w-4" />
                    E-mail
                  </div>
                </TableHead>
                <TableHead className="hidden font-semibold text-stone-900 md:table-cell">
                  <div className="flex items-center gap-2">
                    <Briefcase className="h-4 w-4" />
                    Área de Atuação
                  </div>
                </TableHead>
                <TableHead className="font-semibold text-stone-900 text-center">
                  Ações
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredProfessors.map((professor) => (
                <TableRow
                  key={professor.id}
                  className="hover:bg-stone-50 transition-colors"
                >
                  <TableCell>
                    <div>
                      <span className="font-medium text-sm text-stone-900 sm:text-base">
                        {professor.name}
                      </span>
                      <p className="text-xs text-stone-400 sm:hidden">
                        {professor.email}
                      </p>
                      <p className="text-xs text-stone-400 md:hidden sm:hidden">
                        {professor.area_atuacao}
                      </p>
                    </div>
                  </TableCell>
                  <TableCell className="hidden text-sm text-stone-500 sm:table-cell">
                    {professor.email}
                  </TableCell>
                  <TableCell className="hidden text-sm text-stone-500 md:table-cell">
                    {professor.area_atuacao}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center justify-center gap-1 sm:gap-2">
                      <button
                        onClick={() => handleEdit(professor)}
                        className="rounded-lg p-2 text-stone-400 transition-colors hover:bg-teal-50 hover:text-teal-600"
                        title="Editar professor"
                      >
                        <Pencil className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => handleDeleteClick(professor)}
                        className="rounded-lg p-2 text-stone-400 transition-colors hover:bg-red-50 hover:text-red-600"
                        title="Remover professor"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </div>
      <TeacherFormModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={handleSave}
        professor={selectedProfessor}
        mode={modalMode}
      />
      <DeleteTeacherModal
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
