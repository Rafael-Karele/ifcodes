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
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useData } from "@/context/DataContext";
import { StatCard } from "@/components/StatCard";
import { ActivityCard } from "@/components/ActivityCard";
import { EmptyState } from "@/components/EmptyState";
import { activityStatusConfig, type ActivityStatusKey } from "@/components/StatusBadge";

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
          className="relative bg-white border border-zinc-200 rounded-xl px-5 py-4 overflow-hidden"
        >
          <div className="absolute left-0 top-3 bottom-3 w-[3px] rounded-r-full bg-zinc-200 animate-pulse" />
          <div className="flex items-center gap-4 pl-2">
            <div className="flex-1 space-y-2">
              <div className="h-4 bg-zinc-200 rounded w-1/3 animate-pulse" />
              <div className="h-3 bg-zinc-100 rounded w-48 animate-pulse" />
              <div className="h-3 bg-zinc-100 rounded w-24 animate-pulse" />
            </div>
            <div className="h-5 bg-zinc-100 rounded-md w-16 animate-pulse" />
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

      {/* ── header ── */}
      <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-zinc-900 tracking-tight">Atividades</h1>
          <p className="text-zinc-400 text-sm mt-1">
            Gerencie e acompanhe suas atividades acadêmicas
          </p>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-sm text-zinc-400">
            {activities.length} atividade{activities.length !== 1 ? "s" : ""}
          </span>
          <Button
            variant="outline"
            size="sm"
            onClick={refreshData}
            disabled={loading || refreshing}
          >
            <RefreshCw
              className={`w-4 h-4 ${(loading || refreshing) ? "animate-spin" : ""}`}
            />
            Atualizar
          </Button>
        </div>
      </div>

      {/* ── search / filter ── */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-zinc-400 w-4 h-4" />
          <input
            type="text"
            placeholder="Buscar por título do problema..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-zinc-200 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent bg-white text-sm"
          />
        </div>
        <div className="relative">
          <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-zinc-400 w-4 h-4" />
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="pl-10 pr-8 py-2 border border-zinc-200 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent bg-white min-w-[140px] text-sm"
          >
            <option value="all">Todos os status</option>
            {uniqueStatuses.map((status) => (
              <option key={status} value={status}>
                {activityStatusConfig[status as ActivityStatusKey]?.label || status}
              </option>
            ))}
          </select>
        </div>
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
