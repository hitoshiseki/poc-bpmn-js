import { ProcessFormIntegration } from "@/lib/types";
import { v4 as uuidv4 } from "uuid";

// Mock storage for integrations
const integrationsData: ProcessFormIntegration[] = [];

// Get all integrations
const getAllIntegrations = async (): Promise<ProcessFormIntegration[]> => {
  return [...integrationsData];
};

// Get integration by ID
const getIntegrationById = async (id: string): Promise<ProcessFormIntegration> => {
  const integration = integrationsData.find((i) => i.id === id);
  if (!integration) {
    throw new Error(`Integration with ID ${id} not found`);
  }
  return { ...integration };
};

// Get integration by process ID
const getIntegrationByProcessId = async (processId: string): Promise<ProcessFormIntegration | undefined> => {
  const integration = integrationsData.find((i) => i.processId === processId);
  return integration ? { ...integration } : undefined;
};

// Get integrations by process ID and task ID
const getIntegrationsByProcessTask = async (processId: string, taskId: string): Promise<ProcessFormIntegration | undefined> => {
  const integration = integrationsData.find(
    (i) => i.processId === processId && i.taskId === taskId
  );
  return integration ? { ...integration } : undefined;
};

// Create a new integration
const createIntegration = async (
  data: Omit<ProcessFormIntegration, "id" | "createdAt">
): Promise<ProcessFormIntegration> => {
  const now = new Date().toISOString();
  const newIntegration: ProcessFormIntegration = {
    id: uuidv4(),
    ...data,
    createdAt: now,
  };
  integrationsData.push(newIntegration);
  return { ...newIntegration };
};

// Update an existing integration
const updateIntegration = async (
  id: string,
  data: Omit<ProcessFormIntegration, "id" | "createdAt">
): Promise<ProcessFormIntegration> => {
  const integrationIndex = integrationsData.findIndex((i) => i.id === id);
  if (integrationIndex === -1) {
    throw new Error(`Integration with ID ${id} not found`);
  }

  const updatedIntegration = {
    ...integrationsData[integrationIndex],
    ...data,
  };

  integrationsData[integrationIndex] = updatedIntegration;
  return { ...updatedIntegration };
};

// Delete an integration
const deleteIntegration = async (id: string): Promise<void> => {
  const integrationIndex = integrationsData.findIndex((i) => i.id === id);
  if (integrationIndex === -1) {
    throw new Error(`Integration with ID ${id} not found`);
  }
  integrationsData.splice(integrationIndex, 1);
};

export const integrationService = {
  getAllIntegrations,
  getIntegrationById,
  getIntegrationByProcessId,
  getIntegrationsByProcessTask,
  createIntegration,
  updateIntegration,
  deleteIntegration,
};
