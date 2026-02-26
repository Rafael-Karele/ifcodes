import { useEffect, useState } from "react";
import { useNavigate } from "react-router";
import {
  Clock,
  CheckCircle2,
  AlertTriangle,
  Search,
  Filter,
  FileText,
  BookOpen,
} from "lucide-react";
import { useData } from "@/context/DataContext";
import { StatCard } from "@/components/StatCard";
import { ActivityCard } from "@/components/ActivityCard";
import { EmptyState } from "@/components/EmptyState";
import { activityStatusConfig, type ActivityStatusKey } from "@/components/StatusBadge";

/* ── palette ──────────────────────────────────────────── */

const palette = {
  accent: "#0d9488",
  accentDark: "#065f46",
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

  useEffect(() => {
    updateActivities();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

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
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-10 space-y-8">

      {/* ── hero header ── */}
      <div
        className="relative rounded-2xl px-5 py-8 sm:px-8 sm:py-10 overflow-hidden"
        style={{ background: `linear-gradient(135deg, ${palette.accent} 0%, ${palette.accentDark} 100%)` }}
      >
        {/* decorative circles */}
        <div className="absolute -top-6 -right-6 h-32 w-32 rounded-full bg-white opacity-10" />
        <div className="absolute bottom-4 left-1/3 h-20 w-20 rounded-full bg-white opacity-[0.07]" />

        <div className="relative flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white flex items-center gap-3">
              <BookOpen className="w-6 h-6 sm:w-8 sm:h-8" />
              Atividades
            </h1>
            <p className="text-teal-100 text-sm mt-2">
              Gerencie e acompanhe suas atividades acadêmicas
            </p>
          </div>
          <span className="text-sm text-teal-100">
            {activities.length} atividade{activities.length !== 1 ? "s" : ""}
          </span>
        </div>
      </div>

      {/* ── search / filter ── */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-400 w-4 h-4" />
        <input
          type="text"
          placeholder="Buscar por título..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full pl-10 pr-12 h-10 rounded-xl text-sm bg-white border border-stone-200 focus:outline-none focus:border-teal-600 focus:ring focus:ring-teal-600/20 transition-colors"
        />
        <div className="absolute right-1.5 top-1/2 -translate-y-1/2">
          <div className="relative">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="appearance-none w-7 h-7 rounded-lg cursor-pointer opacity-0 absolute inset-0 z-10"
            >
              <option value="all">Todos os status</option>
              {uniqueStatuses.map((status) => (
                <option key={status} value={status}>
                  {activityStatusConfig[status as ActivityStatusKey]?.label || status}
                </option>
              ))}
            </select>
            <div
              className={`w-7 h-7 rounded-lg flex items-center justify-center transition-colors ${
                statusFilter !== "all"
                  ? "text-teal-600 bg-teal-50"
                  : "text-stone-400 hover:text-stone-600 hover:bg-stone-100"
              }`}
            >
              <Filter className="w-4 h-4" />
            </div>
          </div>
        </div>
      </div>

      {/* ── stats ── */}
      {!loading && activities.length > 0 && (
        <div className="grid grid-cols-3 gap-3">
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
