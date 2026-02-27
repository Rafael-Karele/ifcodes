import { useMemo } from "react";
import {
  CheckCircle2,
  Flame,
  Loader2,
  Terminal,
  Code,
} from "lucide-react";
import { startOfDay, subDays, startOfWeek, addDays } from "date-fns";
import { useData } from "@/context/DataContext";
import { useUser } from "@/context/UserContext";
import { StatCard } from "@/components/StatCard";
import { SectionCard } from "@/components/SectionCard";
import { CircularProgress } from "./components/CircularProgress";
import { WeeklyHeatmap, type HeatmapCell } from "./components/WeeklyHeatmap";
import { LanguageBar, type LanguageStat } from "./components/LanguageBar";
import { SubmissionFeed } from "./components/SubmissionFeed";
import { ContinueCard } from "./components/ContinueCard";
import { HeroHeader } from "@/components/HeroHeader";
import { LayoutDashboard } from "lucide-react";
import type { Submission } from "@/types";
import "./Home.css";

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
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-16">
      <div className="bg-stone-50 border border-stone-200 rounded-xl p-12 flex flex-col items-center gap-4">
        <Loader2 className="w-6 h-6 animate-spin text-teal-600" />
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
    const thisMonday = startOfWeek(today, { weekStartsOn: 1 });
    const start = subDays(thisMonday, 21);

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
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-3 sm:py-5 space-y-6">
      {/* ── 1. Smart Hero Header ── */}
      <HeroHeader
        icon={LayoutDashboard}
        title={<>{getGreeting()}, {userName}</>}
        description={
          <>
            <span className="text-xs sm:text-sm text-teal-100 font-medium capitalize block mb-1">{currentDate}</span>
            {pendingCount > 0 && (
              <span>
                {pendingCount} pendente{pendingCount !== 1 && "s"}
                {dueThisWeek > 0 && (
                  <>, {dueThisWeek} vence{dueThisWeek !== 1 && "m"} esta semana</>
                )}
                .
                {submissions.length > 0 && (
                  <> Taxa de acerto: {Math.round(successRate)}%</>
                )}
                {" — "}
              </span>
            )}
            {getMotivation(streak, successRate)}
          </>
        }
        className="home-section home-delay-0"
      />

      {/* ── 2. Stats Row ── */}
      <div className="home-section home-delay-1 grid grid-cols-2 lg:grid-cols-4 gap-3">
        <div className="rounded-xl border border-stone-200 bg-white px-3 py-3 sm:px-5 sm:py-5">
          <CircularProgress percentage={successRate} label="Taxa de Acerto" />
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

      {/* ── 3. Continue Where You Left Off ── */}
      {urgentActivity && (
        <div className="home-section home-delay-2">
          <ContinueCard
            activity={urgentActivity}
            problemTitle={
              mapProblems.get(urgentActivity.problemId)?.title ?? `Atividade #${urgentActivity.id}`
            }
          />
        </div>
      )}

      {/* ── 4. Heatmap + Language Distribution ── */}
      <div className="home-section home-delay-3 grid grid-cols-1 lg:grid-cols-2 gap-4">
        <WeeklyHeatmap cells={heatmapCells} streak={streak} />
        <SectionCard title="Linguagens" icon={Terminal}>
          <div className="px-3 py-3 sm:px-5 sm:py-5">
            <LanguageBar stats={languageStats} />
          </div>
        </SectionCard>
      </div>

      {/* ── 5. Recent Submissions ── */}
      <div className="home-section home-delay-4">
        <SectionCard title="Submissões Recentes" icon={Code}>
          <SubmissionFeed submissions={recentSubmissions} />
        </SectionCard>
      </div>
    </div>
  );
}
