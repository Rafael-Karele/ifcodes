import App from "@/App";
import Activities from "@/pages/activities/Activities";
import ActivitiesDetails from "@/pages/activitiesDetails/ActivitiesDetails";
import AppLayout from "@/pages/AppLayout";
import Home from "@/pages/home/Home";
import Login from "@/pages/login/Login";
import ForgotPassword from "@/pages/forgotPassword/ForgotPassword";
import ResetPassword from "@/pages/resetPassword/ResetPassword";
import ChangePassword from "@/pages/changePassword/ChangePassword";
import Unauthorized from "@/pages/Unauthorized";
import Submissions from "@/pages/submissions/Submissions";
import Students from "@/pages/students/Students";
import Teachers from "@/pages/teachers/Teachers";
import Classes from "@/pages/classes/Classes";
import ClassDetails from "@/pages/classDetails/ClassDetails";
import SubmissionsDetails from "@/pages/submissionsDetails/SubmissionsDetails";
import Problems from "@/pages/problems/Problems";
import RequireAuth from "@/pages/RequireAuth";
import RequireRole from "@/pages/RequireRole";
import ProfileView from "@/pages/perfil/ProfileView";
import JamCreate from "@/pages/jam/JamCreate";
import JamView from "@/pages/jam/JamView";
import { BrowserRouter, Navigate, Route, Routes, useLocation } from "react-router";

function NotFound() {
  const location = useLocation();
  return (
    <div className="flex h-screen flex-col items-center justify-center">
      <h1 className="text-2xl font-bold">Página não encontrada</h1>
      {process.env.NODE_ENV === "development" && (
        <>
          <p>Rota: {location.pathname}</p>
          <p>Search: {location.search}</p>
        </>
      )}
    </div>
  );
}

export default function AppRouter() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/password-reset/:token" element={<ResetPassword />} />
        <Route path="/unauthorized" element={<Unauthorized />} />
        <Route element={<RequireAuth />}>
          <Route path="/" element={<AppLayout />}>
            <Route index element={<Navigate to="/home" replace />} />
            <Route path="home" element={<Home />} />
            <Route element={<RequireRole allowedRoles={["student", "professor", "admin"]} />}>
              <Route path="change-password" element={<ChangePassword />} />
              <Route path="perfil" element={<ProfileView />} />
              <Route path="activities">
                <Route index element={<Activities />} />
                <Route path=":id" element={<ActivitiesDetails />} />
              </Route>
              <Route path="submissions">
                <Route index element={<Submissions />} />
                <Route
                  path=":activityId/:submissionId"
                  element={<SubmissionsDetails />}
                />
              </Route>
            </Route>
            <Route element={<RequireRole allowedRoles={["admin"]} />}>
              <Route path="students" element={<Students />} />
              <Route path="teachers" element={<Teachers />} />
            </Route>
            <Route element={<RequireRole allowedRoles={["admin", "professor"]} />}>
              <Route path="problems" element={<Problems />} />
            </Route>
            <Route element={<RequireRole allowedRoles={["student", "professor", "admin"]} />}>
              <Route path="classes">
                <Route index element={<Classes />} />
                <Route path=":id" element={<ClassDetails />} />
              </Route>
              <Route path="jam">
                <Route path="create/:turmaId" element={<JamCreate />} />
                <Route path=":jamId" element={<JamView />} />
              </Route>
            </Route>
          </Route>
        </Route>
        <Route path="*" element={<NotFound />} />
      </Routes>
    </BrowserRouter>
  );
}
