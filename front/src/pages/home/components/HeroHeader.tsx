import { useNavigate } from "react-router";
import { BookOpen, LayoutDashboard, Send } from "lucide-react";
import { Button } from "@/components/ui/button";

interface HeroHeaderProps {
  userName: string;
  currentDate: string;
  greeting: string;
  motivation: string;
  pendingCount: number;
  dueThisWeek: number;
  submissionCount: number;
  successRate: number;
}

export function HeroHeader({
  userName,
  currentDate,
  greeting,
  motivation,
  pendingCount,
  dueThisWeek,
  submissionCount,
  successRate,
}: HeroHeaderProps) {
  const navigate = useNavigate();

  return (
    <div className="home-section home-delay-0 relative rounded-2xl px-8 py-10 overflow-hidden bg-gradient-to-br from-teal-600 to-emerald-800">
      <div className="absolute -top-6 -right-6 h-32 w-32 rounded-full bg-white opacity-10" />
      <div className="absolute bottom-4 left-1/3 h-20 w-20 rounded-full bg-white opacity-[0.07]" />

      <div className="relative flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
        <div>
          <p className="text-sm text-teal-100 font-medium capitalize">
            {currentDate}
          </p>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white mt-1 flex items-center gap-3">
            <LayoutDashboard className="w-6 h-6 sm:w-8 sm:h-8" />
            {greeting}, {userName}
          </h1>
          <p className="text-teal-100 text-sm mt-2 max-w-lg">
            {pendingCount > 0 && (
              <span>
                {pendingCount} pendente{pendingCount !== 1 && "s"}
                {dueThisWeek > 0 && (
                  <>
                    , {dueThisWeek} vence{dueThisWeek !== 1 && "m"} esta semana
                  </>
                )}
                .
                {submissionCount > 0 && (
                  <> Taxa de acerto: {Math.round(successRate)}%</>
                )}
                {" — "}
              </span>
            )}
            {motivation}
          </p>
        </div>
        <div className="flex flex-wrap gap-2 w-full sm:w-auto">
          <Button
            variant="outline"
            size="sm"
            onClick={() => navigate("/activities")}
            className="flex-1 sm:flex-none bg-white/10 border-white/20 text-white hover:bg-white/20 rounded-xl"
          >
            <BookOpen className="w-4 h-4" />
            Atividades
          </Button>
          <Button
            size="sm"
            onClick={() => navigate("/submissions")}
            className="flex-1 sm:flex-none bg-white text-teal-700 hover:bg-white/90 rounded-xl shadow-none font-semibold"
          >
            <Send className="w-4 h-4" />
            Submissões
          </Button>
        </div>
      </div>
    </div>
  );
}
