
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
  
  getIntegrationByProcessId: async (processId: string): Promise<ProcessFormIntegration | null> => {
    return new Promise((resolve) => {
      setTimeout(() => {
        const integrations = JSON.parse(localStorage.getItem("processFormIntegration") || "[]");
        const integration = integrations.find((i: ProcessFormIntegration) => i.processId === processId);
        resolve(integration || null);
      }, 300);
    });
  },
  
  createIntegration: async (integration: Omit<ProcessFormIntegration, "id" | "createdAt">): Promise<ProcessFormIntegration> => {
    return new Promise((resolve) => {
      setTimeout(() => {
        const integrations = JSON.parse(localStorage.getItem("processFormIntegration") || "[]");
        
        // Check if an integration already exists for this process
        const existingIndex = integrations.findIndex((i: ProcessFormIntegration) => i.processId === integration.processId);
        
        if (existingIndex !== -1) {
          // Update existing integration
          const updatedIntegration = {
            ...integrations[existingIndex],
            formId: integration.formId,
            updatedAt: new Date().toISOString(),
          };
          
          integrations[existingIndex] = updatedIntegration;
          localStorage.setItem("processFormIntegration", JSON.stringify(integrations));
          resolve(updatedIntegration);
        } else {
          // Create new integration
          const newIntegration: ProcessFormIntegration = {
            ...integration,
            id: crypto.randomUUID(),
            createdAt: new Date().toISOString(),
          };
          
          integrations.push(newIntegration);
          localStorage.setItem("processFormIntegration", JSON.stringify(integrations));
          resolve(newIntegration);
        }
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
