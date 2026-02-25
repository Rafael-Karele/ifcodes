import { useMemo } from "react";
import { useNavigate } from "react-router";
import {
  BookOpen,
  CheckCircle2,
  Flame,
  LayoutDashboard,
  Loader2,
  Send,
  Terminal,
  Users,
  Code,
} from "lucide-react";
import { startOfDay, subDays, startOfWeek, addDays } from "date-fns";
import { Button } from "@/components/ui/button";
import { useData } from "@/context/DataContext";
import { useUser } from "@/context/UserContext";
import { StatCard } from "@/components/StatCard";
import { SectionCard } from "@/components/SectionCard";
import { CircularProgress } from "./components/CircularProgress";
import { WeeklyHeatmap, type HeatmapCell } from "./components/WeeklyHeatmap";
import { LanguageBar, type LanguageStat } from "./components/LanguageBar";
import { SubmissionFeed } from "./components/SubmissionFeed";
import { ContinueCard } from "./components/ContinueCard";
import type { Submission } from "@/types";

/* ── palette ──────────────────────────────────────────── */

const palette = {
  accent: "#0d9488",
  accentDark: "#065f46",
};

/* ── helpers ─────────────────────────────────────────── */

function getGreeting(): string {
  const h = new Date().getHours();
  if (h < 12) return "Bom dia";
  if (h < 18) return "Boa tarde";
  return "Boa noite";
}

function getMotivation(streak: number, successRate: number): string {
  if (streak >= 7) return "Incrível! Uma semana inteira de dedicação.";
  if (streak >= 3) return "Você está em uma ótima sequência!";
  if (successRate >= 80) return "Excelente taxa de acerto, continue assim!";
  if (successRate >= 50) return "Bom progresso. Cada submissão conta!";
  return "Acompanhe suas atividades e submissões em um só lugar.";
}

const LANG_COLORS: Record<string, string> = {
  c: "#3b82f6",
  cpp: "#8b5cf6",
  java: "#f97316",
  python: "#22c55e",
};

const LANG_DISPLAY: Record<string, string> = {
  c: "C",
  cpp: "C++",
  java: "Java",
  python: "Python",
};

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

/* ── data hooks ──────────────────────────────────────── */

