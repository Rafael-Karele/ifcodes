import { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router";
import type { Class, CreateClassDTO } from "@/types/classes";
import ClassesService from "@/services/ClassesService";
import { Button } from "@/components/ui/button";
import Loading from "@/components/Loading";
import Notification from "@/components/Notification";
import {
  Plus,
  BookOpen,
  X,
  Sparkles,
} from "lucide-react";
import { SearchFilter } from "@/components/SearchFilter";
import { HeroHeader } from "@/components/HeroHeader";
import { useUserRole } from "@/hooks/useUserRole";
import { useUser } from "@/context/UserContext";
import { ClassCard } from "./ClassCard";
import { ClassFormInline } from "./ClassFormInline";

/* ================================================================== */
export default function Classes() {
  const navigate = useNavigate();
  const { hasAnyRole } = useUserRole();
  const { user } = useUser();

  const [classes, setClasses] = useState<Class[]>([]);
  const [filteredClasses, setFilteredClasses] = useState<Class[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingClass, setEditingClass] = useState<Class | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [notification, setNotification] = useState<{
    message: string;
    type: "success" | "error";
  } | null>(null);
  const [formData, setFormData] = useState<CreateClassDTO>({
    nome: "",
    professor_id: 0,
  });

  /* refs for staggered card animation */
  const gridRef = useRef<HTMLDivElement>(null);

  /* ── data loading ───────────────────────────────────────── */
  useEffect(() => {
    loadClasses();
    if (user && user.roles?.includes("professor")) {
      setFormData((prev) => ({ ...prev, professor_id: user.id }));
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  useEffect(() => {
    filterClasses();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchTerm, classes]);

  const loadClasses = async () => {
    try {
      setLoading(true);
      if (user && user.roles && user.roles.includes("student")) {
        const data = await ClassesService.getClassesByStudent();
        setClasses(data);
        setFilteredClasses(data);
      } else {
        const data = await ClassesService.getAllClasses();
        setClasses(data);
        setFilteredClasses(data);
      }
    } catch (error) {
      console.error("Erro ao carregar turmas:", error);
      showNotification("Erro ao carregar turmas", "error");
    } finally {
      setLoading(false);
    }
  };

  const filterClasses = () => {
    if (!searchTerm.trim()) {
      setFilteredClasses(classes);
      return;
    }
    const filtered = classes.filter((cls) =>
      cls.nome.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredClasses(filtered);
  };

  /* ── CRUD handlers ──────────────────────────────────────── */
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingClass) {
        await ClassesService.updateClass(editingClass.id, formData);
        showNotification("Turma atualizada com sucesso!", "success");
      } else {
        await ClassesService.createClass(formData);
        showNotification("Turma criada com sucesso!", "success");
      }
      resetForm();
      loadClasses();
    } catch (error) {
      console.error("Erro ao salvar turma:", error);
      showNotification("Erro ao salvar turma", "error");
    }
  };

  const handleEdit = (cls: Class) => {
    setEditingClass(cls);
    setFormData({ nome: cls.nome, professor_id: cls.professor_id });
    setShowForm(true);
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Tem certeza que deseja excluir esta turma?")) return;
    try {
      await ClassesService.deleteClass(id);
      showNotification("Turma excluída com sucesso!", "success");
      loadClasses();
    } catch (error) {
      console.error("Erro ao excluir turma:", error);
      showNotification("Erro ao excluir turma", "error");
    }
  };

  const resetForm = () => {
    setFormData({ nome: "", professor_id: user?.id || 0 });
    setEditingClass(null);
    setShowForm(false);
  };

  const showNotification = (message: string, type: "success" | "error") => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 3000);
  };

  /* ── loading state ──────────────────────────────────────── */
  if (loading) return <Loading />;

  const isProfOrAdmin = hasAnyRole(["professor", "admin"]);

  /* ================================================================ */
  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-3 sm:py-5 min-h-[80vh]">
      {/* ---- scoped keyframes ---- */}
      <style>{`
        @keyframes classes-fade-up {
          from { opacity: 0; transform: translateY(18px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes classes-slide-down {
          from { opacity: 0; max-height: 0; padding-top: 0; padding-bottom: 0; }
          to   { opacity: 1; max-height: 480px; }
        }
        .cls-card {
          animation: classes-fade-up .45s cubic-bezier(.22,1,.36,1) both;
        }
        .cls-form-enter {
          animation: classes-slide-down .35s cubic-bezier(.22,1,.36,1) both;
          overflow: hidden;
        }
      `}</style>

      {notification && (
        <Notification
          message={notification.message}
          type={notification.type}
          onClose={() => setNotification(null)}
        />
      )}

      {/* ======= HERO / HEADER AREA ======= */}
      <HeroHeader
        icon={BookOpen}
        title="Minhas Turmas"
        description={isProfOrAdmin
          ? "Gerencie suas turmas, adicione alunos e acompanhe o progresso de cada grupo."
          : "Veja as turmas em que você está matriculado e acesse as atividades."}
      />

      {/* ======= SEARCH BAR + NEW CLASS BUTTON ======= */}
      <div className="flex items-center gap-3 mb-6">
        <div className="flex-1">
          <SearchFilter
            searchTerm={searchTerm}
            onSearchChange={setSearchTerm}
            placeholder="Buscar turma por nome…"
          />
        </div>
        {isProfOrAdmin && (
          <Button
            onClick={() => setShowForm(!showForm)}
            className="shrink-0 bg-teal-600 text-white font-semibold hover:bg-teal-700 transition-colors rounded-xl px-5 h-10"
          >
            {showForm ? (
              <>
                <X className="w-4 h-4 mr-1.5" /> Fechar
              </>
            ) : (
              <>
                <Plus className="w-4 h-4 mr-1.5" /> Nova Turma
              </>
            )}
          </Button>
        )}
      </div>

      {/* ── inline form ── */}
      {showForm && (
        <ClassFormInline
          formData={formData}
          editingClass={editingClass}
          onFormDataChange={setFormData}
          onSubmit={handleSubmit}
          onCancel={resetForm}
        />
      )}

      {/* ======= CARDS GRID ======= */}
      <div
        ref={gridRef}
        className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3 sm:gap-4"
      >
        {filteredClasses.length === 0 ? (
          /* ── empty state ── */
          <div className="col-span-full flex flex-col items-center justify-center py-24 text-center">
            <div className="mb-5 flex h-20 w-20 items-center justify-center rounded-2xl bg-teal-100">
              <Sparkles className="w-9 h-9 text-teal-600" />
            </div>
            <p className="text-base sm:text-lg font-semibold text-stone-700">
              {searchTerm ? "Nenhuma turma encontrada" : "Nenhuma turma por aqui"}
            </p>
            <p className="mt-1 text-sm text-stone-400 max-w-xs">
              {searchTerm
                ? "Tente ajustar o termo de busca."
                : isProfOrAdmin
                  ? "Crie sua primeira turma para começar."
                  : "Você ainda não está matriculado em nenhuma turma."}
            </p>
          </div>
        ) : (
          filteredClasses.map((cls, i) => (
            <ClassCard
              key={cls.id}
              cls={cls}
              index={i}
              isProfOrAdmin={isProfOrAdmin}
              onEdit={handleEdit}
              onDelete={handleDelete}
            />
          ))
        )}
      </div>
    </div>
  );
}
