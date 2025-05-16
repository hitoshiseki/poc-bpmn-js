// Add required fields to the interface declarations to fix the TS errors
export interface BpmnProcess {
  id: string;
  name: string;
  description: string;
  xml: string;
  createdAt: string;
  updatedAt: string;
}

export interface BpmnBusinessObject {
  id: string;
  name?: string;
  $type: string;
  $attrs?: Record<string, unknown>;
  $parent?: BpmnBusinessObject;
  documentation?: Array<{ text: string }>;
  [key: string]: unknown;
}

export interface ElementRegistry {
  get (elementId: string): BpmnElement | undefined;
  filter (fn: (element: BpmnElement) => boolean): BpmnElement[];
  forEach (fn: (element: BpmnElement) => void): void;
  find (fn: (element: BpmnElement) => boolean): BpmnElement | undefined;
}


export interface ProcessTask {
  id: string;
  name: string;
  formId?: string;
  formName?: string;
  integrationId?: string;
}


// Define types for BPMN.js elements based on documentation
export interface BpmnElement {
  id: string;
  type: string;
  businessObject: BpmnBusinessObject;
}


export interface DynamicForm {
  id: string;
  name: string;
  description: string;
  schema: Schema;
  createdAt: string;
  updatedAt: string;
}

export interface ProcessFormIntegration {
  id: string;
  processId: string;
  formId: string;
  taskId: string;
  taskName: string;
  createdAt: string;
}

/**
 * Schema for a form
 * type: "default",
  components: [
    {
      type: "text",
      text: "# My New Form\n\nThis is a new dynamic form."
    },
    {
      key: "textfield",
      label: "Text Field",
      type: "textfield"
    },
    {
      key: "checkbox",
      label: "Checkbox",
      type: "checkbox"
    }
  ],
  schemaVersion: 5
 */

export type Schema = {
  type: string;
  components: SchemaComponent[];
  schemaVersion: number;
  [key: string]: unknown;
};

export type SchemaComponent = {
  type: string;
  key?: string;
  label?: string;
  text?: string;
  [key: string]: unknown;
};