import type { Professor } from "@/types";
import { useEffect, useState } from "react";
import {
  GraduationCap,
  X,
  Mail,
  UserCircle,
  Briefcase,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";

export interface TeacherFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (professor: Omit<Professor, "id"> | Professor) => void;
  professor: Professor | null;
  mode: "create" | "edit";
}

export function TeacherFormModal({
  isOpen,
  onClose,
  onSave,
  professor,
  mode,
}: TeacherFormModalProps) {
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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-sm p-4">
      <div className="w-full max-w-md max-h-[90vh] overflow-y-auto rounded-xl border border-stone-200 bg-white shadow-lg">
        {/* Header do modal */}
        <div className="flex items-center justify-between border-b border-stone-200 px-4 py-4 sm:px-6">
          <h2 className="flex items-center gap-2 text-xl font-bold text-stone-900">
            <GraduationCap className="h-5 w-5 text-teal-600" />
            {mode === "create" ? "Novo Professor" : "Editar Professor"}
          </h2>
          <button
            onClick={onClose}
            className="text-stone-400 hover:text-stone-600 transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Formulario */}
        <form onSubmit={handleSubmit} className="space-y-4 px-4 py-4 sm:px-6 sm:py-6">
          {/* Nome */}
          <div>
            <Label className="mb-1 text-sm text-stone-600">Nome *</Label>
            <div className="relative">
              <UserCircle className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-400 h-5 w-5" />
              <Input
                type="text"
                value={formData.name}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
                className={`pl-10 ${
                  errors.name ? "border-red-500" : ""
                }`}
                placeholder="Nome completo do professor"
              />
            </div>
            {errors.name && (
              <p className="mt-1 text-xs text-red-500">{errors.name}</p>
            )}
          </div>

          {/* E-mail */}
          <div>
            <Label className="mb-1 text-sm text-stone-600">E-mail *</Label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-400 h-5 w-5" />
              <Input
                type="email"
                value={formData.email}
                onChange={(e) =>
                  setFormData({ ...formData, email: e.target.value })
                }
                className={`pl-10 ${
                  errors.email ? "border-red-500" : ""
                }`}
                placeholder="email@exemplo.com"
              />
            </div>
            {errors.email && (
              <p className="mt-1 text-xs text-red-500">{errors.email}</p>
            )}
          </div>

          {/* Area de Atuacao */}
          <div>
            <Label className="mb-1 text-sm text-stone-600">
              Área de Atuação *
            </Label>
            <div className="relative">
              <Briefcase className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-400 h-5 w-5" />
              <Input
                type="text"
                value={formData.area_atuacao}
                onChange={(e) =>
                  setFormData({ ...formData, area_atuacao: e.target.value })
                }
                className={`pl-10 ${
                  errors.area_atuacao ? "border-red-500" : ""
                }`}
                placeholder="Ex: Matemática, Física, Programação"
              />
            </div>
            {errors.area_atuacao && (
              <p className="mt-1 text-xs text-red-500">
                {errors.area_atuacao}
              </p>
            )}
          </div>

          {/* Senha */}
          <div>
            <Label className="mb-1 text-sm text-stone-600">
              Senha {mode === "create" ? "*" : "(opcional)"}
            </Label>
            <Input
              type="password"
              value={formData.password}
              onChange={(e) =>
                setFormData({ ...formData, password: e.target.value })
              }
              className={errors.password ? "border-red-500" : ""}
              placeholder="Mínimo 8 caracteres"
            />
            {errors.password && (
              <p className="mt-1 text-xs text-red-500">{errors.password}</p>
            )}
          </div>

          {/* Confirmar Senha */}
          <div>
            <Label className="mb-1 text-sm text-stone-600">
              Confirmar Senha {mode === "create" ? "*" : "(opcional)"}
            </Label>
            <Input
              type="password"
              value={formData.password_confirmation}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  password_confirmation: e.target.value,
                })
              }
              className={
                errors.password_confirmation ? "border-red-500" : ""
              }
              placeholder="Repita a senha"
            />
            {errors.password_confirmation && (
              <p className="mt-1 text-xs text-red-500">
                {errors.password_confirmation}
              </p>
            )}
          </div>

          {/* Botoes */}
          <div className="flex gap-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              className="flex-1 rounded-xl border-stone-300 text-stone-700 hover:bg-stone-50"
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              className="flex-1 rounded-xl bg-teal-600 text-white hover:bg-teal-700"
            >
              {mode === "create" ? "Criar" : "Salvar"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
