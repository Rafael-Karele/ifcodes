import { useState } from "react";
import { useNavigate } from "react-router";
import axios from "axios";
import Notification from "@/components/Notification";
import { sendForgotPasswordEmail } from "@/services/ForgotPasswordService";
import { ArrowLeft, Terminal, Loader2, Mail } from "lucide-react";

export default function ForgotPassword() {
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [email, setEmail] = useState("");
  const [emailError, setEmailError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const navigate = useNavigate();

  function validateEmail(email: string) {
    if (!email) return "O email é obrigatório.";
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))
      return "Digite um email válido.";
    return null;
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const emailErr = validateEmail(email);
    setEmailError(emailErr);

    if (emailErr) return;

    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      await sendForgotPasswordEmail(email);
      setSuccess(
        "Se o e-mail estiver cadastrado, você receberá um link para redefinir sua senha."
      );
      setSent(true);
      setEmail("");
    } catch (error) {
      if (axios.isAxiosError(error) && error.response?.status === 422) {
        setError("Erro de validação. Verifique o e-mail.");
      } else {
        const errorMessage =
          error instanceof Error ? error.message : "Erro desconhecido";
        setError(`Um erro inesperado ocorreu: ${errorMessage}`);
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
              Recupere seu
              <br />
              acesso.
            </h2>
            <p className="text-zinc-400 text-sm mt-4 max-w-xs leading-relaxed">
              Enviaremos um link para o seu e-mail com instruções para redefinir
              sua senha.
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

            {sent ? (
              /* Success state */
              <div className="text-center py-6">
                <div className="w-12 h-12 rounded-xl bg-teal-50 flex items-center justify-center mx-auto mb-5">
                  <Mail className="w-6 h-6 text-teal-600" />
                </div>
                <h1 className="text-xl font-bold text-zinc-900 tracking-tight">
                  E-mail enviado
                </h1>
                <p className="text-sm text-zinc-400 mt-2 leading-relaxed max-w-xs mx-auto">
                  Se o e-mail estiver cadastrado, você receberá um link para
                  redefinir sua senha. Verifique também a caixa de spam.
                </p>
                <button
                  type="button"
                  onClick={() => {
                    setSent(false);
                    setSuccess(null);
                  }}
                  className="text-sm text-teal-600 hover:text-teal-700 font-medium mt-6 transition-colors"
                >
                  Enviar novamente
                </button>
              </div>
            ) : (
              /* Form state */
              <>
                <div className="mb-8">
                  <h1 className="text-xl font-bold text-zinc-900 tracking-tight">
                    Recuperar senha
                  </h1>
                  <p className="text-sm text-zinc-400 mt-1.5">
                    Digite seu e-mail e enviaremos um link para redefinir sua
                    senha.
                  </p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-5">
                  <div>
                    <label
                      htmlFor="email"
                      className="block text-sm font-medium text-zinc-700 mb-1.5"
                    >
                      Email
                    </label>
                    <input
                      type="email"
                      id="email"
                      placeholder="seu@email.com"
                      className={`w-full px-3 py-2.5 text-sm bg-white border rounded-lg outline-none transition-all ${
                        emailError
                          ? "border-red-400 ring-2 ring-red-100"
                          : "border-zinc-200 focus:border-teal-500 focus:ring-2 focus:ring-teal-100"
                      }`}
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      onBlur={(e) =>
                        setEmailError(validateEmail(e.target.value))
                      }
                    />
                    {emailError && (
                      <p className="text-red-600 text-xs mt-1.5">
                        {emailError}
                      </p>
                    )}
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full bg-teal-600 hover:bg-teal-700 disabled:opacity-60 disabled:cursor-not-allowed text-white text-sm font-medium py-2.5 rounded-lg transition-colors flex items-center justify-center gap-2"
                  >
                    {loading ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        Enviando...
                      </>
                    ) : (
                      "Enviar link de recuperação"
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
