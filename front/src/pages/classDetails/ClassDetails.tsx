import { useParams, useNavigate, useSearchParams } from "react-router";
import { Button } from "@/components/ui/button";
import Loading from "@/components/Loading";
import Notification from "@/components/Notification";
import { ArrowLeft, BookOpen, Users, Codesandbox } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import JamSessionBanner from "@/components/jam/JamSessionBanner";
import ProblemViewModal from "@/components/ProblemViewModal";
import { useClassDetails } from "./useClassDetails";
import ClassHero from "./ClassHero";
import ActivitiesTab from "./ActivitiesTab";
import StudentsTab from "./StudentsTab";
import JamSessionsTab from "./JamSessionsTab";
import ActivityFormModal from "./ActivityFormModal";
import ActivityViewModal from "./ActivityViewModal";
import DeleteActivityModal from "./DeleteActivityModal";
import SubmissionsModal from "./SubmissionsModal";

export default function ClassDetails() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const defaultTab = searchParams.get("tab") || "activities";

  const {
    classData,
    students,
    activities,
    allProblems,
    filteredStudents,
    jamSessions,
    activeJam,
    loading,
    notification,
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
    handleAddStudent,
    handleRemoveStudent,
    handleCreateActivity,
    handleUpdateActivity,
    handleDeleteActivity,
  } = useClassDetails(id);

  if (loading) return <Loading />;

  if (!classData) {
    return (
      <div className="container mx-auto p-6">
        <div className="text-center py-12">
          <p className="text-stone-500">Turma não encontrada</p>
          <Button onClick={() => navigate("/classes")} className="mt-4">
            Voltar para Turmas
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-6 py-10 space-y-8">
      {notification && (
        <Notification
          message={notification.message}
          type={notification.type}
          onClose={() => setNotification(null)}
        />
      )}

      <button
        onClick={() => navigate("/classes")}
        className="inline-flex items-center gap-1 text-sm font-medium transition-colors"
        style={{ color: "#0d9488" }}
      >
        <ArrowLeft className="w-4 h-4" />
        Voltar para Turmas
      </button>

      <ClassHero
        classData={classData}
        activityCount={activities.length}
        studentCount={students.length}
      />

      {activeJam && <JamSessionBanner session={activeJam} />}

      <Tabs defaultValue={defaultTab} className="w-full">
        <TabsList className="grid w-full grid-cols-3 mb-6">
          <TabsTrigger value="activities" className="flex items-center gap-2">
            <BookOpen className="w-4 h-4" />
            Atividades ({activities.length})
          </TabsTrigger>
          <TabsTrigger value="students" className="flex items-center gap-2">
            <Users className="w-4 h-4" />
            Alunos ({students.length})
          </TabsTrigger>
          <TabsTrigger value="jam" className="flex items-center gap-2">
            <Codesandbox className="w-4 h-4" />
            Jam Sessions ({jamSessions.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="activities">
          <ActivitiesTab
            activities={activities}
            allProblems={allProblems}
            openMenuId={openMenuId}
            onNewActivity={() => setShowNewActivity(true)}
            onViewActivity={(a) => setViewActivity(a)}
            onEditActivity={(a) => { setEditingActivity(a); setOpenMenuId(null); }}
            onDeleteActivity={(a) => { setDeletingActivity(a); setOpenMenuId(null); }}
            onViewSubmissions={(a) => setViewSubmissionsActivity(a)}
            onToggleMenu={(activityId) => setOpenMenuId(openMenuId === activityId ? null : activityId)}
          />
        </TabsContent>

        <TabsContent value="students">
          <StudentsTab
            students={students}
            showAddStudent={showAddStudent}
            searchTerm={searchTerm}
            filteredStudents={filteredStudents}
            onToggleAddStudent={() => setShowAddStudent(!showAddStudent)}
            onSearchTermChange={setSearchTerm}
            onAddStudent={handleAddStudent}
            onRemoveStudent={handleRemoveStudent}
          />
        </TabsContent>

        <TabsContent value="jam">
          <JamSessionsTab jamSessions={jamSessions} classId={id!} />
        </TabsContent>
      </Tabs>

      {showNewActivity && (
        <ActivityFormModal
          key="new"
          isOpen={showNewActivity}
          onClose={() => setShowNewActivity(false)}
          onSave={handleCreateActivity}
          problems={allProblems}
          onViewProblem={(problem) => setViewProblem(problem)}
        />
      )}

      {editingActivity && (
        <ActivityFormModal
          key={editingActivity.id}
          isOpen={!!editingActivity}
          onClose={() => setEditingActivity(null)}
          onSave={handleUpdateActivity}
          activity={editingActivity}
          problems={allProblems}
          onViewProblem={(problem) => setViewProblem(problem)}
        />
      )}

      {viewActivity && (
        <ActivityViewModal
          isOpen={!!viewActivity}
          activity={viewActivity}
          problem={allProblems.find(p => p.id === viewActivity.problemId) || null}
          onClose={() => setViewActivity(null)}
        />
      )}

      {deletingActivity && (
        <DeleteActivityModal
          isOpen={!!deletingActivity}
          onClose={() => setDeletingActivity(null)}
          onConfirm={handleDeleteActivity}
          activityTitle={allProblems.find(p => p.id === deletingActivity.problemId)?.title || "Atividade"}
        />
      )}

      <ProblemViewModal
        isOpen={!!viewProblem}
        problem={viewProblem}
        onClose={() => setViewProblem(null)}
      />

      <SubmissionsModal
        isOpen={!!viewSubmissionsActivity}
        onClose={() => setViewSubmissionsActivity(null)}
        activity={viewSubmissionsActivity}
        classId={Number(id)}
      />
    </div>
  );
}
