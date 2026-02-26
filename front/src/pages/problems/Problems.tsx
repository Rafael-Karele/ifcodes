import { useState, useEffect } from "react";
import { Plus, Trash2, X, Search, Codesandbox, Sparkles } from "lucide-react";
import { RichTextEditor } from "@/components/RichTextEditor";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { getAllProblems, createProblem, updateProblem, deleteProblem, getProblemById } from "@/services/ProblemsServices";
import type { Problem } from "@/types";
import Notification from "@/components/Notification";
import { ProblemCard } from "@/components/ProblemCard";
import { useUser } from "@/context/UserContext";
import ProblemViewModal from "@/components/ProblemViewModal";

/* ── palette tokens (inline, no global leak) ────────────────── */
const palette = {
  accent: "#0d9488",
  accentLight: "#ccfbf1",
  accentSoft: "#f0fdfa",
  warm: "#f59e0b",
  warmLight: "#fef3c7",
  surface: "#fafaf9",
  cardBg: "#ffffff",
  textPrimary: "#1c1917",
  textSecondary: "#78716c",
  border: "#e7e5e4",
  dangerText: "#dc2626",
  dangerBg: "#fef2f2",
};

interface TestCase {
  entrada: string;
  saida: string;
  privado: boolean;
}

interface ProblemFormData {
  titulo: string;
  enunciado: string;
  tempo_limite: number;
  memoria_limite: number;
  casos_teste: TestCase[];
  created_by?: number;
}

// Modal simples para formulario
interface ProblemFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: ProblemFormData) => void;
  problem: Problem | null;
  mode: "create" | "edit";
}

