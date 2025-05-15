// Add required fields to the interface declarations to fix the TS errors
export interface BpmnProcess {
  id: string;
  name: string;
  description: string;
  xml: string;
  createdAt: string;
  updatedAt: string;
}

export interface DynamicForm {
  id: string;
  name: string;
  description: string;
  schema: any;
  createdAt: string;
  updatedAt: string;
}

export interface ProcessFormIntegration {
  id: string;
  processId: string;
  formId: string;
  createdAt: string;
}
