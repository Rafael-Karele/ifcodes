import { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router";
import type { Class, CreateClassDTO } from "@/types/classes";
import ClassesService from "@/services/ClassesService";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import Loading from "@/components/Loading";
import Notification from "@/components/Notification";
import {
  Plus,
  Edit,
  Trash2,
  Users,
  Search,
  ArrowRight,
  UserPlus,
  BookOpen,
  X,
  ChevronRight,
  Sparkles,
} from "lucide-react";
import { useUserRole } from "@/hooks/useUserRole";
import { useUser } from "@/context/UserContext";

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

/* ── colour helpers for card accent strips ───────────────── */
const stripColours = [
  "from-teal-500 to-emerald-400",
  "from-amber-400 to-orange-400",
  "from-sky-400 to-cyan-400",
  "from-rose-400 to-pink-400",
  "from-violet-400 to-purple-400",
  "from-lime-400 to-green-400",
];
function stripFor(index: number) {
  return stripColours[index % stripColours.length];
}

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
  }, [user]);

  useEffect(() => {
    filterClasses();
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
    <div className="min-h-[80vh]">
      {/* ---- scoped keyframes ---- */}
      <style>{`
        @keyframes classes-fade-up {
          from { opacity: 0; transform: translateY(18px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes classes-slide-down {
          from { opacity: 0; max-height: 0; padding-top: 0; padding-bottom: 0; }
          to   { opacity: 1; max-height: 320px; }
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

      {/* ═══════ HERO / HEADER AREA ═══════ */}
      <div
        className="relative rounded-2xl px-8 py-10 mb-8 overflow-hidden"
        style={{ background: `linear-gradient(135deg, ${palette.accent} 0%, #065f56 100%)` }}
      >
        {/* decorative circles */}
        <div
          className="pointer-events-none absolute -top-12 -right-12 h-56 w-56 rounded-full opacity-10"
          style={{ background: "white" }}
        />
        <div
          className="pointer-events-none absolute bottom-0 left-1/3 h-32 w-32 rounded-full opacity-[0.07]"
          style={{ background: "white" }}
        />

        <div className="relative z-10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
          <div>
            <h1 className="text-3xl font-extrabold tracking-tight text-white flex items-center gap-3">
              <BookOpen className="w-8 h-8 opacity-90" strokeWidth={2.2} />
              Minhas Turmas
            </h1>
            <p className="mt-2 text-teal-100 text-sm max-w-md leading-relaxed">
              {isProfOrAdmin
                ? "Gerencie suas turmas, adicione alunos e acompanhe o progresso de cada grupo."
                : "Veja as turmas em que você está matriculado e acesse as atividades."}
            </p>
          </div>

          {isProfOrAdmin && (
            <Button
              onClick={() => setShowForm(!showForm)}
              className="shrink-0 bg-white text-teal-700 font-semibold shadow-lg hover:bg-teal-50 transition-colors rounded-xl px-5 h-11"
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
          <div className="cls-form-enter relative z-10 mt-8 rounded-xl bg-white/95 backdrop-blur p-6 shadow-xl">
            <h2 className="text-lg font-bold text-stone-800 mb-4">
              {editingClass ? "Editar Turma" : "Criar Nova Turma"}
            </h2>
            <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row items-end gap-4">
              <div className="flex-1 w-full">
                <Label htmlFor="nome" className="mb-1.5 block text-sm font-medium text-stone-600">
                  Nome da turma
                </Label>
                <Input
                  id="nome"
                  value={formData.nome}
                  onChange={(e) => setFormData({ ...formData, nome: e.target.value })}
                  required
                  placeholder="Ex: Programação I — 2025/1"
                  className="h-11 rounded-lg"
                />
              </div>
              <div className="flex gap-2 shrink-0">
                <Button
                  type="submit"
                  className="h-11 rounded-xl px-6 font-semibold"
                  style={{ background: palette.accent }}
                >
                  {editingClass ? "Atualizar" : "Salvar"}
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  onClick={resetForm}
                  className="h-11 rounded-xl text-stone-500 hover:text-red-600 hover:bg-red-50"
                >
                  Cancelar
                </Button>
              </div>
            </form>
          </div>
        )}
      </div>

      {/* ═══════ SEARCH + STATS BAR ═══════ */}
      <div className="flex flex-col sm:flex-row items-center gap-4 mb-6">
        <div className="relative flex-1 w-full">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400" />
          <Input
            type="text"
            placeholder="Buscar turma por nome…"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 h-11 rounded-xl border-stone-200 bg-white shadow-sm focus-visible:ring-teal-500/30 focus-visible:border-teal-400"
          />
        </div>
        <div
          className="shrink-0 flex items-center gap-2 rounded-xl px-4 h-11 text-sm font-medium"
          style={{ background: palette.accentSoft, color: palette.accent }}
        >
          <BookOpen className="w-4 h-4" />
          {filteredClasses.length}{" "}
          {filteredClasses.length === 1 ? "turma" : "turmas"}
        </div>
      </div>

      {/* ═══════ CARDS GRID ═══════ */}
      <div
        ref={gridRef}
        className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5"
      >
        {filteredClasses.length === 0 ? (
          /* ── empty state ── */
          <div className="col-span-full flex flex-col items-center justify-center py-24 text-center">
            <div
              className="mb-5 flex h-20 w-20 items-center justify-center rounded-2xl"
              style={{ background: palette.accentLight }}
            >
              <Sparkles className="w-9 h-9" style={{ color: palette.accent }} />
            </div>
            <p className="text-lg font-semibold text-stone-700">
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
            <div
              key={cls.id}
              className="cls-card group relative flex flex-col rounded-2xl border bg-white shadow-sm hover:shadow-md transition-shadow duration-300"
              style={{
                animationDelay: `${i * 60}ms`,
                borderColor: palette.border,
              }}
            >
              {/* colour accent strip */}
              <div
                className={`h-1.5 rounded-t-2xl bg-gradient-to-r ${stripFor(i)}`}
              />

              <div className="flex flex-col flex-1 p-5 pt-4">
                {/* header row */}
                <div className="flex items-start justify-between gap-3 mb-3">
                  <h3 className="text-[1.05rem] font-bold leading-snug text-stone-800 line-clamp-2">
                    {cls.nome}
                  </h3>

                  {isProfOrAdmin && (
                    <div className="flex gap-1 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button
                        onClick={() => handleEdit(cls)}
                        className="rounded-lg p-1.5 text-stone-400 hover:text-teal-600 hover:bg-teal-50 transition-colors"
                        title="Editar"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(cls.id)}
                        className="rounded-lg p-1.5 text-stone-400 hover:text-red-600 hover:bg-red-50 transition-colors"
                        title="Excluir"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  )}
                </div>

                {/* meta */}
                <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-stone-500 mb-5">
                  {cls.teacherName && (
                    <span className="flex items-center gap-1.5">
                      <span
                        className="inline-flex h-5 w-5 items-center justify-center rounded-full text-[10px] font-bold text-white"
                        style={{ background: palette.accent }}
                      >
                        {cls.teacherName.charAt(0).toUpperCase()}
                      </span>
                      {cls.teacherName}
                    </span>
                  )}
                  <span className="flex items-center gap-1.5">
                    <Users className="w-3.5 h-3.5" />
                    {cls.studentsCount || 0} aluno{(cls.studentsCount ?? 0) !== 1 && "s"}
                  </span>
                </div>

                {/* spacer */}
                <div className="flex-1" />

                {/* actions */}
                <div className="flex gap-2">
                  <button
                    onClick={() => navigate(`/classes/${cls.id}`)}
                    className="flex-1 flex items-center justify-center gap-2 rounded-xl h-10 text-sm font-semibold transition-colors"
                    style={{
                      color: palette.accent,
                      background: palette.accentSoft,
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.background = palette.accent;
                      e.currentTarget.style.color = "#fff";
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.background = palette.accentSoft;
                      e.currentTarget.style.color = palette.accent;
                    }}
                  >
                    Ver Detalhes
                    <ChevronRight className="w-4 h-4" />
                  </button>

                  {isProfOrAdmin && (
                    <button
                      onClick={() => navigate(`/classes/${cls.id}?tab=students`)}
                      className="flex items-center justify-center gap-2 rounded-xl h-10 px-4 text-sm font-semibold border transition-colors"
                      style={{
                        borderColor: palette.border,
                        color: palette.textSecondary,
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.borderColor = palette.accent;
                        e.currentTarget.style.color = palette.accent;
                        e.currentTarget.style.background = palette.accentSoft;
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.borderColor = palette.border;
                        e.currentTarget.style.color = palette.textSecondary;
                        e.currentTarget.style.background = "transparent";
                      }}
                    >
                      <UserPlus className="w-4 h-4" />
                      <span className="hidden lg:inline">Alunos</span>
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