function ProblemFormModal({ isOpen, onClose, onSave, problem, mode }: ProblemFormModalProps) {
  const [formData, setFormData] = useState<ProblemFormData>({
    titulo: "",
    enunciado: "",
    tempo_limite: 1,
    memoria_limite: 512,
    casos_teste: [{ entrada: "", saida: "", privado: false }]
  });

  const [errors, setErrors] = useState<{
    titulo?: string;
    enunciado?: string;
    tempo_limite?: string;
    memoria_limite?: string;
  }>({});

  const [notification, setNotification] = useState<{ type: 'success' | 'error', message: string } | null>(null);

  useEffect(() => {
    if (problem && mode === "edit") {
      setFormData({
        titulo: problem.title,
        enunciado: problem.statement,
        tempo_limite: problem.timeLimitMs,
        memoria_limite: problem.memoryLimitKb,
        casos_teste: problem.testCases?.map(tc => ({
          entrada: tc.input,
          saida: tc.expectedOutput,
          privado: tc.private
        })) || [{ entrada: "", saida: "", privado: false }]
      });
    } else {
      setFormData({
        titulo: "",
        enunciado: "",
        tempo_limite: 1000,
        memoria_limite: 512,
        casos_teste: [{ entrada: "", saida: "", privado: false }]
      });
    }
    // Resetar erros quando o modal abrir
    setErrors({});
    setNotification(null);
  }, [problem, mode, isOpen]);

  const validateForm = (): boolean => {
    const newErrors: typeof errors = {};

    // Validar titulo
    if (!formData.titulo.trim()) {
      newErrors.titulo = "O titulo e obrigatorio";
    } else if (formData.titulo.length < 3) {
      newErrors.titulo = "O titulo deve ter pelo menos 3 caracteres";
    } else if (formData.titulo.length > 200) {
      newErrors.titulo = "O titulo nao pode ter mais de 200 caracteres";
    }

    // Validar enunciado
    let plainText = '';
    try {
      if (formData.enunciado) {
        const parsed = JSON.parse(formData.enunciado);
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        plainText = parsed.blocks?.map((b: any) => b.text).join('').trim() || '';
      }
    } catch (_e) {
      plainText = formData.enunciado.trim();
    }

    if (!plainText) {
      newErrors.enunciado = "O enunciado e obrigatorio";
    } else if (plainText.length < 10) {
      newErrors.enunciado = "O enunciado deve ter pelo menos 10 caracteres";
    } else if (plainText.length > 10000) {
      newErrors.enunciado = "O enunciado nao pode ter mais de 10000 caracteres";
    }

    // Validar tempo limite
    if (!formData.tempo_limite || formData.tempo_limite < 100) {
      newErrors.tempo_limite = "O tempo limite deve ser no minimo 100ms";
    } else if (formData.tempo_limite > 30000) {
      newErrors.tempo_limite = "O tempo limite nao pode ser maior que 30000ms (30s)";
    }

    // Validar memoria limite
    if (!formData.memoria_limite || formData.memoria_limite < 128) {
      newErrors.memoria_limite = "A memoria limite deve ser no minimo 128KB";
    } else if (formData.memoria_limite > 1048576) {
      newErrors.memoria_limite = "A memoria limite nao pode ser maior que 1048576KB (1GB)";
    }

    // Validar casos de teste
    for (let i = 0; i < formData.casos_teste.length; i++) {
      const tc = formData.casos_teste[i];
      if (!tc.entrada.trim() || !tc.saida.trim()) {
        setNotification({
          type: 'error',
          message: `Caso de teste ${i + 1}: entrada e saida sao obrigatorias`
        });
        return false;
      }
    }

    setErrors(newErrors);

    if (Object.keys(newErrors).length > 0) {
      const firstError = Object.values(newErrors)[0];
      setNotification({ type: 'error', message: firstError });
      return false;
    }

    return true;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setErrors({});
    setNotification(null);
    onSave(formData);
  };

  const addTestCase = () => {
    setFormData(prev => ({
      ...prev,
      casos_teste: [...prev.casos_teste, { entrada: "", saida: "", privado: false }]
    }));
  };

  const removeTestCase = (index: number) => {
    setFormData(prev => ({
      ...prev,
      casos_teste: prev.casos_teste.filter((_, i) => i !== index)
    }));
  };

  const updateTestCase = (index: number, field: keyof TestCase, value: string | boolean) => {
    setFormData(prev => ({
      ...prev,
      casos_teste: prev.casos_teste.map((tc, i) =>
        i === index ? { ...tc, [field]: value } : tc
      )
    }));
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex items-center justify-between border-b border-stone-200 pb-4">
            <h2 className="text-xl font-bold text-stone-900">
              {mode === "edit" ? "Editar Problema" : "Novo Problema"}
            </h2>
            <button
              onClick={onClose}
              className="p-2 -mr-2 rounded-lg text-stone-400 hover:text-stone-600 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6 mt-6">
            <div>
              <Label htmlFor="titulo" className="text-sm font-medium text-stone-600">Titulo *</Label>
              <Input
                id="titulo"
                value={formData.titulo}
                onChange={(e) => {
                  setFormData(prev => ({ ...prev, titulo: e.target.value }));
                  if (errors.titulo) setErrors(prev => ({ ...prev, titulo: undefined }));
                }}
                className={`mt-1.5 h-11 rounded-lg border-stone-300 focus-visible:ring-teal-500/30 focus-visible:border-teal-400 ${errors.titulo ? "border-red-500" : ""}`}
                required
              />
              {errors.titulo && (
                <p className="text-sm text-red-600 mt-1">{errors.titulo}</p>
              )}
            </div>

            <div>
              <Label htmlFor="enunciado" className="text-sm font-medium text-stone-600">Enunciado *</Label>
              <RichTextEditor
                value={formData.enunciado}
                onChange={(content) => {
                  setFormData(prev => ({ ...prev, enunciado: content }));
                  if (errors.enunciado) setErrors(prev => ({ ...prev, enunciado: undefined }));
                }}
                className="mt-2"
                maxLength={10000}
                onError={(error) => {
                  if (error) {
                    setNotification({ type: 'error', message: error });
                  }
                }}
                error={errors.enunciado}
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="tempo_limite" className="text-sm font-medium text-stone-600">Tempo Limite (ms) *</Label>
                <Input
                  id="tempo_limite"
                  type="number"
                  min="100"
                  max="30000"
                  value={formData.tempo_limite}
                  onChange={(e) => {
                    setFormData(prev => ({ ...prev, tempo_limite: parseInt(e.target.value) || 0 }));
                    if (errors.tempo_limite) setErrors(prev => ({ ...prev, tempo_limite: undefined }));
                  }}
                  className={`mt-1.5 h-11 rounded-lg border-stone-300 focus-visible:ring-teal-500/30 focus-visible:border-teal-400 ${errors.tempo_limite ? "border-red-500" : ""}`}
                  required
                />
                {errors.tempo_limite && (
                  <p className="text-sm text-red-600 mt-1">{errors.tempo_limite}</p>
                )}
              </div>

              <div>
                <Label htmlFor="memoria_limite" className="text-sm font-medium text-stone-600">Memoria Limite (KB) *</Label>
                <Input
                  id="memoria_limite"
                  type="number"
                  min="128"
                  max="1048576"
                  value={formData.memoria_limite}
                  onChange={(e) => {
                    setFormData(prev => ({ ...prev, memoria_limite: parseInt(e.target.value) || 0 }));
                    if (errors.memoria_limite) setErrors(prev => ({ ...prev, memoria_limite: undefined }));
                  }}
                  className={`mt-1.5 h-11 rounded-lg border-stone-300 focus-visible:ring-teal-500/30 focus-visible:border-teal-400 ${errors.memoria_limite ? "border-red-500" : ""}`}
                  required
                />
                {errors.memoria_limite && (
                  <p className="text-sm text-red-600 mt-1">{errors.memoria_limite}</p>
                )}
              </div>
            </div>

            <div className="border-t border-stone-200 pt-6">
              <div className="flex justify-between items-center mb-4">
                <Label className="text-sm font-medium text-stone-600">Casos de Teste *</Label>
                <button
                  type="button"
                  onClick={addTestCase}
                  className="flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium rounded-lg transition-colors"
                  style={{ color: palette.accent, background: palette.accentSoft }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = palette.accent;
                    e.currentTarget.style.color = "#fff";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = palette.accentSoft;
                    e.currentTarget.style.color = palette.accent;
                  }}
                >
                  <Plus className="w-4 h-4" />
                  Adicionar Caso
                </button>
              </div>

              <div className="space-y-4">
                {formData.casos_teste.map((testCase, index) => (
                  <div key={index} className="border border-stone-200 rounded-xl p-4">
                    <div className="flex justify-between items-center mb-3">
                      <h4 className="font-medium text-stone-700">Caso de Teste {index + 1}</h4>
                      {formData.casos_teste.length > 1 && (
                        <button
                          type="button"
                          onClick={() => removeTestCase(index)}
                          className="rounded-lg p-1.5 text-stone-400 hover:text-red-600 hover:bg-red-50 transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                    <div className="space-y-3">
                      <div>
                        <Label className="text-sm font-medium text-stone-600">Entrada</Label>
                        <Textarea
                          value={testCase.entrada}
                          onChange={(e) => updateTestCase(index, 'entrada', e.target.value)}
                          rows={3}
                          className="mt-1.5 border-stone-300 rounded-lg focus-visible:ring-teal-500/30 focus-visible:border-teal-400"
                          required
                        />
                      </div>
                      <div>
                        <Label className="text-sm font-medium text-stone-600">Saida Esperada</Label>
                        <Textarea
                          value={testCase.saida}
                          onChange={(e) => updateTestCase(index, 'saida', e.target.value)}
                          rows={3}
                          className="mt-1.5 border-stone-300 rounded-lg focus-visible:ring-teal-500/30 focus-visible:border-teal-400"
                          required
                        />
                      </div>
                      <div className="flex items-center space-x-2">
                        <input
                          type="checkbox"
                          id={`privado-${index}`}
                          checked={testCase.privado}
                          onChange={(e) => updateTestCase(index, 'privado', e.target.checked)}
                          className="accent-teal-600"
                        />
                        <Label htmlFor={`privado-${index}`} className="text-sm font-medium text-stone-600">Caso de teste privado</Label>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex gap-3 pt-4">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 px-4 py-2.5 border border-stone-300 rounded-xl text-stone-700 hover:bg-stone-50 font-medium transition-colors"
              >
                Cancelar
              </button>
              <button
                type="submit"
                className="flex-1 px-4 py-2.5 text-white rounded-xl font-semibold transition-opacity hover:opacity-90"
                style={{ backgroundColor: palette.accent }}
              >
                {mode === "edit" ? "Atualizar" : "Criar"} Problema
              </button>
            </div>
          </form>

          {notification && (
            <Notification
              type={notification.type}
              message={notification.message}
              onClose={() => setNotification(null)}
            />
          )}
        </div>
      </div>
    </div>
  );
}



// Modal de confirmacao de exclusao
interface DeleteConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  problemTitle: string;
  activitiesCount?: number;
}

function DeleteConfirmModal({ isOpen, onClose, onConfirm, problemTitle, activitiesCount }: DeleteConfirmModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-xl max-w-md w-full p-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="p-2 rounded-lg" style={{ backgroundColor: palette.dangerBg }}>
            <Trash2 className="w-6 h-6" style={{ color: palette.dangerText }} />
          </div>
          <h3 className="text-xl font-bold text-stone-900">Confirmar Exclusao</h3>
        </div>
        <p className="text-stone-500 mb-6">
          Tem certeza que deseja excluir o problema{" "}
          <span className="font-semibold text-stone-900">"{problemTitle}"</span>?
          Esta acao nao pode ser desfeita.
        </p>

        {activitiesCount !== undefined && activitiesCount > 0 && (
          <div className="mb-6 p-4 rounded-xl border" style={{ backgroundColor: palette.warmLight, borderColor: "#fde68a" }}>
            <h4 className="text-sm font-semibold text-yellow-800 mb-1 flex items-center gap-2">
              <span>Atencao: Problema em uso</span>
            </h4>
            <p className="text-sm text-yellow-700">
              Este problema esta atribuido a <strong>{activitiesCount}</strong> atividade{activitiesCount > 1 ? 's' : ''}.
              Exclui-lo removera todas as atividades, submissoes e correcoes associadas.
            </p>
          </div>
        )}

        <div className="flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 px-4 py-2.5 border border-stone-300 rounded-xl text-stone-700 hover:bg-stone-50 font-medium transition-colors"
          >
            Cancelar
          </button>
          <button
            onClick={onConfirm}
            className="flex-1 px-4 py-2.5 rounded-xl text-white font-medium transition-colors"
            style={{ backgroundColor: palette.dangerText }}
            onMouseEnter={(e) => { e.currentTarget.style.opacity = "0.9"; }}
            onMouseLeave={(e) => { e.currentTarget.style.opacity = "1"; }}
          >
            Confirmar Exclusao
          </button>
        </div>
      </div>
    </div>
  );
}

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

  // Filtra problemas conforme o termo de busca
  const filteredProblems = problems.filter((problem) => {
    const searchLower = searchTerm.toLowerCase();
    return (
      problem.title.toLowerCase().includes(searchLower)
    );
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2" style={{ borderColor: palette.accent }}></div>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-6 sm:py-10 min-h-[80vh]">
      {/* ---- scoped keyframes ---- */}
      <style>{`
        @keyframes problems-fade-up {
          from { opacity: 0; transform: translateY(18px); }
          to   { opacity: 1; transform: translateY(0); }
        }
      `}</style>

      {notification && (
        <Notification
          type={notification.type}
          message={notification.message}
          onClose={() => setNotification(null)}
        />
      )}

      {/* ═══════ HERO / HEADER AREA ═══════ */}
      <div
        className="relative rounded-2xl px-5 sm:px-8 py-8 sm:py-10 mb-8 overflow-hidden"
        style={{ background: `linear-gradient(135deg, ${palette.accent} 0%, #065f46 100%)` }}
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
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white flex items-center gap-3">
              <Codesandbox className="w-6 h-6 sm:w-8 sm:h-8 opacity-90" strokeWidth={2.2} />
              Gerenciamento de Problemas
            </h1>
            <p className="mt-2 text-teal-100 text-sm max-w-md leading-relaxed">
              Crie e gerencie problemas de programacao, defina casos de teste e acompanhe as atividades.
            </p>
          </div>

          <Button
            onClick={() => {
              setEditingProblem(null);
              setIsFormModalOpen(true);
            }}
            className="w-full sm:w-auto shrink-0 bg-white text-teal-700 font-semibold shadow-lg hover:bg-teal-50 transition-colors rounded-xl px-5 h-11"
          >
            <Plus className="w-4 h-4 mr-1.5" />
            Adicionar Problema
          </Button>
        </div>
      </div>

      {/* ═══════ SEARCH + STATS BAR ═══════ */}
      <div className="flex flex-col sm:flex-row items-center gap-4 mb-6">
        <div className="relative flex-1 w-full">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400" />
          <Input
            type="text"
            placeholder="Buscar por titulo do problema..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 h-11 rounded-xl border-stone-200 bg-white shadow-sm focus-visible:ring-teal-500/30 focus-visible:border-teal-400"
          />
        </div>
        <div
          className="shrink-0 flex items-center gap-2 rounded-xl px-4 h-11 text-sm font-medium"
          style={{ background: palette.accentSoft, color: palette.accent }}
        >
          <Codesandbox className="w-4 h-4" />
          {filteredProblems.length}{" "}
          {filteredProblems.length === 1 ? "problema" : "problemas"}
        </div>
      </div>

      {/* ═══════ CARDS GRID ═══════ */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
        {filteredProblems.length === 0 ? (
          /* ── empty state ── */
          <div className="col-span-full flex flex-col items-center justify-center py-24 text-center">
            <div
              className="mb-5 flex h-20 w-20 items-center justify-center rounded-2xl"
              style={{ background: palette.accentLight }}
            >
              <Sparkles className="w-9 h-9" style={{ color: palette.accent }} />
            </div>
            <p className="text-lg font-semibold text-stone-700">
              {searchTerm ? "Nenhum problema encontrado" : "Nenhum problema cadastrado"}
            </p>
            <p className="mt-1 text-sm text-stone-400 max-w-xs">
              {searchTerm
                ? "Tente ajustar o termo de busca."
                : "Clique em 'Adicionar Problema' para comecar."}
            </p>
          </div>
        ) : (
          filteredProblems.map((problem, i) => (
            <ProblemCard
              key={problem.id}
              problem={problem}
              index={i}
              onView={handleView}
              onEdit={handleEdit}
              onDelete={handleDeleteClick}
            />
          ))
        )}
      </div>

      {/* Modais */}
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
