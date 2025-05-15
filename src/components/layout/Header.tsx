
import { useAppContext } from "@/lib/app-context";
import { Button } from "@/components/ui/button";
import { Menu } from "lucide-react";

const Header = () => {
  const { toggleSidebar } = useAppContext();
  
  return (
    <header className="sticky top-0 z-30 flex h-16 items-center border-b bg-background px-4">
      <Button 
        variant="ghost" 
        size="icon"
        onClick={toggleSidebar}
        className="md:hidden"
      >
        <Menu className="h-5 w-5" />
      </Button>
      
      <div className="ml-4 flex-1">
        <h2 className="text-lg font-medium">BPMN & Dynamic Forms POC</h2>
      </div>
    </header>
  );
};

export default Header;
