import { changePassword } from "@/services/ChangePasswordService";
import { useState } from "react";
import showIcon from "@/assets/icons/password-show.svg";
import hideIcon from "@/assets/icons/password-hide.svg";
import { useNavigate } from "react-router";
import axios from "axios";
import Notification from "@/components/Notification";
import { ArrowLeft, KeyRound, Loader2 } from "lucide-react";
import { SectionCard } from "@/components/SectionCard";

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
        <div className="max-w-lg mx-auto px-6 py-10 space-y-8">
            {error && <Notification type="error" message={error} onClose={() => setError(null)} />}
            {success && <Notification type="success" message={success} onClose={() => setSuccess(null)} />}

            {/* ── header ── */}
            <div>
                <button
                    type="button"
                    onClick={() => navigate(-1)}
                    className="inline-flex items-center gap-1 text-sm font-medium text-teal-600 hover:text-teal-700 transition-colors mb-4"
                >
                    <ArrowLeft className="w-4 h-4" />
                    Voltar
                </button>

                <h1 className="text-2xl font-bold text-zinc-900 tracking-tight">Alterar Senha</h1>
                <p className="text-zinc-400 text-sm mt-1">Atualize sua senha para manter a conta segura</p>
            </div>

            {/* ── form ── */}
            <SectionCard title="Nova senha" icon={KeyRound}>
                <form onSubmit={handleSubmit} className="p-6 space-y-5">

                    {/* Senha Atual */}
                    <div>
                        <label htmlFor="currentPassword" className="block text-sm font-medium text-zinc-700 mb-1.5">
                            Senha Atual
                        </label>
                        <div className="relative">
                            <input
                                type={showCurrentPassword ? "text" : "password"}
                                id="currentPassword"
                                className={`block w-full border rounded-lg px-3 py-2 pr-10 text-sm transition-all focus:ring-2 focus:ring-teal-500 focus:border-transparent ${
                                    currentPasswordError ? "border-red-300 bg-red-50/50" : "border-zinc-200 bg-white"
                                }`}
                                required
                                value={currentPassword}
                                onChange={e => setCurrentPassword(e.target.value)}
                                onBlur={e => setCurrentPasswordError(validateCurrentPassword(e.target.value))}
                            />
                            <button
                                type="button"
                                className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-600 transition-colors"
                                onClick={() => setShowCurrentPassword(v => !v)}
                                title={showCurrentPassword ? "Ocultar senha" : "Mostrar senha"}
                            >
                                <img
                                    src={showCurrentPassword ? hideIcon : showIcon}
                                    alt={showCurrentPassword ? "Ocultar senha" : "Mostrar senha"}
                                    width={18}
                                    height={18}
                                />
                            </button>
                        </div>
                        {currentPasswordError && (
                            <p className="text-red-600 text-xs mt-1.5">{currentPasswordError}</p>
                        )}
                    </div>

                    {/* Nova Senha */}
                    <div>
                        <label htmlFor="newPassword" className="block text-sm font-medium text-zinc-700 mb-1.5">
                            Nova Senha
                        </label>
                        <div className="relative">
                            <input
                                type={showNewPassword ? "text" : "password"}
                                id="newPassword"
                                className={`block w-full border rounded-lg px-3 py-2 pr-10 text-sm transition-all focus:ring-2 focus:ring-teal-500 focus:border-transparent ${
                                    newPasswordError ? "border-red-300 bg-red-50/50" : "border-zinc-200 bg-white"
                                }`}
                                required
                                value={newPassword}
                                onChange={e => setNewPassword(e.target.value)}
                                onBlur={e => setNewPasswordError(validateNewPassword(e.target.value))}
                            />
                            <button
                                type="button"
                                className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-600 transition-colors"
                                onClick={() => setShowNewPassword(v => !v)}
                                title={showNewPassword ? "Ocultar senha" : "Mostrar senha"}
                            >
                                <img
                                    src={showNewPassword ? hideIcon : showIcon}
                                    alt={showNewPassword ? "Ocultar senha" : "Mostrar senha"}
                                    width={18}
                                    height={18}
                                />
                            </button>
                        </div>
                        {newPasswordError && (
                            <p className="text-red-600 text-xs mt-1.5">{newPasswordError}</p>
                        )}
                    </div>

                    {/* Confirmar Nova Senha */}
                    <div>
                        <label htmlFor="confirmPassword" className="block text-sm font-medium text-zinc-700 mb-1.5">
                            Confirmar Nova Senha
                        </label>
                        <div className="relative">
                            <input
                                type={showConfirmPassword ? "text" : "password"}
                                id="confirmPassword"
                                className={`block w-full border rounded-lg px-3 py-2 pr-10 text-sm transition-all focus:ring-2 focus:ring-teal-500 focus:border-transparent ${
                                    confirmPasswordError ? "border-red-300 bg-red-50/50" : "border-zinc-200 bg-white"
                                }`}
                                required
                                value={confirmPassword}
                                onChange={e => setConfirmPassword(e.target.value)}
                                onBlur={e => setConfirmPasswordError(validateConfirmPassword(e.target.value, newPassword))}
                            />
                            <button
                                type="button"
                                className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-600 transition-colors"
                                onClick={() => setShowConfirmPassword(v => !v)}
                                title={showConfirmPassword ? "Ocultar senha" : "Mostrar senha"}
                            >
                                <img
                                    src={showConfirmPassword ? hideIcon : showIcon}
                                    alt={showConfirmPassword ? "Ocultar senha" : "Mostrar senha"}
                                    width={18}
                                    height={18}
                                />
                            </button>
                        </div>
                        {confirmPasswordError && (
                            <p className="text-red-600 text-xs mt-1.5">{confirmPasswordError}</p>
                        )}
                    </div>

                    <button
                        type="submit"
                        disabled={submitting}
                        className="w-full flex items-center justify-center gap-2 bg-teal-600 hover:bg-teal-700 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg text-white text-sm font-medium py-2.5 transition-colors"
                    >
                        {submitting && <Loader2 className="w-4 h-4 animate-spin" />}
                        {submitting ? "Alterando..." : "Alterar Senha"}
                    </button>
                </form>
            </SectionCard>
        </div>
    );
}
