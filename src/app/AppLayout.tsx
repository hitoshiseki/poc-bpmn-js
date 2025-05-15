
import { Outlet } from "react-router-dom";
import { AppRoutes } from "./router";
import Sidebar from "@/components/layout/Sidebar";
import Header from "@/components/layout/Header";
import { useAppContext } from "@/lib/app-context";

const AppLayout = () => {
  const { sidebarOpen } = useAppContext();

  return (
    <div className="flex h-screen w-full overflow-hidden">
      <Sidebar />
      
      <div className="flex flex-1 flex-col overflow-hidden">
        <Header />
        
        <main className={`flex-1 overflow-auto p-4 transition-all duration-300 ${sidebarOpen ? "md:ml-64" : ""}`}>
          <div className="container mx-auto h-full">
            <AppRoutes />
          </div>
        </main>
      </div>
    </div>
  );
};

export default AppLayout;
