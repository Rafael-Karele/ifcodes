import Loading from "@/components/Loading";
import { useUser } from "@/context/UserContext";
import { Navigate, Outlet } from "react-router";

export default function RedirectIfAuth() {
  const { user, loading } = useUser();

  if (loading) return <Loading />;

  return user ? <Navigate to="/home" replace /> : <Outlet />;
}