function useHomeData() {
  const { activities, submissions, mapProblems } = useData();

  const successRate = useMemo(() => {
    if (submissions.length === 0) return 0;
    const passed = submissions.filter((s) => s.status === "passed").length;
    return (passed / submissions.length) * 100;
  }, [submissions]);

  const streak = useMemo(() => {
    if (submissions.length === 0) return 0;
    const days = new Set(
      submissions.map((s) => startOfDay(new Date(s.dateSubmitted)).getTime())
    );
    let count = 0;
    let cursor = startOfDay(new Date());
    // If no submission today, start from yesterday
    if (!days.has(cursor.getTime())) {
      cursor = subDays(cursor, 1);
    }
    while (days.has(cursor.getTime())) {
      count++;
      cursor = subDays(cursor, 1);
    }
    return count;
  }, [submissions]);

  const heatmapCells = useMemo((): HeatmapCell[] => {
    const today = startOfDay(new Date());
    // Find the Monday of the current week
    const thisMonday = startOfWeek(today, { weekStartsOn: 1 });
    // Start from 3 weeks before this Monday
    const start = subDays(thisMonday, 21);

    // Build count map
    const countMap = new Map<number, number>();
    for (const s of submissions) {
      const d = startOfDay(new Date(s.dateSubmitted)).getTime();
      countMap.set(d, (countMap.get(d) ?? 0) + 1);
    }

    const cells: HeatmapCell[] = [];
    for (let i = 0; i < 28; i++) {
      const date = addDays(start, i);
      cells.push({ date, count: countMap.get(date.getTime()) ?? 0 });
    }
    return cells;
  }, [submissions]);

  const languageStats = useMemo((): LanguageStat[] => {
    if (submissions.length === 0) return [];
    const counts = new Map<string, number>();
    for (const s of submissions) {
      counts.set(s.language, (counts.get(s.language) ?? 0) + 1);
    }
    return Array.from(counts.entries())
      .sort((a, b) => b[1] - a[1])
      .map(([lang, count]) => ({
        language: LANG_DISPLAY[lang] ?? lang,
        count,
        percentage: (count / submissions.length) * 100,
        color: LANG_COLORS[lang] ?? "#a8a29e",
      }));
  }, [submissions]);

  const urgentActivity = useMemo(() => {
    const now = new Date();
    return [...activities]
      .filter((a) => a.status !== "completed")
      .sort((a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime())
      .at(0) ?? null;
  }, [activities]);

  const recentSubmissions = useMemo((): Submission[] => {
    return [...submissions]
      .sort((a, b) => new Date(b.dateSubmitted).getTime() - new Date(a.dateSubmitted).getTime())
      .slice(0, 5);
  }, [submissions]);

  const dueThisWeek = useMemo(() => {
    const now = new Date();
    const weekFromNow = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
    return activities.filter(
      (a) => a.status !== "completed" && new Date(a.dueDate) >= now && new Date(a.dueDate) <= weekFromNow
    ).length;
  }, [activities]);

  const pendingCount = useMemo(() => {
    return activities.filter((a) => a.status !== "completed").length;
  }, [activities]);

  const solvedProblems = useMemo(() => {
    const passedActivityIds = new Set(
      submissions.filter((s) => s.status === "passed").map((s) => s.activityId)
    );
    return passedActivityIds.size;
  }, [submissions]);

  return {
    successRate,
    streak,
    heatmapCells,
    languageStats,
    urgentActivity,
    recentSubmissions,
    dueThisWeek,
    pendingCount,
    solvedProblems,
    mapProblems,
    submissions,
  };
}

/* ── main component ──────────────────────────────────── */

export default function Home() {
  const navigate = useNavigate();
  const { user } = useUser();
  const { loading } = useData();
  const {
    successRate,
    streak,
    heatmapCells,
    languageStats,
    urgentActivity,
    recentSubmissions,
    dueThisWeek,
    pendingCount,
    solvedProblems,
    mapProblems,
    submissions,
  } = useHomeData();

  if (loading) return <LoadingDashboard />;

  const userName = user?.name?.split(" ")[0] || "Estudante";
  const currentDate = new Date().toLocaleDateString("pt-BR", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  return (
    <div className="max-w-5xl mx-auto px-6 py-10 space-y-6">
      <style>{`
        @keyframes home-fade-up {
          from { opacity: 0; transform: translateY(12px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        .home-section {
          animation: home-fade-up 0.4s ease-out both;
        }
        .heatmap-cell {
          animation: home-fade-up 0.3s ease-out both;
        }
        .feed-row {
          animation: home-fade-up 0.35s ease-out both;
        }
        .circular-progress-ring {
          transition: stroke-dashoffset 0.8s ease-out;
        }
      `}</style>

      {/* ── 1. Smart Hero Header ── */}
      <div
        className="home-section relative rounded-2xl px-8 py-10 overflow-hidden"
        style={{ background: `linear-gradient(135deg, ${palette.accent} 0%, ${palette.accentDark} 100%)`, animationDelay: "0ms" }}
      >
        <div className="absolute -top-6 -right-6 h-32 w-32 rounded-full bg-white opacity-10" />
        <div className="absolute bottom-4 left-1/3 h-20 w-20 rounded-full bg-white opacity-[0.07]" />

        <div className="relative flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
          <div>
            <p className="text-sm text-teal-100 font-medium capitalize">{currentDate}</p>
            <h1 className="text-3xl font-extrabold tracking-tight text-white mt-1 flex items-center gap-3">
              <LayoutDashboard className="w-8 h-8" />
              {getGreeting()}, {userName}
            </h1>
            <p className="text-teal-100 text-sm mt-2 max-w-lg">
              {pendingCount > 0 && (
                <span>
                  {pendingCount} pendente{pendingCount !== 1 && "s"}
                  {dueThisWeek > 0 && <>, {dueThisWeek} vence{dueThisWeek !== 1 && "m"} esta semana</>}.
                  {submissions.length > 0 && <> Taxa de acerto: {Math.round(successRate)}%</>}
                  {" — "}
                </span>
              )}
              {getMotivation(streak, successRate)}
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

      {/* ── 2. Stats Row ── */}
      <div className="home-section grid grid-cols-2 lg:grid-cols-4 gap-3" style={{ animationDelay: "80ms" }}>
        <div className="col-span-2 lg:col-span-1 rounded-xl border border-stone-200 bg-white px-5 py-5">
          <CircularProgress percentage={successRate} />
        </div>
        <StatCard
          label="Sequência"
          value={streak}
          icon={Flame}
          accent={false}
          className={streak >= 3 ? "!bg-orange-50/60 !border-orange-200/80 [&_svg]:text-orange-500 [&_.bg-teal-50]:bg-orange-50 [&_.text-teal-600]:text-orange-500" : ""}
        />
        <StatCard label="Resolvidos" value={solvedProblems} icon={CheckCircle2} />
        <StatCard label="Submissões" value={submissions.length} icon={Terminal} />
      </div>

      {/* ── 3. Heatmap + Language Distribution ── */}
      <div
        className="home-section grid grid-cols-1 lg:grid-cols-2 gap-4"
        style={{ animationDelay: "160ms" }}
      >
        <WeeklyHeatmap cells={heatmapCells} streak={streak} />
        <SectionCard title="Linguagens" icon={Terminal}>
          <div className="px-5 py-5">
            <LanguageBar stats={languageStats} />
          </div>
        </SectionCard>
      </div>

      {/* ── 4. Continue Where You Left Off ── */}
      {urgentActivity && (
        <div className="home-section" style={{ animationDelay: "240ms" }}>
          <ContinueCard
            activity={urgentActivity}
            problemTitle={
              mapProblems.get(urgentActivity.problemId)?.title ?? `Atividade #${urgentActivity.id}`
            }
          />
        </div>
      )}

      {/* ── 5. Recent Submissions ── */}
      <div className="home-section" style={{ animationDelay: "320ms" }}>
        <SectionCard title="Submissões Recentes" icon={Code}>
          <SubmissionFeed submissions={recentSubmissions} />
        </SectionCard>
      </div>

      {/* ── 6. Quick Actions ── */}
      <div
        className="home-section border-t border-stone-200 pt-6 flex flex-wrap gap-3"
        style={{ animationDelay: "400ms" }}
      >
        <Button
          variant="outline"
          size="sm"
          onClick={() => navigate("/activities")}
          className="rounded-xl text-stone-600 border-stone-300 hover:border-teal-300 hover:text-teal-700"
        >
          <BookOpen className="w-4 h-4" />
          Ver Atividades
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={() => navigate("/submissions")}
          className="rounded-xl text-stone-600 border-stone-300 hover:border-teal-300 hover:text-teal-700"
        >
          <Send className="w-4 h-4" />
          Ver Submissões
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={() => navigate("/classes")}
          className="rounded-xl text-stone-600 border-stone-300 hover:border-teal-300 hover:text-teal-700"
        >
          <Users className="w-4 h-4" />
          Minhas Turmas
        </Button>
      </div>
    </div>
  );
}
