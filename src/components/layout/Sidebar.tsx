
import { Link, useLocation } from "react-router-dom";
import { useAppContext } from "@/lib/app-context";
import { cn } from "@/lib/utils";
import { 
  ChevronLeft, 
  ChevronRight, 
  Home, 
  FileText, 
  Workflow, 
  Link as LinkIcon
} from "lucide-react";

interface SidebarItemProps {
  to: string;
  icon: React.ElementType;
  label: string;
  isCollapsed: boolean;
}

const SidebarItem = ({ to, icon: Icon, label, isCollapsed }: SidebarItemProps) => {
  const location = useLocation();
  const isActive = location.pathname === to || location.pathname.startsWith(`${to}/`);
  
  return (
    <li>
      <Link
        to={to}
        className={cn(
          "flex items-center rounded-md px-3 py-2 text-sm font-medium transition-colors",
          isActive 
            ? "bg-sidebar-accent text-sidebar-accent-foreground" 
            : "text-sidebar-foreground hover:bg-sidebar-accent/50 hover:text-sidebar-accent-foreground"
        )}
      >
        <Icon className={cn("h-5 w-5", isCollapsed ? "mx-auto" : "mr-2")} />
        {!isCollapsed && <span>{label}</span>}
      </Link>
    </li>
  );
};

const Sidebar = () => {
  const { sidebarOpen, toggleSidebar } = useAppContext();
  
  return (
    <aside
      className={cn(
        "fixed inset-y-0 left-0 z-40 flex flex-col bg-sidebar border-r border-sidebar-border transition-transform duration-300",
        sidebarOpen ? "w-64" : "w-16",
        sidebarOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"
      )}
    >
      <div className="flex h-16 items-center gap-2 border-b border-sidebar-border px-4">
        <div className="flex-1">
          {sidebarOpen && (
            <h1 className="text-xl font-semibold text-sidebar-foreground">BPMN+Forms</h1>
          )}
        </div>
        <button
          onClick={toggleSidebar}
          className="hidden md:flex h-8 w-8 items-center justify-center rounded-md text-sidebar-foreground hover:bg-sidebar-accent"
        >
          {sidebarOpen ? (
            <ChevronLeft className="h-4 w-4" />
          ) : (
            <ChevronRight className="h-4 w-4" />
          )}
        </button>
      </div>
      
      <div className="flex-1 overflow-auto py-4">
        <nav>
          <ul className="space-y-1 px-2">
            <SidebarItem 
              to="/" 
              icon={Home} 
              label="Dashboard" 
              isCollapsed={!sidebarOpen} 
            />
            <SidebarItem 
              to="/processes" 
              icon={Workflow} 
              label="BPMN Processes" 
              isCollapsed={!sidebarOpen} 
            />
            <SidebarItem 
              to="/forms" 
              icon={FileText} 
              label="Dynamic Forms" 
              isCollapsed={!sidebarOpen} 
            />
            <SidebarItem 
              to="/integration" 
              icon={LinkIcon} 
              label="Integration" 
              isCollapsed={!sidebarOpen} 
            />
          </ul>
        </nav>
      </div>
      
      <div className="border-t border-sidebar-border p-4">
        {sidebarOpen && (
          <div className="text-xs text-sidebar-foreground/60">
            BPMN & Forms POC v1.0
          </div>
        )}
      </div>
    </aside>
  );
};

export default Sidebar;
