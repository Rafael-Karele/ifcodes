import { useEffect, useRef, useState } from "react";
import type { Class, ClassStudent } from "@/types/classes";
import type { Student, Activity, Problem } from "@/types";
import ClassesService from "@/services/ClassesService";
import { getAllStudents } from "@/services/StudentsService";
import { getActivitiesByClass, createActivity, updateActivity, deleteActivity } from "@/services/ActivitiesService";
import { getAllProblems } from "@/services/ProblemsServices";
import { JamSessionService } from "@/services/JamSessionService";
import type { JamSession } from "@/types/jam";
import type { ActivityFormData } from "./types";
import { useUser } from "@/context/UserContext";

export function useClassDetails(id: string | undefined) {
  const [classData, setClassData] = useState<Class | null>(null);
  const [students, setStudents] = useState<ClassStudent[]>([]);
  const [activities, setActivities] = useState<Activity[]>([]);
  const [allStudents, setAllStudents] = useState<Student[]>([]);
  const [filteredStudents, setFilteredStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddStudent, setShowAddStudent] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [notification, setNotification] = useState<{
    message: string;
    type: "success" | "error";
  } | null>(null);
  const [showNewActivity, setShowNewActivity] = useState(false);
  const [allProblems, setAllProblems] = useState<Problem[]>([]);
  const [viewProblem, setViewProblem] = useState<Problem | null>(null);
  const [viewActivity, setViewActivity] = useState<Activity | null>(null);
  const [editingActivity, setEditingActivity] = useState<Activity | null>(null);
  const [deletingActivity, setDeletingActivity] = useState<Activity | null>(null);
  const [openMenuId, setOpenMenuId] = useState<number | null>(null);
  const [viewSubmissionsActivity, setViewSubmissionsActivity] = useState<Activity | null>(null);
  const [jamSessions, setJamSessions] = useState<JamSession[]>([]);
  const [activeJam, setActiveJam] = useState<JamSession | null>(null);

  const { user } = useUser();
  const isProfessorOrAdmin = user?.roles?.includes("professor") || user?.roles?.includes("admin");
  const initializedRef = useRef(false);

  useEffect(() => {
    if (!id) return;

    // Prevent Strict Mode double-fire
    if (initializedRef.current) return;
    initializedRef.current = true;

    loadClassDataAndStudents();
    if (isProfessorOrAdmin) {
      loadAllStudents();
    }
    loadClassActivities();
    loadProblems();
    loadJamSessions();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  useEffect(() => {
    filterAvailableStudents();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchTerm, allStudents, students]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      if (!target.closest('.activity-menu')) {
        setOpenMenuId(null);
      }
    };

    if (openMenuId !== null) {
      setTimeout(() => {
        document.addEventListener("mousedown", handleClickOutside);
      }, 0);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [openMenuId]);

  const loadClassDataAndStudents = async () => {
    try {
      const data = await ClassesService.getClassById(Number(id));
      setClassData(data);

      // Extract students from the same response to avoid a duplicate request
      const alunos = data.alunos || [];
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      setStudents(alunos.map((aluno: any) => ({
        id: aluno.id,
        classId: data.id,
        studentId: aluno.id,
        studentName: aluno.name,
        studentEmail: aluno.email,
        enrolledAt: aluno.created_at || new Date().toISOString(),
      })));
    } catch (error) {
      console.error("Erro ao carregar turma:", error);
      showNotification("Erro ao carregar turma", "error");
    } finally {
      setLoading(false);
    }
  };

  const loadAllStudents = async () => {
    try {
      const data = await getAllStudents();
      console.log("Alunos carregados do banco:", data);
      setAllStudents(data);
    } catch (error) {
      console.error("Erro ao carregar lista de alunos:", error);
    }
  };

  const loadClassActivities = async () => {
    try {
      const data = await getActivitiesByClass(Number(id));
      setActivities(data);
    } catch (error) {
      console.error("Erro ao carregar atividades:", error);
    }
  };

  const loadProblems = async () => {
    try {
      const data = await getAllProblems();
      setAllProblems(data);
    } catch (error) {
      console.error("Erro ao carregar problemas:", error);
    }
  };

  const loadJamSessions = async () => {
    try {
      const sessions = await JamSessionService.getByTurma(Number(id));
      setJamSessions(sessions);
      const active = await JamSessionService.getActiveForTurma(Number(id));
      setActiveJam(active);
    } catch (error) {
      console.error("Erro ao carregar jam sessions:", error);
    }
  };

  const filterAvailableStudents = () => {
    const enrolledIds = students.map((s) => s.studentId);
    let available = allStudents.filter((s) => !enrolledIds.includes(s.id));

    if (searchTerm.trim()) {
      available = available.filter(
        (s) =>
          s.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          s.email.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    setFilteredStudents(available);
  };

  const handleAddStudent = async (studentId: number) => {
    try {
      await ClassesService.addStudentToClass(Number(id), { studentId });
      showNotification("Aluno adicionado com sucesso!", "success");
      loadClassStudents();
      setSearchTerm("");
    } catch (error) {
      console.error("Erro ao adicionar aluno:", error);
      showNotification("Erro ao adicionar aluno", "error");
    }
  };

  const handleRemoveStudent = async (studentId: number) => {
    if (!confirm("Tem certeza que deseja remover este aluno da turma?")) return;

    try {
      await ClassesService.removeStudentFromClass(Number(id), studentId);
      showNotification("Aluno removido com sucesso!", "success");
      loadClassStudents();
    } catch (error) {
      console.error("Erro ao remover aluno:", error);
      showNotification("Erro ao remover aluno", "error");
    }
  };

  const showNotification = (message: string, type: "success" | "error") => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 3000);
  };

  const handleCreateActivity = async (formData: ActivityFormData) => {
    try {
      const result = await createActivity({
        ...formData,
        turma_id: Number(id),
      });

      if (result) {
        showNotification("Atividade criada com sucesso!", "success");
        setShowNewActivity(false);
        loadClassActivities();
      } else {
        showNotification("Erro ao criar atividade", "error");
      }
    } catch (error) {
      console.error("Erro ao criar atividade:", error);
      showNotification("Erro ao criar atividade", "error");
    }
  };

  const handleUpdateActivity = async (formData: ActivityFormData) => {
    if (!editingActivity) return;

    try {
      const result = await updateActivity(editingActivity.id, {
        ...formData,
        turma_id: Number(id),
      });

      if (result) {
        showNotification("Atividade atualizada com sucesso!", "success");
        setEditingActivity(null);
        loadClassActivities();
      } else {
        showNotification("Erro ao atualizar atividade", "error");
      }
    } catch (error) {
      console.error("Erro ao atualizar atividade:", error);
      showNotification("Erro ao atualizar atividade", "error");
    }
  };

  const handleDeleteActivity = async () => {
    if (!deletingActivity) return;

    try {
      const success = await deleteActivity(deletingActivity.id);

      if (success) {
        showNotification("Atividade deletada com sucesso!", "success");
        setDeletingActivity(null);
        loadClassActivities();
      } else {
        showNotification("Erro ao deletar atividade", "error");
      }
    } catch (error) {
      console.error("Erro ao deletar atividade:", error);
      showNotification("Erro ao deletar atividade", "error");
    }
  };

  return {
    // Data
    classData,
    students,
    activities,
    allProblems,
    filteredStudents,
    jamSessions,
    activeJam,
    loading,
    notification,

    // Modal/UI state
    showAddStudent,
    setShowAddStudent,
    searchTerm,
    setSearchTerm,
    showNewActivity,
    setShowNewActivity,
    viewProblem,
    setViewProblem,
    viewActivity,
    setViewActivity,
    editingActivity,
    setEditingActivity,
    deletingActivity,
    setDeletingActivity,
    openMenuId,
    setOpenMenuId,
    viewSubmissionsActivity,
    setViewSubmissionsActivity,
    setNotification,

    // Handlers
    handleAddStudent,
    handleRemoveStudent,
    handleCreateActivity,
    handleUpdateActivity,
    handleDeleteActivity,
  };
}
