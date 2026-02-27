import { useState, useEffect } from "react";
import { Plus, Codesandbox } from "lucide-react";
import { HeroHeader } from "@/components/HeroHeader";
import { SearchFilter } from "@/components/SearchFilter";
import { EmptyState } from "@/components/EmptyState";
import { Button } from "@/components/ui/button";
import { getAllProblems, createProblem, updateProblem, deleteProblem, getProblemById } from "@/services/ProblemsServices";
import type { Problem } from "@/types";
import Notification from "@/components/Notification";
import { ProblemCard } from "@/components/ProblemCard";
import { useUser } from "@/context/UserContext";
import ProblemViewModal from "@/components/ProblemViewModal";
import { ProblemFormModal } from "./ProblemFormModal";
import { DeleteConfirmModal } from "./DeleteConfirmModal";
import type { ProblemFormData } from "./ProblemFormModal";

export default function Problems() {
  const [problems, setProblems] = useState<Problem[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [editingProblem, setEditingProblem] = useState<Problem | null>(null);
  const [viewingProblem, setViewingProblem] = useState<Problem | null>(null);
  const [deletingProblem, setDeletingProblem] = useState<Problem | null>(null);
  const [notification, setNotification] = useState<{ type: 'success' | 'error', message: string } | null>(null);
  const { user } = useUser();

  useEffect(() => {
    loadProblems();
  }, []);

  const loadProblems = async () => {
    try {
      setLoading(true);
      const data = await getAllProblems();
      setProblems(data);
    } catch (_error) {
      setNotification({ type: 'error', message: 'Erro ao carregar problemas' });
    } finally {
      setLoading(false);
    }
  };

  const handleFormSave = async (data: ProblemFormData) => {
    try {
      if (editingProblem) {
        const result = await updateProblem(editingProblem.id, data);
        if (result) {
          setNotification({ type: 'success', message: 'Problema atualizado com sucesso!' });
          loadProblems();
        } else {
          setNotification({ type: 'error', message: 'Erro ao atualizar problema' });
        }
      } else {
        const result = await createProblem({ ...data, created_by: user?.id });
        if (result) {
          setNotification({ type: 'success', message: 'Problema criado com sucesso!' });
          loadProblems();
        } else {
          setNotification({ type: 'error', message: 'Erro ao criar problema' });
        }
      }

      setIsFormModalOpen(false);
      setEditingProblem(null);
    } catch (_error) {
      setNotification({ type: 'error', message: 'Erro ao salvar problema' });
    }
  };

  const handleEdit = async (problem: Problem) => {
    try {
      const fullProblem = await getProblemById(problem.id.toString());
      if (fullProblem) {
        setEditingProblem(fullProblem);
        setIsFormModalOpen(true);
      }
    } catch (_error) {
      setNotification({ type: 'error', message: 'Erro ao carregar dados do problema' });
    }
  };

  const handleView = async (problem: Problem) => {
    try {
      const fullProblem = await getProblemById(problem.id.toString());
      if (fullProblem) {
        setViewingProblem(fullProblem);
        setIsViewModalOpen(true);
      }
    } catch (_error) {
      setNotification({ type: 'error', message: 'Erro ao carregar problema' });
    }
  };

  const handleDeleteClick = (problem: Problem) => {
    setDeletingProblem(problem);
    setIsDeleteModalOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (deletingProblem) {
      try {
        const success = await deleteProblem(deletingProblem.id);
        if (success) {
          setNotification({ type: 'success', message: 'Problema excluido com sucesso!' });
          loadProblems();
        } else {
          setNotification({ type: 'error', message: 'Erro ao excluir problema' });
        }
      } catch (_error) {
        setNotification({ type: 'error', message: 'Erro ao excluir problema' });
      }
    }
    setIsDeleteModalOpen(false);
    setDeletingProblem(null);
  };

  const filteredProblems = problems.filter((problem) => {
    const searchLower = searchTerm.toLowerCase();
    return problem.title.toLowerCase().includes(searchLower);
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-teal-600" />
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-3 sm:py-5 min-h-[80vh]">
      {notification && (
        <Notification
          type={notification.type}
          message={notification.message}
          onClose={() => setNotification(null)}
        />
      )}

      <HeroHeader
        icon={Codesandbox}
        title="Gerenciamento de Problemas"
        description="Crie e gerencie problemas de programacao, defina casos de teste e acompanhe as atividades."
      />

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center mb-6">
        <div className="flex-1">
          <SearchFilter
            searchTerm={searchTerm}
            onSearchChange={setSearchTerm}
            placeholder="Buscar por titulo do problema..."
          />
        </div>
        <Button
          onClick={() => {
            setEditingProblem(null);
            setIsFormModalOpen(true);
          }}
          className="shrink-0 bg-teal-600 text-white font-semibold hover:bg-teal-700 transition-colors rounded-xl px-5 h-10"
        >
          <Plus className="w-4 h-4 mr-1.5" />
          <span className="hidden sm:inline">Adicionar Problema</span>
          <span className="sm:hidden">Adicionar</span>
        </Button>
      </div>

      {filteredProblems.length === 0 ? (
        <EmptyState
          title={searchTerm ? "Nenhum problema encontrado" : "Nenhum problema cadastrado"}
          description={
            searchTerm
              ? "Tente ajustar o termo de busca."
              : "Clique em 'Adicionar Problema' para comecar."
          }
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3 sm:gap-4">
          {filteredProblems.map((problem, i) => (
            <ProblemCard
              key={problem.id}
              problem={problem}
              index={i}
              onView={handleView}
              onEdit={handleEdit}
              onDelete={handleDeleteClick}
            />
          ))}
        </div>
      )}

      <ProblemFormModal
        isOpen={isFormModalOpen}
        onClose={() => {
          setIsFormModalOpen(false);
          setEditingProblem(null);
        }}
        onSave={handleFormSave}
        problem={editingProblem}
        mode={editingProblem ? "edit" : "create"}
      />

      <ProblemViewModal
        isOpen={isViewModalOpen}
        onClose={() => {
          setIsViewModalOpen(false);
          setViewingProblem(null);
        }}
        problem={viewingProblem}
      />

      <DeleteConfirmModal
        isOpen={isDeleteModalOpen}
        onClose={() => {
          setIsDeleteModalOpen(false);
          setDeletingProblem(null);
        }}
        onConfirm={handleDeleteConfirm}
        problemTitle={deletingProblem?.title || ""}
        activitiesCount={deletingProblem?.atividades_count}
      />
    </div>
  );
}
