import { useState, useEffect } from "react";
import { Plus, Trash2, X } from "lucide-react";
import { RichTextEditor } from "@/components/RichTextEditor";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import type { Problem } from "@/types";
import Notification from "@/components/Notification";

export interface TestCase {
  entrada: string;
  saida: string;
  privado: boolean;
}

export interface ProblemFormData {
  titulo: string;
  enunciado: string;
  tempo_limite: number;
  memoria_limite: number;
  casos_teste: TestCase[];
  created_by?: number;
}

interface ProblemFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: ProblemFormData) => void;
  problem: Problem | null;
  mode: "create" | "edit";
}

export function ProblemFormModal({ isOpen, onClose, onSave, problem, mode }: ProblemFormModalProps) {
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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-sm p-4">
      <div className="w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-xl border border-stone-200 bg-white shadow-lg">
        <div className="px-4 py-5 sm:px-6">
          <div className="flex items-center justify-between border-b border-stone-200 pb-4">
            <h2 className="text-xl font-bold text-stone-800">
              {mode === "edit" ? "Editar Problema" : "Novo Problema"}
            </h2>
            <button
              onClick={onClose}
              className="rounded-lg p-2 -mr-2 text-stone-400 hover:text-stone-600 hover:bg-stone-100 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="mt-6 space-y-6">
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
                <p className="mt-1 text-sm text-red-600">{errors.titulo}</p>
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
                  <p className="mt-1 text-sm text-red-600">{errors.tempo_limite}</p>
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
                  <p className="mt-1 text-sm text-red-600">{errors.memoria_limite}</p>
                )}
              </div>
            </div>

            <div className="border-t border-stone-200 pt-6">
              <div className="mb-4 flex items-center justify-between">
                <Label className="text-sm font-medium text-stone-600">Casos de Teste *</Label>
                <button
                  type="button"
                  onClick={addTestCase}
                  className="flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm font-medium text-teal-600 bg-teal-50 hover:bg-teal-600 hover:text-white transition-colors"
                >
                  <Plus className="w-4 h-4" />
                  Adicionar Caso
                </button>
              </div>

              <div className="space-y-4">
                {formData.casos_teste.map((testCase, index) => (
                  <div key={index} className="rounded-xl border border-stone-200 bg-white px-3 py-3 sm:px-5 sm:py-5">
                    <div className="mb-3 flex items-center justify-between">
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
                          className="mt-1.5 rounded-lg border-stone-300 focus-visible:ring-teal-500/30 focus-visible:border-teal-400"
                          required
                        />
                      </div>
                      <div>
                        <Label className="text-sm font-medium text-stone-600">Saida Esperada</Label>
                        <Textarea
                          value={testCase.saida}
                          onChange={(e) => updateTestCase(index, 'saida', e.target.value)}
                          rows={3}
                          className="mt-1.5 rounded-lg border-stone-300 focus-visible:ring-teal-500/30 focus-visible:border-teal-400"
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
              <Button
                type="button"
                variant="outline"
                onClick={onClose}
                className="flex-1 rounded-xl border-stone-300 text-stone-700 hover:bg-stone-50 font-medium"
              >
                Cancelar
              </Button>
              <Button
                type="submit"
                className="flex-1 rounded-xl bg-teal-600 text-white font-semibold hover:bg-teal-700"
              >
                {mode === "edit" ? "Atualizar" : "Criar"} Problema
              </Button>
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
