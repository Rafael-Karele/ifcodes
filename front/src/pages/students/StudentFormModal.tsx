import type { Student } from "@/types";
import type { Curso } from "@/services/CoursesService";
import { useEffect, useState } from "react";
import {
  Users,
  X,
  Mail,
  UserCircle,
  BookOpen,
  IdCard,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export interface StudentFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (student: Omit<Student, "id"> | Student) => void;
  student: Student | null;
  mode: "create" | "edit";
  cursos: Curso[];
}

export function StudentFormModal({
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

  // Atualiza o formulario quando o aluno selecionado muda
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

  // Submete o formulario
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

    // Adiciona ID se for edicao
    if (mode === "edit" && student) {
      studentData.id = student.id;
    }

    onSave(studentData as Omit<Student, "id"> | Student);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-sm p-4">
      <div className="w-full max-w-lg max-h-[90vh] overflow-y-auto rounded-xl border border-stone-200 bg-white shadow-lg">
        {/* Header do modal */}
        <div className="flex items-center justify-between border-b border-stone-200 px-4 py-4 sm:px-6">
          <h2 className="text-xl font-bold text-stone-900 flex items-center gap-2">
            <Users className="w-5 h-5 text-teal-600" />
            {mode === "create" ? "Novo Aluno" : "Editar Aluno"}
          </h2>
          <button
            onClick={onClose}
            className="-mr-2 rounded-lg p-2 text-stone-400 hover:text-stone-600 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Formulario */}
        <form onSubmit={handleSubmit} className="space-y-4 px-4 py-4 sm:px-6 sm:py-5">
          {/* Nome */}
          <div>
            <Label className="mb-1 text-sm text-stone-600">Nome *</Label>
            <div className="relative">
              <UserCircle className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-400 w-5 h-5" />
              <Input
                type="text"
                value={formData.name}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
                className={`pl-10 ${
                  errors.name ? "border-red-500" : ""
                }`}
                placeholder="Nome completo do aluno"
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
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-400 w-5 h-5" />
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

          {/* Matricula */}
          <div>
            <Label className="mb-1 text-sm text-stone-600">Matrícula *</Label>
            <div className="relative">
              <IdCard className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-400 w-5 h-5" />
              <Input
                type="text"
                value={formData.matricula}
                onChange={(e) =>
                  setFormData({ ...formData, matricula: e.target.value })
                }
                disabled={mode === "edit"}
                className={`pl-10 ${
                  mode === "edit" ? "bg-stone-100 cursor-not-allowed" : ""
                } ${errors.matricula ? "border-red-500" : ""}`}
                placeholder="202501001"
              />
            </div>
            {errors.matricula && (
              <p className="mt-1 text-xs text-red-500">{errors.matricula}</p>
            )}
          </div>

          {/* Curso */}
          <div>
            <Label className="mb-1 text-sm text-stone-600">Curso *</Label>
            <div className="relative">
              <BookOpen className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-400 w-5 h-5" />
              <select
                value={formData.curso_id}
                onChange={(e) =>
                  setFormData({ ...formData, curso_id: e.target.value })
                }
                className={`flex h-9 w-full rounded-md border bg-transparent pl-10 pr-4 py-1 text-base shadow-xs transition-colors outline-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] md:text-sm ${
                  errors.curso_id ? "border-red-500" : "border-input"
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
              <p className="mt-1 text-xs text-red-500">{errors.curso_id}</p>
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
              className={errors.password_confirmation ? "border-red-500" : ""}
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
              className="flex-1 rounded-xl"
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
