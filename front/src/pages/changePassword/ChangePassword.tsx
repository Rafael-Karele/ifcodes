import { changePassword } from "@/services/ChangePasswordService";
import { useState } from "react";
import { useNavigate } from "react-router";
import axios from "axios";
import Notification from "@/components/Notification";
import { ArrowLeft, Eye, EyeOff, Loader2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";

export default function ChangePassword() {
    const [showCurrentPassword, setShowCurrentPassword] = useState(false);
    const [showNewPassword, setShowNewPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState<string | null>(null);
    const [submitting, setSubmitting] = useState(false);
    const [currentPassword, setCurrentPassword] = useState("");
    const [newPassword, setNewPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [currentPasswordError, setCurrentPasswordError] = useState<string | null>(null);
    const [newPasswordError, setNewPasswordError] = useState<string | null>(null);
    const [confirmPasswordError, setConfirmPasswordError] = useState<string | null>(null);
    const navigate = useNavigate();

    function validateCurrentPassword(password: string) {
        if (!password) return "A senha atual é obrigatória.";
        return null;
    }

    function validateNewPassword(password: string) {
        if (!password) return "A nova senha é obrigatória.";
        if (password.length < 8) return "A nova senha deve ter no mínimo 8 caracteres.";
        return null;
    }

    function validateConfirmPassword(password: string, newPass: string) {
        if (!password) return "A confirmação da senha é obrigatória.";
        if (password !== newPass) return "As senhas não conferem.";
        return null;
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        const currentErr = validateCurrentPassword(currentPassword);
        const newErr = validateNewPassword(newPassword);
        const confirmErr = validateConfirmPassword(confirmPassword, newPassword);

        setCurrentPasswordError(currentErr);
        setNewPasswordError(newErr);
        setConfirmPasswordError(confirmErr);

        if (currentErr || newErr || confirmErr) return;

        try {
            setSubmitting(true);
            await changePassword({
                currentPassword,
                newPassword,
                newPasswordConfirmation: confirmPassword
            });

            setSuccess("Senha alterada com sucesso! Você será redirecionado para fazer login novamente.");

            setTimeout(() => {
                localStorage.removeItem("auth_token");
                navigate("/login");
            }, 2000);
        } catch (error: unknown) {
            if (axios.isAxiosError(error)) {
                if (error.response?.status === 422) {
                    setError(error.response?.data?.message || "A senha atual está incorreta.");
                } else {
                    setError("Erro ao alterar senha. Tente novamente.");
                }
            } else {
                setError(`Um erro inesperado ocorreu: ${error instanceof Error ? error.message : String(error)}`);
            }
        } finally {
            setSubmitting(false);
        }

        setCurrentPassword("");
        setNewPassword("");
        setConfirmPassword("");
    }

    return (
        <div className="min-h-screen flex items-center justify-center px-4 bg-stone-50">
            {error && <Notification type="error" message={error} onClose={() => setError(null)} />}
            {success && <Notification type="success" message={success} onClose={() => setSuccess(null)} />}

            <div className="w-full max-w-md space-y-6">
                {/* Header */}
                <div>
                    <button
                        type="button"
                        onClick={() => navigate(-1)}
                        className="inline-flex items-center gap-1 text-sm font-medium text-teal-600 hover:text-teal-700 transition-colors mb-4"
                    >
                        <ArrowLeft className="w-4 h-4" />
                        Voltar
                    </button>

                    <h1 className="text-2xl font-bold text-stone-900 tracking-tight">Alterar Senha</h1>
                    <p className="text-stone-400 text-sm mt-1">Atualize sua senha para manter a conta segura</p>
                </div>

                {/* Form card */}
                <div className="rounded-xl border border-stone-200 bg-white p-4 sm:p-6">
                    <form onSubmit={handleSubmit} className="space-y-5">

                        {/* Senha Atual */}
                        <div>
                            <Label htmlFor="currentPassword" className="mb-1.5 text-stone-700">
                                Senha Atual
                            </Label>
                            <div className="relative">
                                <Input
                                    type={showCurrentPassword ? "text" : "password"}
                                    id="currentPassword"
                                    className={`pr-10 ${
                                        currentPasswordError ? "border-red-400 ring-2 ring-red-100" : ""
                                    }`}
                                    aria-invalid={currentPasswordError ? true : undefined}
                                    required
                                    value={currentPassword}
                                    onChange={e => setCurrentPassword(e.target.value)}
                                    onBlur={e => setCurrentPasswordError(validateCurrentPassword(e.target.value))}
                                />
                                <button
                                    type="button"
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-600 transition-colors"
                                    onClick={() => setShowCurrentPassword(v => !v)}
                                    title={showCurrentPassword ? "Ocultar senha" : "Mostrar senha"}
                                    tabIndex={-1}
                                >
                                    {showCurrentPassword ? (
                                        <EyeOff className="w-4 h-4" />
                                    ) : (
                                        <Eye className="w-4 h-4" />
                                    )}
                                </button>
                            </div>
                            {currentPasswordError && (
                                <p className="text-sm text-red-600 mt-1.5">{currentPasswordError}</p>
                            )}
                        </div>

                        {/* Nova Senha */}
                        <div>
                            <Label htmlFor="newPassword" className="mb-1.5 text-stone-700">
                                Nova Senha
                            </Label>
                            <div className="relative">
                                <Input
                                    type={showNewPassword ? "text" : "password"}
                                    id="newPassword"
                                    className={`pr-10 ${
                                        newPasswordError ? "border-red-400 ring-2 ring-red-100" : ""
                                    }`}
                                    aria-invalid={newPasswordError ? true : undefined}
                                    required
                                    value={newPassword}
                                    onChange={e => setNewPassword(e.target.value)}
                                    onBlur={e => setNewPasswordError(validateNewPassword(e.target.value))}
                                />
                                <button
                                    type="button"
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-600 transition-colors"
                                    onClick={() => setShowNewPassword(v => !v)}
                                    title={showNewPassword ? "Ocultar senha" : "Mostrar senha"}
                                    tabIndex={-1}
                                >
                                    {showNewPassword ? (
                                        <EyeOff className="w-4 h-4" />
                                    ) : (
                                        <Eye className="w-4 h-4" />
                                    )}
                                </button>
                            </div>
                            {newPasswordError && (
                                <p className="text-sm text-red-600 mt-1.5">{newPasswordError}</p>
                            )}
                        </div>

                        {/* Confirmar Nova Senha */}
                        <div>
                            <Label htmlFor="confirmPassword" className="mb-1.5 text-stone-700">
                                Confirmar Nova Senha
                            </Label>
                            <div className="relative">
                                <Input
                                    type={showConfirmPassword ? "text" : "password"}
                                    id="confirmPassword"
                                    className={`pr-10 ${
                                        confirmPasswordError ? "border-red-400 ring-2 ring-red-100" : ""
                                    }`}
                                    aria-invalid={confirmPasswordError ? true : undefined}
                                    required
                                    value={confirmPassword}
                                    onChange={e => setConfirmPassword(e.target.value)}
                                    onBlur={e => setConfirmPasswordError(validateConfirmPassword(e.target.value, newPassword))}
                                />
                                <button
                                    type="button"
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-600 transition-colors"
                                    onClick={() => setShowConfirmPassword(v => !v)}
                                    title={showConfirmPassword ? "Ocultar senha" : "Mostrar senha"}
                                    tabIndex={-1}
                                >
                                    {showConfirmPassword ? (
                                        <EyeOff className="w-4 h-4" />
                                    ) : (
                                        <Eye className="w-4 h-4" />
                                    )}
                                </button>
                            </div>
                            {confirmPasswordError && (
                                <p className="text-sm text-red-600 mt-1.5">{confirmPasswordError}</p>
                            )}
                        </div>

                        <Button
                            type="submit"
                            disabled={submitting}
                            className="w-full"
                            size="lg"
                        >
                            {submitting && <Loader2 className="w-4 h-4 animate-spin" />}
                            {submitting ? "Alterando..." : "Alterar Senha"}
                        </Button>
                    </form>
                </div>
            </div>
        </div>
    );
}
