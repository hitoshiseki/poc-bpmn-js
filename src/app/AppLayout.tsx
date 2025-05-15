
import { Outlet } from "react-router-dom";
import { AppRoutes } from "./router";
import Sidebar from "@/components/layout/Sidebar";
import Header from "@/components/layout/Header";
import { useAppContext } from "@/lib/app-context";

const AppLayout = () => {
  const { sidebarOpen } = useAppContext();

  return (
    <div className="flex h-screen w-full overflow-hidden bg-background">
      <Sidebar />

      <div className={`flex flex-1 flex-col overflow-hidden transition-all duration-300 ${sidebarOpen ? "md:ml-64" : "md:ml-16"}`}>
        <Header />

        <main className="flex-1 overflow-auto p-4">
          <div className="container h-full">
            <AppRoutes />
          </div>
        </main>
      </div>
    </div>
  );
};

export default AppLayout;
