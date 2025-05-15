
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
  schema: Schema;
  createdAt: string;
  updatedAt: string;
}

export interface ProcessFormIntegration {
  id: string;
  processId: string;
  formId: string;
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