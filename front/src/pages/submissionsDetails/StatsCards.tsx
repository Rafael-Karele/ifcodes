import {
  TestTube,
  CheckCircle2,
  TrendingUp,
  XCircle,
} from "lucide-react";

interface TestStats {
  total: number;
  passed: number;
  failed: number;
  successRate: number;
}

interface StatsCardProps {
  title: string;
  value: string | number;
  icon: React.ElementType;
  iconBg: string;
  iconColor: string;
  description?: string;
}

function StatsCard({
  title,
  value,
  icon: Icon,
  iconBg,
  iconColor,
  description,
}: StatsCardProps) {
  return (
    <div className="rounded-xl border border-stone-200 bg-white px-3 py-3 sm:px-5 sm:py-5">
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <p className="text-sm font-medium text-stone-600">{title}</p>
          <p className="text-xl font-bold text-stone-900 mt-1">{value}</p>
          {description && (
            <p className="text-xs text-stone-500 mt-1">{description}</p>
          )}
        </div>
        <div className={`rounded-lg p-2 ${iconBg}`}>
          <Icon className={`w-5 h-5 ${iconColor}`} />
        </div>
      </div>
    </div>
  );
}

interface StatsCardsProps {
  testStats: TestStats;
}

export function StatsCards({ testStats }: StatsCardsProps) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
      <StatsCard
        title="Casos de Teste"
        value={testStats.total}
        icon={TestTube}
        iconBg="bg-teal-50"
        iconColor="text-teal-600"
        description="Total de testes"
      />
      <StatsCard
        title="Testes Aprovados"
        value={testStats.passed}
        icon={CheckCircle2}
        iconBg="bg-emerald-50"
        iconColor="text-emerald-600"
        description={`${testStats.passed}/${testStats.total} passaram`}
      />
      <StatsCard
        title="Taxa de Sucesso"
        value={`${testStats.successRate}%`}
        icon={TrendingUp}
        iconBg="bg-amber-50"
        iconColor="text-amber-600"
        description="Aprovacao dos testes"
      />
      <StatsCard
        title="Testes Falharam"
        value={testStats.failed}
        icon={XCircle}
        iconBg="bg-red-50"
        iconColor="text-red-600"
        description={`${testStats.failed} falharam`}
      />
    </div>
  );
}
