import { useEffect, useState } from "react";
import { useNavigate } from "react-router";
import {
  Clock,
  CheckCircle2,
  AlertTriangle,
  FileText,
  BookOpen,
} from "lucide-react";
import { useData } from "@/context/DataContext";
import { StatCard } from "@/components/StatCard";
import { ActivityCard } from "@/components/ActivityCard";
import { EmptyState } from "@/components/EmptyState";
import { HeroHeader } from "@/components/HeroHeader";
import { SearchFilter } from "@/components/SearchFilter";
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
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-3 sm:py-5 space-y-8">

      {/* ── hero header ── */}
      <HeroHeader
        icon={BookOpen}
        title="Atividades"
        description="Gerencie e acompanhe suas atividades acadêmicas"
      />

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

      {/* ── search / filter ── */}
      <SearchFilter
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
        statusFilter={statusFilter}
        onStatusFilterChange={setStatusFilter}
        statusOptions={uniqueStatuses.map((status) => ({
          value: status,
          label: activityStatusConfig[status as ActivityStatusKey]?.label || status,
        }))}
      />

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
