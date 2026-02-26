import Header from "@/components/Header";
import { Outlet } from "react-router";

export default function AppLayout() {
  return (
    <div className="min-h-screen">
      <Header />
      <main className="h-auto py-6 sm:py-10 px-4 sm:px-6 lg:px-16 xl:px-30">
        <Outlet />
      </main>
    </div>
  );
}
