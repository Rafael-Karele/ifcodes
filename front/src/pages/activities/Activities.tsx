import { useEffect, useState } from "react";
import { useNavigate } from "react-router";
import {
  Clock,
  CheckCircle2,
  AlertTriangle,
  Search,
  Filter,
  RefreshCw,
  FileText,
  BookOpen,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useData } from "@/context/DataContext";
import { StatCard } from "@/components/StatCard";
import { ActivityCard } from "@/components/ActivityCard";
import { EmptyState } from "@/components/EmptyState";
import { activityStatusConfig, type ActivityStatusKey } from "@/components/StatusBadge";

/* ── palette ──────────────────────────────────────────── */

const palette = {
  accent: "#0d9488",
  accentDark: "#065f46",
  accentLight: "#ccfbf1",
  accentSoft: "#f0fdfa",
  textSecondary: "#78716c",
  border: "#e7e5e4",
};

/* ── helpers ────────────────────────────────────────── */

function stripHtml(html: string): string {
  const doc = new DOMParser().parseFromString(html, "text/html");
  return doc.body.textContent || "";
}

/* ── loading skeleton ──────────────────────────────── */

function LoadingSkeleton() {
  return (
    <div className="space-y-2">
      {[...Array(5)].map((_, i) => (
        <div
          key={i}
          className="relative bg-white border border-stone-200 rounded-xl px-5 py-4 overflow-hidden"
        >
          <div className="absolute left-0 top-3 bottom-3 w-[3px] rounded-r-full bg-stone-200 animate-pulse" />
          <div className="flex items-center gap-4 pl-2">
            <div className="flex-1 space-y-2">
              <div className="h-4 bg-stone-200 rounded w-1/3 animate-pulse" />
              <div className="h-3 bg-stone-100 rounded w-48 animate-pulse" />
              <div className="h-3 bg-stone-100 rounded w-24 animate-pulse" />
            </div>
            <div className="h-5 bg-stone-100 rounded-md w-16 animate-pulse" />
          </div>
        </div>
      ))}
    </div>
  );
}

/* ── main component ─────────────────────────────────── */

export default function Activities() {
  const navigate = useNavigate();
  const { activities, mapProblems, loading, updateActivities } = useData();

  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    updateActivities();
  }, []);

  async function refreshData() {
    setRefreshing(true);
    try {
      await updateActivities();
    } finally {
      setRefreshing(false);
    }
  }

  const filteredActivities = activities.filter((activity) => {
    const problemTitle = mapProblems.get(activity.problemId)?.title || "";
    const matchesSearch = problemTitle
      .toLowerCase()
      .includes(searchTerm.toLowerCase());
    const matchesStatus =
      statusFilter === "all" || activity.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const uniqueStatuses = [...new Set(activities.map((a) => a.status))];

  const now = new Date();
  const pendingCount = activities.filter(
    (a) => a.status !== "completed" && new Date(a.dueDate) >= now
  ).length;
  const overdueCount = activities.filter(
    (a) => a.status !== "completed" && new Date(a.dueDate) < now
  ).length;
  const completedCount = activities.filter(
    (a) => a.status === "completed"
  ).length;

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
            <h1 className="text-3xl font-extrabold tracking-tight text-white flex items-center gap-3">
              <BookOpen className="w-8 h-8" />
              Atividades
            </h1>
            <p className="text-teal-100 text-sm mt-2">
              Gerencie e acompanhe suas atividades acadêmicas
            </p>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-sm text-teal-100">
              {activities.length} atividade{activities.length !== 1 ? "s" : ""}
            </span>
            <Button
              variant="outline"
              size="sm"
              onClick={refreshData}
              disabled={loading || refreshing}
              className="bg-white/10 border-white/20 text-white hover:bg-white/20 rounded-xl"
            >
              <RefreshCw
                className={`w-4 h-4 ${(loading || refreshing) ? "animate-spin" : ""}`}
              />
              Atualizar
            </Button>
          </div>
        </div>
      </div>

      {/* ── search / filter ── */}
      <div className="flex flex-col sm:flex-row items-center gap-4">
        <div className="relative flex-1 w-full">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-stone-400 w-4 h-4" />
          <input
            type="text"
            placeholder="Buscar por título do problema..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 h-11 rounded-xl text-sm bg-white"
            style={{
              border: `1px solid ${palette.border}`,
              outline: "none",
            }}
            onFocus={(e) => {
              e.currentTarget.style.borderColor = palette.accent;
              e.currentTarget.style.boxShadow = `0 0 0 3px ${palette.accent}30`;
            }}
            onBlur={(e) => {
              e.currentTarget.style.borderColor = palette.border;
              e.currentTarget.style.boxShadow = "none";
            }}
          />
        </div>
        <div className="relative">
          <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-stone-400 w-4 h-4" />
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="pl-10 pr-8 h-11 rounded-xl text-sm bg-white min-w-[140px]"
            style={{
              border: `1px solid ${palette.border}`,
              outline: "none",
            }}
            onFocus={(e) => {
              e.currentTarget.style.borderColor = palette.accent;
              e.currentTarget.style.boxShadow = `0 0 0 3px ${palette.accent}30`;
            }}
            onBlur={(e) => {
              e.currentTarget.style.borderColor = palette.border;
              e.currentTarget.style.boxShadow = "none";
            }}
          >
            <option value="all">Todos os status</option>
            {uniqueStatuses.map((status) => (
              <option key={status} value={status}>
                {activityStatusConfig[status as ActivityStatusKey]?.label || status}
              </option>
            ))}
          </select>
        </div>
        {/* count badge */}
        <span
          className="text-sm font-medium px-3 py-1.5 rounded-full whitespace-nowrap"
          style={{ backgroundColor: palette.accentSoft, color: palette.accent }}
        >
          {filteredActivities.length} resultado{filteredActivities.length !== 1 ? "s" : ""}
        </span>
      </div>

      {/* ── stats ── */}
      {!loading && activities.length > 0 && (
        <div className="grid grid-cols-2 lg:grid-cols-3 gap-3">
          <StatCard label="Pendentes" value={pendingCount} icon={Clock} />
          <StatCard
            label="Atrasadas"
            value={overdueCount}
            icon={AlertTriangle}
            accent={overdueCount > 0}
          />
          <StatCard label="Concluídas" value={completedCount} icon={CheckCircle2} />
        </div>
      )}

      {/* ── activity cards ── */}
      {loading ? (
        <LoadingSkeleton />
      ) : filteredActivities.length === 0 ? (
        <EmptyState
          icon={FileText}
          title={
            searchTerm || statusFilter !== "all"
              ? "Nenhuma atividade encontrada"
              : "Nenhuma atividade ainda"
          }
          description={
            searchTerm || statusFilter !== "all"
              ? "Tente ajustar os filtros de busca"
              : "As atividades aparecerão aqui quando forem criadas"
          }
        />
      ) : (
        <div className="grid gap-2">
          {filteredActivities.map((activity, i) => {
            const problem = mapProblems.get(activity.problemId);
            const problemTitle = problem?.title || `Atividade #${activity.id}`;
            const problemPreview = problem?.statement
              ? stripHtml(problem.statement).slice(0, 120)
              : undefined;

            return (
              <ActivityCard
                key={activity.id}
                activity={activity}
                problemTitle={problemTitle}
                problemPreview={problemPreview}
                onClick={() => navigate(`/activities/${activity.id}`)}
                index={i}
              />
            );
          })}
        </div>
      )}
    </div>
  );
}
