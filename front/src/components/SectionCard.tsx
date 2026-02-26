interface SectionCardProps {
  title: string;
  icon?: React.ElementType;
  action?: React.ReactNode;
  children: React.ReactNode;
}

export function SectionCard({ title, icon: Icon, action, children }: SectionCardProps) {
  return (
    <section className="rounded-xl border border-stone-200 bg-white overflow-hidden">
      <div className="border-b border-stone-200 px-4 py-3 sm:px-6 sm:py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          {Icon && (
            <div className="bg-teal-50 rounded-lg p-2">
              <Icon className="w-4 h-4 text-teal-600" />
            </div>
          )}
          <h2 className="text-lg font-semibold text-stone-800">{title}</h2>
        </div>
        {action && <div>{action}</div>}
      </div>
      {children}
    </section>
  );
}
