import { useState, useEffect } from "react";
import type { FormEvent } from "react";
import { useNavigate, useParams, useSearchParams } from "react-router";
import { resetPassword } from "@/services/ForgotPasswordService";
import Notification from "@/components/Notification";
import axios from "axios";
import { ArrowLeft, Terminal, Loader2, Eye, EyeOff, CheckCircle2 } from "lucide-react";

export default function ResetPassword() {
  const params = useParams();
  const token = params.token;
  const [searchParams] = useSearchParams();
  const email = searchParams.get("email");

  const [password, setPassword] = useState("");
  const [passwordConfirmation, setPasswordConfirmation] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();

  useEffect(() => {
    if (success) {
      const timerId = setTimeout(() => {
        navigate("/login");
      }, 3000);

      return () => {
        clearTimeout(timerId);
      };
    }
  }, [success, navigate]);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    if (!token || !email) {
      setError("Link de redefinição inválido.");
      return;
    }

    if (password !== passwordConfirmation) {
      setError("As senhas não conferem.");
      return;
    }

    if (password.length < 8) {
      setError("A senha deve ter pelo menos 8 caracteres.");
      return;
    }

    setLoading(true);

    try {
      await resetPassword({
        email,
        token,
        password,
        password_confirmation: passwordConfirmation,
      });
      setSuccess(
        "Senha redefinida com sucesso! Redirecionando para o login..."
      );
    } catch (error) {
      if (process.env.NODE_ENV === "development") {
        console.error("Erro ao redefinir senha:", error);
      }
      if (axios.isAxiosError(error)) {
        const data = error.response?.data;
        if (process.env.NODE_ENV === "development") {
          console.error("Status:", error.response?.status);
          console.error("Data:", data);
        }

        if (data?.message) {
          setError(data.message);
        } else if (data?.errors?.email) {
          setError(data.errors.email[0]);
        } else if (data?.errors?.password) {
          setError(data.errors.password[0]);
        } else if (data?.email) {
          setError(Array.isArray(data.email) ? data.email[0] : data.email);
        } else {
          setError(
            "Ocorreu um erro ao redefinir a senha. Tente novamente."
          );
        }
      } else {
        setError("Ocorreu um erro inesperado.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {error && (
        <Notification
          type="error"
          message={error}
          onClose={() => setError(null)}
        />
      )}
      {success && (
        <Notification
          type="success"
          message={success}
          onClose={() => setSuccess(null)}
        />
      )}

      <div className="w-full min-h-screen flex">
        {/* Left panel */}
        <div className="hidden lg:flex lg:w-[45%] bg-zinc-900 relative overflow-hidden flex-col justify-between p-12">
          <div
            className="absolute inset-0 opacity-[0.04]"
            style={{
              backgroundImage:
                "linear-gradient(rgba(255,255,255,.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,.1) 1px, transparent 1px)",
              backgroundSize: "40px 40px",
            }}
          />

          <div className="relative z-10">
            <div className="flex items-center gap-3 mb-8">
              <div className="w-10 h-10 rounded-lg bg-teal-600 flex items-center justify-center">
                <Terminal className="w-5 h-5 text-white" />
              </div>
              <span className="text-white text-2xl font-bold tracking-tight">
                IFCodes
              </span>
            </div>
          </div>

          <div className="relative z-10">
            <h2 className="text-white/90 text-3xl font-bold tracking-tight leading-tight max-w-sm">
              Crie sua
              <br />
              nova senha.
            </h2>
            <p className="text-zinc-400 text-sm mt-4 max-w-xs leading-relaxed">
              Escolha uma senha segura com pelo menos 8 caracteres para
              proteger sua conta.
            </p>
          </div>
        </div>

        {/* Right panel */}
        <div className="flex-1 flex items-center justify-center p-6 sm:p-10 bg-white">
          <div className="w-full max-w-sm">
            {/* Mobile logo */}
            <div className="flex items-center gap-2.5 mb-10 lg:hidden">
              <div className="w-8 h-8 rounded-md bg-zinc-900 flex items-center justify-center">
                <Terminal className="w-4 h-4 text-white" />
              </div>
              <span className="text-zinc-900 text-lg font-bold tracking-tight">
                IFCodes
              </span>
            </div>

            {/* Back link */}
            <button
              type="button"
              onClick={() => navigate("/login")}
              className="flex items-center gap-1.5 text-sm text-zinc-400 hover:text-zinc-700 transition-colors mb-8"
            >
              <ArrowLeft className="w-4 h-4" />
              Voltar para Login
            </button>

            {success ? (
              /* Success state */
              <div className="text-center py-6">
                <div className="w-12 h-12 rounded-xl bg-teal-50 flex items-center justify-center mx-auto mb-5">
                  <CheckCircle2 className="w-6 h-6 text-teal-600" />
                </div>
                <h1 className="text-xl font-bold text-zinc-900 tracking-tight">
                  Senha redefinida
                </h1>
                <p className="text-sm text-zinc-400 mt-2 leading-relaxed max-w-xs mx-auto">
                  Sua senha foi alterada com sucesso. Você será redirecionado
                  para o login em instantes.
                </p>
              </div>
            ) : (
              /* Form state */
              <>
                <div className="mb-8">
                  <h1 className="text-xl font-bold text-zinc-900 tracking-tight">
                    Redefinir senha
                  </h1>
                  <p className="text-sm text-zinc-400 mt-1.5">
                    Digite sua nova senha abaixo.
                  </p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-5">
                  <div>
                    <label
                      htmlFor="password"
                      className="block text-sm font-medium text-zinc-700 mb-1.5"
                    >
                      Nova senha
                    </label>
                    <div className="relative">
                      <input
                        type={showPassword ? "text" : "password"}
                        id="password"
                        placeholder="Mínimo 8 caracteres"
                        className="w-full px-3 py-2.5 text-sm bg-white border border-zinc-200 rounded-lg outline-none transition-all focus:border-teal-500 focus:ring-2 focus:ring-teal-100 pr-10"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                        minLength={8}
                      />
                      <button
                        type="button"
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-600 transition-colors"
                        onClick={() => setShowPassword(!showPassword)}
                        aria-label={showPassword ? "Ocultar senha" : "Mostrar senha"}
                      >
                        {showPassword ? (
                          <EyeOff className="w-4 h-4" />
                        ) : (
                          <Eye className="w-4 h-4" />
                        )}
                      </button>
                    </div>
                  </div>

                  <div>
                    <label
                      htmlFor="password_confirmation"
                      className="block text-sm font-medium text-zinc-700 mb-1.5"
                    >
                      Confirmar nova senha
                    </label>
                    <div className="relative">
                      <input
                        type={showConfirmPassword ? "text" : "password"}
                        id="password_confirmation"
                        placeholder="Repita a senha"
                        className="w-full px-3 py-2.5 text-sm bg-white border border-zinc-200 rounded-lg outline-none transition-all focus:border-teal-500 focus:ring-2 focus:ring-teal-100 pr-10"
                        value={passwordConfirmation}
                        onChange={(e) =>
                          setPasswordConfirmation(e.target.value)
                        }
                        required
                        minLength={8}
                      />
                      <button
                        type="button"
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-600 transition-colors"
                        onClick={() =>
                          setShowConfirmPassword(!showConfirmPassword)
                        }
                        aria-label={showConfirmPassword ? "Ocultar senha" : "Mostrar senha"}
                      >
                        {showConfirmPassword ? (
                          <EyeOff className="w-4 h-4" />
                        ) : (
                          <Eye className="w-4 h-4" />
                        )}
                      </button>
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full bg-teal-600 hover:bg-teal-700 disabled:opacity-60 disabled:cursor-not-allowed text-white text-sm font-medium py-2.5 rounded-lg transition-colors flex items-center justify-center gap-2"
                  >
                    {loading ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        Redefinindo...
                      </>
                    ) : (
                      "Redefinir senha"
                    )}
                  </button>
                </form>
              </>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
