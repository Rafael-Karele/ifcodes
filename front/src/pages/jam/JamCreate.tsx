import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router";
import { ArrowLeft, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { JamSessionService } from "@/services/JamSessionService";
import { getAllProblems } from "@/services/ProblemsServices";
import Notification from "@/components/Notification";
import type { Problem } from "@/types";

export default function JamCreate() {
  const { turmaId } = useParams<{ turmaId: string }>();
  const navigate = useNavigate();

  const [titulo, setTitulo] = useState("");
  const [problemaId, setProblemaId] = useState<number | null>(null);
  const [instrucoes, setInstrucoes] = useState("");
  const [tempoLimite, setTempoLimite] = useState<string>("");
  const [problems, setProblems] = useState<Problem[]>([]);
  const [loading, setLoading] = useState(false);
  const [notification, setNotification] = useState<{
    message: string;
    type: "success" | "error";
  } | null>(null);

  useEffect(() => {
    loadProblems();
  }, []);

  const loadProblems = async () => {
    try {
      const data = await getAllProblems();
      setProblems(data);
    } catch {
      setNotification({ message: "Erro ao carregar problemas", type: "error" });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!titulo || !problemaId || !turmaId) return;

    setLoading(true);
    try {
      const session = await JamSessionService.create({
        turma_id: Number(turmaId),
        problema_id: problemaId,
        titulo,
        instrucoes: instrucoes || undefined,
        tempo_limite: tempoLimite ? Number(tempoLimite) : undefined,
      });
      navigate(`/jam/${session.id}`);
    } catch {
      setNotification({ message: "Erro ao criar sessão Jam", type: "error" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-stone-50">
      {notification && (
        <Notification
          message={notification.message}
          type={notification.type}
          onClose={() => setNotification(null)}
        />
      )}

      {/* Hero Header */}
      <div
        className="relative overflow-hidden px-4 sm:px-6 py-8 sm:py-12"
        style={{ background: "linear-gradient(135deg, #0d9488 0%, #0f766e 100%)" }}
      >
        <div className="mx-auto max-w-7xl">
          <button
            onClick={() => navigate(`/classes/${turmaId}`)}
            className="mb-6 flex items-center gap-2 text-sm font-medium text-white/80 transition-colors hover:text-white"
          >
            <ArrowLeft className="h-4 w-4" />
            Voltar para a turma
          </button>
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-white/20">
              <Zap className="h-6 w-6 text-white" />
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold text-white">Nova Jam Session</h1>
          </div>
        </div>
      </div>

      {/* Form */}
      <div className="mx-auto max-w-7xl px-4 sm:px-6 py-6 sm:py-10 space-y-8">
        <div className="rounded-2xl border border-stone-200 bg-white shadow-sm p-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <Label htmlFor="titulo">Título da Sessão</Label>
              <Input
                id="titulo"
                value={titulo}
                onChange={(e) => setTitulo(e.target.value)}
                placeholder="Ex: Prática de ponteiros"
                required
                className="border-stone-200 focus:border-teal-500 focus:ring-teal-500"
              />
            </div>

            <div>
              <Label htmlFor="problema">Problema</Label>
              <select
                id="problema"
                value={problemaId ?? ""}
                onChange={(e) => setProblemaId(Number(e.target.value))}
                className="w-full rounded-lg border border-stone-200 px-3 py-2 text-sm focus:border-teal-500 focus:outline-none focus:ring-1 focus:ring-teal-500"
                required
              >
                <option value="">Selecione um problema...</option>
                {problems.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.title}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <Label htmlFor="instrucoes">Instruções (opcional)</Label>
              <textarea
                id="instrucoes"
                value={instrucoes}
                onChange={(e) => setInstrucoes(e.target.value)}
                placeholder="Instruções adicionais para os alunos..."
                className="h-24 w-full resize-none rounded-lg border border-stone-200 p-3 text-sm focus:border-teal-500 focus:outline-none focus:ring-1 focus:ring-teal-500"
              />
            </div>

            <div>
              <Label htmlFor="tempo">Tempo Limite (minutos, opcional)</Label>
              <Input
                id="tempo"
                type="number"
                value={tempoLimite}
                onChange={(e) => setTempoLimite(e.target.value)}
                placeholder="Ex: 30"
                min="1"
                className="border-stone-200 focus:border-teal-500 focus:ring-teal-500"
              />
            </div>

            <div className="flex gap-3">
              <Button
                type="button"
                variant="outline"
                onClick={() => navigate(`/classes/${turmaId}`)}
              >
                Cancelar
              </Button>
              <Button
                type="submit"
                disabled={loading || !titulo || !problemaId}
                style={{ backgroundColor: "#0d9488" }}
                className="hover:opacity-90"
              >
                {loading ? "Criando..." : "Criar Sessão"}
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
