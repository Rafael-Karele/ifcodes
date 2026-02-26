import { Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";

interface EmptyStateProps {
  icon?: React.ElementType;
  title: string;
  description: string;
  action?: {
    label: string;
    onClick: () => void;
    icon?: React.ElementType;
  };
}

export function EmptyState({ icon: Icon, title, description, action }: EmptyStateProps) {
  const DisplayIcon = Icon || Sparkles;

  return (
    <div className="flex flex-col items-center justify-center py-12 sm:py-24">
      <div className="h-20 w-20 rounded-2xl flex items-center justify-center mb-5" style={{ backgroundColor: "#ccfbf1" }}>
        <DisplayIcon className="w-9 h-9" style={{ color: "#0d9488" }} />
      </div>
      <p className="text-lg font-semibold text-stone-700">{title}</p>
      <p className="text-sm text-stone-400 max-w-xs text-center mt-2">{description}</p>
      {action && (
        <div className="mt-5">
          <Button
            variant="outline"
            size="sm"
            onClick={action.onClick}
            className="rounded-xl border-stone-300 hover:border-teal-500 hover:bg-teal-50 text-stone-600 hover:text-teal-700"
          >
            {action.icon && <action.icon className="w-4 h-4" />}
            {action.label}
          </Button>
        </div>
      )}
    </div>
  );
}
