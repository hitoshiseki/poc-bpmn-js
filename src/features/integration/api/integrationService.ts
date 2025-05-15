
import { ProcessFormIntegration } from "@/lib/types";

export const integrationService = {
  getAllIntegrations: async (): Promise<ProcessFormIntegration[]> => {
    return new Promise((resolve) => {
      setTimeout(() => {
        const integrations = JSON.parse(localStorage.getItem("processFormIntegration") || "[]");
        resolve(integrations);
      }, 300);
    });
  },
  
  getIntegrationById: async (id: string): Promise<ProcessFormIntegration | null> => {
    return new Promise((resolve) => {
      setTimeout(() => {
        const integrations = JSON.parse(localStorage.getItem("processFormIntegration") || "[]");
        const integration = integrations.find((i: ProcessFormIntegration) => i.id === id);
        resolve(integration || null);
      }, 300);
    });
  },
  
  createIntegration: async (integration: Omit<ProcessFormIntegration, "id" | "createdAt">): Promise<ProcessFormIntegration> => {
    return new Promise((resolve) => {
      setTimeout(() => {
        const integrations = JSON.parse(localStorage.getItem("processFormIntegration") || "[]");
        const newIntegration: ProcessFormIntegration = {
          ...integration,
          id: crypto.randomUUID(),
          createdAt: new Date().toISOString(),
        };
        
        integrations.push(newIntegration);
        localStorage.setItem("processFormIntegration", JSON.stringify(integrations));
        resolve(newIntegration);
      }, 500);
    });
  },
  
  updateIntegration: async (id: string, integration: Omit<ProcessFormIntegration, "id" | "createdAt">): Promise<ProcessFormIntegration> => {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        const integrations = JSON.parse(localStorage.getItem("processFormIntegration") || "[]");
        const index = integrations.findIndex((i: ProcessFormIntegration) => i.id === id);
        
        if (index === -1) {
          reject(new Error("Integration not found"));
          return;
        }
        
        const updatedIntegration = {
          ...integrations[index],
          ...integration,
        };
        
        integrations[index] = updatedIntegration;
        localStorage.setItem("processFormIntegration", JSON.stringify(integrations));
        resolve(updatedIntegration);
      }, 500);
    });
  },
  
  deleteIntegration: async (id: string): Promise<void> => {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        const integrations = JSON.parse(localStorage.getItem("processFormIntegration") || "[]");
        const index = integrations.findIndex((i: ProcessFormIntegration) => i.id === id);
        
        if (index === -1) {
          reject(new Error("Integration not found"));
          return;
        }
        
        integrations.splice(index, 1);
        localStorage.setItem("processFormIntegration", JSON.stringify(integrations));
        resolve();
      }, 500);
    });
  },
};
