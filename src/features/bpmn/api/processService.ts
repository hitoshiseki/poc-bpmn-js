import { BpmnProcess, ProcessFormIntegration } from "@/lib/types";

export const processService = {
  getAllProcesses: async (): Promise<BpmnProcess[]> => {
    return new Promise((resolve) => {
      setTimeout(() => {
        const processes = JSON.parse(localStorage.getItem("bpmnProcesses") || "[]");
        resolve(processes);
      }, 300);
    });
  },

  getProcessById: async (id: string): Promise<BpmnProcess | null> => {
    return new Promise((resolve) => {
      setTimeout(() => {
        const processes = JSON.parse(localStorage.getItem("bpmnProcesses") || "[]");
        const process = processes.find((p: BpmnProcess) => p.id === id);
        resolve(process || null);
      }, 300);
    });
  },

  createProcess: async (process: Omit<BpmnProcess, "id" | "createdAt" | "updatedAt">): Promise<BpmnProcess> => {
    return new Promise((resolve) => {
      setTimeout(() => {
        const processes = JSON.parse(localStorage.getItem("bpmnProcesses") || "[]");
        const newProcess: BpmnProcess = {
          ...process,
          id: crypto.randomUUID(),
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };

        processes.push(newProcess);
        localStorage.setItem("bpmnProcesses", JSON.stringify(processes));
        resolve(newProcess);
      }, 500);
    });
  },

  updateProcess: async (id: string, process: Partial<BpmnProcess>): Promise<BpmnProcess> => {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        const processes = JSON.parse(localStorage.getItem("bpmnProcesses") || "[]");
        const index = processes.findIndex((p: BpmnProcess) => p.id === id);

        if (index === -1) {
          reject(new Error("Processo não encontrado"));
          return;
        }

        const updatedProcess = {
          ...processes[index],
          ...process,
          updatedAt: new Date().toISOString(),
        };

        processes[index] = updatedProcess;
        localStorage.setItem("bpmnProcesses", JSON.stringify(processes));
        resolve(updatedProcess);
      }, 500);
    });
  },

  deleteProcess: async (id: string): Promise<void> => {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        const processes = JSON.parse(localStorage.getItem("bpmnProcesses") || "[]");
        const index = processes.findIndex((p: BpmnProcess) => p.id === id);

        if (index === -1) {
          reject(new Error("Processo não encontrado"));
          return;
        }

        processes.splice(index, 1);
        localStorage.setItem("bpmnProcesses", JSON.stringify(processes));

        // Also remove any integrations that use this process
        const integrations = JSON.parse(localStorage.getItem("processFormIntegration") || "[]");
        const updatedIntegrations = integrations.filter((i: ProcessFormIntegration) => i.processId !== id);
        localStorage.setItem("processFormIntegration", JSON.stringify(updatedIntegrations));

        resolve();
      }, 500);
    });
  },
};
