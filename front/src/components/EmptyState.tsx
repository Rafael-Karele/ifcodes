import { Button } from "@/components/ui/button";

interface EmptyStateProps {
  icon: React.ElementType;
  title: string;
  description: string;
  action?: {
    label: string;
    onClick: () => void;
    icon?: React.ElementType;
  };
}

export function EmptyState({ icon: Icon, title, description, action }: EmptyStateProps) {
  return (
    <div className="bg-zinc-50 border border-dashed border-zinc-200 rounded-xl py-12 text-center">
      <Icon className="w-8 h-8 text-zinc-300 mx-auto mb-3" />
      <p className="text-sm font-medium text-zinc-600">{title}</p>
      <p className="text-xs text-zinc-400 mt-1">{description}</p>
      {action && (
        <div className="mt-4">
          <Button variant="outline" size="sm" onClick={action.onClick}>
            {action.icon && <action.icon className="w-4 h-4" />}
            {action.label}
          </Button>
        </div>
      )}
    </div>
  );
}
