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
  Sparkles,
  LayoutDashboard,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useData } from "@/context/DataContext";
import { useUser } from "@/context/UserContext";
import { StatCard } from "@/components/StatCard";
import { ActivityCard } from "@/components/ActivityCard";

/* ── palette ──────────────────────────────────────────── */

const palette = {
  accent: "#0d9488",
  accentDark: "#065f46",
  accentLight: "#ccfbf1",
  accentSoft: "#f0fdfa",
  surface: "#fafaf9",
  textPrimary: "#1c1917",
  textSecondary: "#78716c",
};

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
      <div className="bg-stone-50 border border-stone-200 rounded-xl p-12 flex flex-col items-center gap-4">
        <Loader2 className="w-6 h-6 animate-spin" style={{ color: palette.accent }} />
        <p className="text-sm text-stone-500 font-medium">Carregando seu painel...</p>
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

      {/* ── hero header ── */}
      <div
        className="relative rounded-2xl px-8 py-10 overflow-hidden"
        style={{ background: `linear-gradient(135deg, ${palette.accent} 0%, ${palette.accentDark} 100%)` }}
      >
        {/* decorative circles */}
        <div className="absolute -top-6 -right-6 h-32 w-32 rounded-full bg-white opacity-10" />
        <div className="absolute bottom-4 left-1/3 h-20 w-20 rounded-full bg-white opacity-[0.07]" />

        <div className="relative flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
          <div>
            <p className="text-sm text-teal-100 font-medium capitalize">{currentDate}</p>
            <h1 className="text-3xl font-extrabold tracking-tight text-white mt-1 flex items-center gap-3">
              <LayoutDashboard className="w-8 h-8" />
              {getGreeting()}, {userName}
            </h1>
            <p className="text-teal-100 text-sm mt-2">
              Acompanhe suas atividades e submissões em um só lugar.
            </p>
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => navigate("/activities")}
              className="bg-white/10 border-white/20 text-white hover:bg-white/20 rounded-xl"
            >
              <BookOpen className="w-4 h-4" />
              Atividades
            </Button>
            <Button
              size="sm"
              onClick={() => navigate("/submissions")}
              className="bg-white text-teal-700 hover:bg-white/90 rounded-xl shadow-none font-semibold"
            >
              <Send className="w-4 h-4" />
              Submissões
            </Button>
          </div>
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
          <h2 className="text-sm font-semibold text-stone-700">Próximas atividades</h2>
          <button
            onClick={() => navigate("/activities")}
            className="text-xs font-medium transition-colors flex items-center gap-1"
            style={{ color: palette.accent }}
            onMouseEnter={(e) => (e.currentTarget.style.color = palette.accentDark)}
            onMouseLeave={(e) => (e.currentTarget.style.color = palette.accent)}
          >
            Ver todas
            <ArrowRight className="w-3 h-3" />
          </button>
        </div>

        {upcomingActivities.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 border border-dashed border-stone-200 rounded-xl bg-stone-50">
            <div
              className="h-16 w-16 rounded-2xl flex items-center justify-center mb-4"
              style={{ backgroundColor: palette.accentLight }}
            >
              <Sparkles className="w-7 h-7" style={{ color: palette.accent }} />
            </div>
            <p className="text-sm font-medium text-stone-600">Tudo em dia</p>
            <p className="text-xs text-stone-400 mt-1">Nenhuma atividade pendente no momento.</p>
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
          <h2 className="text-sm font-semibold text-stone-700 mb-4">Concluídas recentemente</h2>
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
