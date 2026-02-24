import { useState, useEffect } from "react";
import { Clock } from "lucide-react";

interface JamTimerProps {
  startedAt: string | null;
  timeLimitMinutes: number | null;
}

export default function JamTimer({ startedAt, timeLimitMinutes }: JamTimerProps) {
  const [remaining, setRemaining] = useState<number | null>(null);

  useEffect(() => {
    if (!startedAt || !timeLimitMinutes) return;

    const endTime = new Date(startedAt).getTime() + timeLimitMinutes * 60 * 1000;

    const interval = setInterval(() => {
      const now = Date.now();
      const diff = Math.max(0, Math.floor((endTime - now) / 1000));
      setRemaining(diff);
    }, 1000);

    return () => clearInterval(interval);
  }, [startedAt, timeLimitMinutes]);

  if (!startedAt || !timeLimitMinutes) return null;
  if (remaining === null) return null;

  const minutes = Math.floor(remaining / 60);
  const seconds = remaining % 60;
  const isLow = remaining < 300; // less than 5 minutes

  return (
    <div
      className={`flex items-center gap-2 rounded-lg px-4 py-2 font-mono text-lg font-bold ${
        isLow
          ? "animate-pulse bg-red-100 text-red-700"
          : "bg-gray-100 text-gray-700"
      }`}
    >
      <Clock className="h-5 w-5" />
      <span>
        {String(minutes).padStart(2, "0")}:{String(seconds).padStart(2, "0")}
      </span>
    </div>
  );
}
