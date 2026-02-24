import { useNavigate } from "react-router";
import { Zap } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { JamSession } from "@/types/jam";

interface JamSessionBannerProps {
  session: JamSession;
}

export default function JamSessionBanner({ session }: JamSessionBannerProps) {
  const navigate = useNavigate();

  return (
    <div className="mb-4 flex items-center justify-between rounded-lg border border-yellow-200 bg-yellow-50 px-4 py-3">
      <div className="flex items-center gap-3">
        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-yellow-200">
          <Zap className="h-4 w-4 text-yellow-700" />
        </div>
        <div>
          <p className="text-sm font-semibold text-yellow-800">
            Jam ao vivo: {session.titulo}
          </p>
          <p className="text-xs text-yellow-600">
            {session.status === "waiting"
              ? "Aguardando início..."
              : "Sessão em andamento!"}
          </p>
        </div>
      </div>
      <Button
        size="sm"
        onClick={() => navigate(`/jam/${session.id}`)}
        className="bg-yellow-600 hover:bg-yellow-700"
      >
        Entrar
      </Button>
    </div>
  );
}
