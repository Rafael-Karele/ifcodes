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
    <div className="mx-auto max-w-2xl p-6">
      {notification && (
        <Notification
          message={notification.message}
          type={notification.type}
          onClose={() => setNotification(null)}
        />
      )}

      <div className="mb-6 flex items-center gap-3">
        <button
          onClick={() => navigate(`/classes/${turmaId}`)}
          className="rounded-lg p-2 hover:bg-gray-100"
        >
          <ArrowLeft className="h-5 w-5" />
        </button>
        <div className="flex items-center gap-2">
          <Zap className="h-6 w-6 text-yellow-500" />
          <h1 className="text-2xl font-bold text-gray-800">Nova Jam Session</h1>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <Label htmlFor="titulo">Título da Sessão</Label>
          <Input
            id="titulo"
            value={titulo}
            onChange={(e) => setTitulo(e.target.value)}
            placeholder="Ex: Prática de ponteiros"
            required
          />
        </div>

        <div>
          <Label htmlFor="problema">Problema</Label>
          <select
            id="problema"
            value={problemaId ?? ""}
            onChange={(e) => setProblemaId(Number(e.target.value))}
            className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
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
            className="h-24 w-full resize-none rounded-lg border border-gray-200 p-3 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
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
          <Button type="submit" disabled={loading || !titulo || !problemaId}>
            {loading ? "Criando..." : "Criar Sessão"}
          </Button>
        </div>
      </form>
    </div>
  );
}
