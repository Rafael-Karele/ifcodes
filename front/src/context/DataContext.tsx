/* eslint-disable react-refresh/only-export-components */
import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  useMemo,
} from "react";
import type { Activity, Problem, Submission } from "@/types";
import { getAllActivities } from "@/services/ActivitiesService";
import { getAllProblems } from "@/services/ProblemsServices";
import { getAllSubmissions } from "@/services/SubmissionsService";
import { useUser } from "./UserContext";

export type RealtimeNotification = {
  id: number;
  message: string;
  type: "success" | "warning" | "error";
  createdAt: number;
  duration: number;
};

interface DataContextType {
  activities: Activity[];
  problems: Problem[];
  submissions: Submission[];
  mapActivities: Map<number, Activity>;
  mapProblems: Map<number, Problem>;
  mapSubmissions: Map<number, Submission>;
  loading: boolean;
  updateSubmissions: () => Promise<void>;
  updateActivities: () => Promise<void>;
  notifications: RealtimeNotification[];
  pushNotification: (message: string, type?: "success" | "warning" | "error") => void;
  dismissNotification: (id: number) => void;
}

const DataContext = createContext<DataContextType>({
  activities: [],
  problems: [],
  submissions: [],
  mapActivities: new Map(),
  mapProblems: new Map(),
  mapSubmissions: new Map(),
  loading: false,
  updateSubmissions: async () => {},
  updateActivities: async () => {},
  notifications: [],
  pushNotification: () => {},
  dismissNotification: () => {},
});

export const DataProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const { user, loading: userLoading } = useUser();
  const [activities, setActivities] = useState<Activity[]>([]);
  const [problems, setProblems] = useState<Problem[]>([]);
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [loading, setLoading] = useState(true);
  const [notifications, setNotifications] = useState<RealtimeNotification[]>([]);

  const pushNotification = useCallback((message: string, type: "success" | "warning" | "error" = "success", duration = 5000) => {
    const id = Date.now() + Math.random();
    const createdAt = Date.now();
    setNotifications((prev) => [...prev, { id, message, type, createdAt, duration }]);
    setTimeout(() => {
      setNotifications((prev) => prev.filter((n) => n.id !== id));
    }, duration + 300);
  }, []);

  const dismissNotification = useCallback((id: number) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id));
  }, []);
  const mapProblems = useMemo(() => {
    return new Map(problems.map((problem) => [problem.id, problem]));
  }, [problems]);
  const mapActivities = useMemo(() => {
    return new Map(activities.map((activity) => [activity.id, activity]));
  }, [activities]);

  const mapSubmissions = useMemo(() => {
    return new Map(
      submissions.map((submission) => [submission.id, submission])
    );
  }, [submissions]);

  const updateSubmissions = useCallback(async () => {
    try {
      const submissions = await getAllSubmissions();
      setSubmissions(submissions);
    } catch (error) {
      console.error("DataContext: Erro ao atualizar submissões:", error);
    }
  }, []);

  const updateActivities = useCallback(async () => {
    try {
      const activitiesData = await getAllActivities();
      setActivities(activitiesData.items);
    } catch (error) {
      console.error("DataContext: Erro ao atualizar atividades:", error);
    }
  }, []);

  useEffect(() => {
    const fetchData = async () => {
      if (userLoading) return;
      
      if (!user) {
        setActivities([]);
        setProblems([]);
        setSubmissions([]);
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        
        const [activitiesData, problemsData, submissionsData] =
          await Promise.all([
            getAllActivities(),
            getAllProblems(),
            getAllSubmissions(),
          ]);
        
        setActivities(activitiesData.items);
        setProblems(problemsData);
        setSubmissions(submissionsData);
      } catch (error) {
        console.error("DataContext: Falha ao buscar dados:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [user, userLoading]);

  // WebSocket: escuta eventos do backend para atualizar dados em tempo real
  useEffect(() => {
    if (!user) return;

    const token = localStorage.getItem("auth_token");
    if (!token) return;

    const wsUrl = import.meta.env.VITE_WS_URL || "ws://localhost:3002";
    let ws: WebSocket | null = null;
    let reconnectTimer: ReturnType<typeof setTimeout> | null = null;
    let disposed = false;

    function connect() {
      if (disposed) return;

      ws = new WebSocket(`${wsUrl}/notifications`);

      ws.onopen = () => {
        ws?.send(JSON.stringify({ type: "AUTH_NOTIFICATIONS", token }));
      };

      ws.onmessage = (event) => {
        try {
          const msg = JSON.parse(event.data);
          if (msg.type === "ERROR") {
            // Auth failed — stop reconnecting
            disposed = true;
            ws?.close();
            return;
          }
          if (msg.type === "NOTIFICATION") {
            switch (msg.event) {
              case "activity.created":
                updateActivities();
                pushNotification("Uma nova atividade foi publicada!");
                break;
              case "activity.updated":
                updateActivities();
                pushNotification("Uma atividade foi atualizada.", "warning");
                break;
              case "activity.deleted":
                updateActivities();
                pushNotification("Uma atividade foi removida.", "warning");
                break;
              case "submission.updated":
                updateSubmissions();
                pushNotification("Sua submissão foi avaliada!");
                break;
            }
          }
        } catch {
          // ignore parse errors
        }
      };

      ws.onclose = () => {
        if (!disposed) {
          reconnectTimer = setTimeout(connect, 5000);
        }
      };

      ws.onerror = () => {
        ws?.close();
      };
    }

    connect();

    return () => {
      disposed = true;
      if (reconnectTimer) clearTimeout(reconnectTimer);
      ws?.close();
    };
  }, [user, updateActivities, updateSubmissions, pushNotification]);

  return (
    <DataContext.Provider
      value={{
        activities,
        problems,
        mapActivities,
        mapProblems,
        loading,
        mapSubmissions,
        submissions,
        updateSubmissions,
        updateActivities,
        notifications,
        pushNotification,
        dismissNotification,
      }}
    >
      {children}
    </DataContext.Provider>
  );
};

export const useData = () => {
  const context = useContext(DataContext);
  if (context === undefined) {
    throw new Error("useData must be used within an DataProvider");
  }
  return context;
};

export default DataProvider;
