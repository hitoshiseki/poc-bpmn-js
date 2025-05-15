import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter as Router } from "react-router-dom";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { useEffect, useState } from "react";
import { AppProvider } from "@/lib/app-context";
import AppLayout from "@/app/AppLayout";

// Create a react-query client
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 60 * 1000, // 1 minuto
    },
  },
});

// Initialize local storage with default data if empty
const initializeLocalStorage = () => {
  if (!localStorage.getItem("bpmnProcesses")) {
    localStorage.setItem("bpmnProcesses", JSON.stringify([]));
  }
  if (!localStorage.getItem("dynamicForms")) {
    localStorage.setItem("dynamicForms", JSON.stringify([]));
  }
  if (!localStorage.getItem("processFormIntegration")) {
    localStorage.setItem("processFormIntegration", JSON.stringify([]));
  }
};

function App () {
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    initializeLocalStorage();
    setIsReady(true);
  }, []);

  if (!isReady) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
      </div>
    );
  }

  return (
    <QueryClientProvider client={queryClient}>
      <AppProvider>
        <TooltipProvider>
          <Router>
            <AppLayout />
          </Router>
          <Toaster />
          <Sonner position="top-right" />
        </TooltipProvider>
      </AppProvider>
    </QueryClientProvider>
  );
}

export default App;
