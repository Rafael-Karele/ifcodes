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

export type SseNotification = {
  id: number;
  message: string;
  type: "success" | "warning";
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
  sseNotifications: SseNotification[];
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
  sseNotifications: [],
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
  const [sseNotifications, setSseNotifications] = useState<SseNotification[]>([]);

  const pushNotification = useCallback((message: string, type: "success" | "warning" = "success") => {
    const id = Date.now();
    setSseNotifications((prev) => [...prev, { id, message, type }]);
  }, []);

  const dismissNotification = useCallback((id: number) => {
    setSseNotifications((prev) => prev.filter((n) => n.id !== id));
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

  // SSE: escuta eventos do backend para atualizar dados em tempo real
  useEffect(() => {
    if (!user) return;

    const token = localStorage.getItem("auth_token");
    if (!token) return;

    const es = new EventSource(
      `${import.meta.env.VITE_API_URL}/api/sse/events?token=${token}`
    );

    es.addEventListener("activity.created", () => {
      updateActivities();
      pushNotification("Uma nova atividade foi publicada!");
    });
    es.addEventListener("activity.updated", () => {
      updateActivities();
      pushNotification("Uma atividade foi atualizada.", "warning");
    });
    es.addEventListener("activity.deleted", () => {
      updateActivities();
      pushNotification("Uma atividade foi removida.", "warning");
    });
    es.addEventListener("submission.updated", () => {
      updateSubmissions();
      pushNotification("Sua submissão foi avaliada!");
    });

    return () => es.close();
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
        sseNotifications,
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
