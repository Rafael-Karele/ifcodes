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
});

export const DataProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const { user, loading: userLoading } = useUser();
  const [activities, setActivities] = useState<Activity[]>([]);
  const [problems, setProblems] = useState<Problem[]>([]);
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [loading, setLoading] = useState(true);
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

    es.addEventListener("activity.created", () => updateActivities());
    es.addEventListener("activity.updated", () => updateActivities());
    es.addEventListener("activity.deleted", () => updateActivities());
    es.addEventListener("submission.updated", () => updateSubmissions());

    return () => es.close();
  }, [user, updateActivities, updateSubmissions]);

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
