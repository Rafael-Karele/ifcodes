import { useEffect, useRef, useState } from "react";
import { CheckCircle2, XCircle, AlertTriangle, X } from "lucide-react";

type NotificationProps = {
  message: string;
  type?: "success" | "error" | "warning";
  onClose?: () => void;
  duration?: number;
  /** Timestamp when notification was created — used for stable progress calculation */
  createdAt?: number;
  /** When true, renders without fixed positioning (for use inside a stack container) */
  inline?: boolean;
};

const config = {
  success: {
    icon: CheckCircle2,
    bg: "bg-emerald-50",
    border: "border-emerald-200",
    iconBg: "bg-emerald-100",
    iconColor: "text-emerald-600",
    textColor: "text-emerald-800",
    progressBg: "bg-emerald-100",
    progressFill: "bg-emerald-500",
  },
  error: {
    icon: XCircle,
    bg: "bg-red-50",
    border: "border-red-200",
    iconBg: "bg-red-100",
    iconColor: "text-red-600",
    textColor: "text-red-800",
    progressBg: "bg-red-100",
    progressFill: "bg-red-500",
  },
  warning: {
    icon: AlertTriangle,
    bg: "bg-amber-50",
    border: "border-amber-200",
    iconBg: "bg-amber-100",
    iconColor: "text-amber-600",
    textColor: "text-amber-800",
    progressBg: "bg-amber-100",
    progressFill: "bg-amber-500",
  },
};

export default function Notification({
  message,
  type = "error",
  onClose,
  duration = 5000,
  createdAt,
  inline = false,
}: NotificationProps) {
  const startRef = useRef(createdAt ?? Date.now());
  const [progress, setProgress] = useState(100);
  const [visible, setVisible] = useState(false);
  const [dismissed, setDismissed] = useState(false);

  const c = config[type];
  const Icon = c.icon;

  // Slide-in on mount
  useEffect(() => {
    const frame = requestAnimationFrame(() => setVisible(true));
    return () => cancelAnimationFrame(frame);
  }, []);

  // Progress bar — uses fixed startRef, never resets on re-render
  useEffect(() => {
    if (dismissed) return;
    const interval = setInterval(() => {
      const elapsed = Date.now() - startRef.current;
      const percent = Math.max(0, 100 - (elapsed / duration) * 100);
      setProgress(percent);
      if (percent <= 0) {
        clearInterval(interval);
        setVisible(false);
      }
    }, 50);
    return () => clearInterval(interval);
  }, [duration, dismissed]);

  const handleClose = () => {
    setDismissed(true);
    setVisible(false);
    setTimeout(() => onClose?.(), 200);
  };

  return (
    <div
      className={`${
        inline ? "" : "fixed bottom-4 right-4 sm:bottom-6 sm:right-6 z-[100] max-w-sm w-[calc(100vw-2rem)]"
      } transition-all duration-200 ease-out ${
        visible && !dismissed ? "translate-y-0 opacity-100" : "translate-y-3 opacity-0"
      }`}
    >
      <div
        className={`${c.bg} ${c.border} border rounded-xl shadow-lg overflow-hidden`}
      >
        <div className="flex items-start gap-3 px-4 py-3.5">
          <div className={`${c.iconBg} rounded-lg p-1.5 shrink-0 mt-0.5`}>
            <Icon className={`w-4 h-4 ${c.iconColor}`} />
          </div>

          <p className={`text-sm font-medium ${c.textColor} flex-1 leading-snug pt-0.5`}>
            {message}
          </p>

          {onClose && (
            <button
              onClick={handleClose}
              className="shrink-0 rounded-md p-1 text-stone-400 transition-colors hover:bg-stone-200/50 hover:text-stone-600"
              aria-label="Fechar"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        <div className={`h-1 ${c.progressBg}`}>
          <div
            className={`h-full ${c.progressFill} transition-all duration-100 ease-linear`}
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>
    </div>
  );
}
