interface StatCardProps {
  label: string;
  value: number | string | React.ReactNode;
  icon: React.ElementType;
  accent?: boolean;
  className?: string;
}

export function StatCard({ label, value, icon: Icon, accent, className = "" }: StatCardProps) {
  return (
    <div
      className={`relative rounded-xl border px-3 py-3 sm:px-5 sm:py-5 transition-shadow hover:shadow-md ${
        accent
          ? "bg-red-50/60 border-red-200/80"
          : "bg-white border-stone-200"
      } ${className}`}
    >
      <div className="flex items-start justify-between">
        <div>
          <div className={`text-xl sm:text-3xl font-bold tabular-nums tracking-tight ${accent ? "text-red-700" : "text-stone-900"}`}>
            {value}
          </div>
          <p className={`text-xs sm:text-sm mt-0.5 sm:mt-1 font-medium ${accent ? "text-red-600/80" : "text-stone-500"}`}>
            {label}
          </p>
        </div>
        <div className={`p-2 rounded-lg ${accent ? "bg-red-100/80 text-red-600" : "bg-teal-50 text-teal-600"}`}>
          <Icon className="w-5 h-5" />
        </div>
      </div>
    </div>
  );
}
