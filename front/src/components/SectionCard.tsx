interface SectionCardProps {
  title: string;
  icon?: React.ElementType;
  action?: React.ReactNode;
  children: React.ReactNode;
}

export function SectionCard({ title, icon: Icon, action, children }: SectionCardProps) {
  return (
    <section className="rounded-xl border border-zinc-200 bg-white overflow-hidden">
      <div className="border-b border-zinc-200 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          {Icon && (
            <div className="bg-zinc-100 rounded-lg p-2">
              <Icon className="w-4 h-4 text-zinc-500" />
            </div>
          )}
          <h2 className="text-lg font-semibold text-zinc-800">{title}</h2>
        </div>
        {action && <div>{action}</div>}
      </div>
      {children}
    </section>
  );
}
