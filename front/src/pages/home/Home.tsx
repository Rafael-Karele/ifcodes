import { useNavigate } from "react-router";
import {
  ArrowRight,
  BookOpen,
  CheckCircle2,
  Clock,
  AlertTriangle,
  Send,
  Terminal,
  Loader2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useData } from "@/context/DataContext";
import { useUser } from "@/context/UserContext";
import { StatCard } from "@/components/StatCard";
import { ActivityCard } from "@/components/ActivityCard";

/* ── helpers ─────────────────────────────────────────── */

function getGreeting(): string {
  const h = new Date().getHours();
  if (h < 12) return "Bom dia";
  if (h < 18) return "Boa tarde";
  return "Boa noite";
}

/* ── loading ─────────────────────────────────────────── */

function LoadingDashboard() {
  return (
    <div className="max-w-5xl mx-auto px-6 py-16">
      <div className="bg-zinc-50 border border-zinc-200 rounded-xl p-12 flex flex-col items-center gap-4">
        <Loader2 className="w-6 h-6 animate-spin text-teal-600" />
        <p className="text-sm text-zinc-500 font-medium">Carregando seu painel...</p>
      </div>
    </div>
  );
}

/* ── main component ──────────────────────────────────── */

export default function Home() {
  const navigate = useNavigate();
  const { user } = useUser();
  const { activities, submissions, loading, mapProblems } = useData();

  if (loading) {
    return <LoadingDashboard />;
  }

  const now = new Date();
  const pendingActivities = activities.filter(
    (a) => a.status !== "completed" && new Date(a.dueDate) >= now
  );
  const overdueActivities = activities.filter(
    (a) => a.status !== "completed" && new Date(a.dueDate) < now
  );
  const completedActivities = activities.filter(
    (a) => a.status === "completed"
  );

  const upcomingActivities = [...activities]
    .filter((a) => a.status !== "completed")
    .sort((a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime())
    .slice(0, 6);

  const recentCompleted = [...activities]
    .filter((a) => a.status === "completed")
    .slice(0, 3);

  const currentDate = new Date().toLocaleDateString("pt-BR", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  const userName = user?.name?.split(" ")[0] || "Estudante";

  return (
    <div className="max-w-5xl mx-auto px-6 py-10 space-y-8">

      {/* ── header ── */}
      <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
        <div>
          <p className="text-sm text-zinc-400 font-medium capitalize">{currentDate}</p>
          <h1 className="text-2xl font-bold text-zinc-900 tracking-tight mt-1">
            {getGreeting()}, {userName}
          </h1>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => navigate("/activities")}
          >
            <BookOpen className="w-4 h-4" />
            Atividades
          </Button>
          <Button
            size="sm"
            className="bg-teal-600 hover:bg-teal-700 text-white shadow-none"
            onClick={() => navigate("/submissions")}
          >
            <Send className="w-4 h-4" />
            Submissões
          </Button>
        </div>
      </div>

      {/* ── stats ── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <StatCard label="Pendentes" value={pendingActivities.length} icon={Clock} />
        <StatCard
          label="Atrasadas"
          value={overdueActivities.length}
          icon={AlertTriangle}
          accent={overdueActivities.length > 0}
        />
        <StatCard label="Concluídas" value={completedActivities.length} icon={CheckCircle2} />
        <StatCard label="Submissões" value={submissions.length} icon={Terminal} />
      </div>

      {/* ── upcoming activities ── */}
      <section>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-sm font-semibold text-zinc-700">Próximas atividades</h2>
          <button
            onClick={() => navigate("/activities")}
            className="text-xs font-medium text-teal-600 hover:text-teal-700 transition-colors flex items-center gap-1"
          >
            Ver todas
            <ArrowRight className="w-3 h-3" />
          </button>
        </div>

        {upcomingActivities.length === 0 ? (
          <div className="bg-zinc-50 border border-zinc-200 border-dashed rounded-xl py-10 text-center">
            <CheckCircle2 className="w-8 h-8 text-emerald-400 mx-auto mb-3" />
            <p className="text-sm font-medium text-zinc-600">Tudo em dia</p>
            <p className="text-xs text-zinc-400 mt-1">Nenhuma atividade pendente no momento.</p>
          </div>
        ) : (
          <div className="grid gap-2">
            {upcomingActivities.map((activity, i) => (
              <ActivityCard
                key={activity.id}
                activity={activity}
                problemTitle={
                  mapProblems.get(activity.problemId)?.title || `Atividade #${activity.id}`
                }
                onClick={() => navigate(`/activities/${activity.id}`)}
                index={i}
              />
            ))}
          </div>
        )}
      </section>

      {/* ── recently completed ── */}
      {recentCompleted.length > 0 && (
        <section>
          <h2 className="text-sm font-semibold text-zinc-700 mb-4">Concluídas recentemente</h2>
          <div className="grid gap-2">
            {recentCompleted.map((activity, i) => (
              <ActivityCard
                key={activity.id}
                activity={activity}
                problemTitle={
                  mapProblems.get(activity.problemId)?.title || `Atividade #${activity.id}`
                }
                onClick={() => navigate(`/activities/${activity.id}`)}
                index={i}
              />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
