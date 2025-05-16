import { DynamicForm } from "@/lib/types";
import { v4 as uuidv4 } from "uuid";

// Default form schema for a simple application form
const DEFAULT_FORM_SCHEMA = {
  type: "default",
  components: [
    {
      type: "text",
      text: "# Formulário de Solicitação\n\nPreencha os dados abaixo para enviar sua solicitação."
    },
    {
      key: "nome",
      label: "Nome Completo",
      type: "textfield",
      placeholder: "Digite seu nome completo",
      validate: {
        required: true
      }
    },
    {
      key: "email",
      label: "Email",
      type: "textfield",
      inputType: "email",
      placeholder: "Digite seu email",
      validate: {
        required: true
      }
    },
    {
      key: "telefone",
      label: "Telefone",
      type: "textfield",
      placeholder: "Digite seu telefone",
      validate: {
        required: true
      }
    },
    {
      key: "assunto",
      label: "Assunto da Solicitação",
      type: "select",
      placeholder: "Selecione o assunto",
      data: {
        values: [
          {
            label: "Informação",
            value: "informacao"
          },
          {
            label: "Reclamação",
            value: "reclamacao"
          },
          {
            label: "Sugestão",
            value: "sugestao"
          },
          {
            label: "Outro",
            value: "outro"
          }
        ]
      },
      validate: {
        required: true
      }
    },
    {
      key: "descricao",
      label: "Descrição",
      type: "textarea",
      placeholder: "Descreva sua solicitação",
      rows: 4,
      validate: {
        required: true
      }
    },
    {
      key: "termos",
      label: "Concordo com os termos e condições",
      type: "checkbox",
      validate: {
        required: true
      }
    },
    {
      key: "submit",
      label: "Enviar Solicitação",
      type: "button",
      theme: "primary"
    }
  ],
  schemaVersion: 5
};

// Mock storage for forms
const formsData: DynamicForm[] = [];

// Initialize default form if none exists
const initializeDefaultForm = () => {
  if (formsData.length === 0) {
    const now = new Date().toISOString();
    const defaultForm: DynamicForm = {
      id: uuidv4(),
      name: "Formulário de Solicitação",
      description: "Formulário para envio de solicitações",
      schema: DEFAULT_FORM_SCHEMA,
      createdAt: now,
      updatedAt: now
    };
    formsData.push(defaultForm);
  }
};

// Get all forms
const getAllForms = async (): Promise<DynamicForm[]> => {
  // Initialize default form if none exists
  initializeDefaultForm();

  return [...formsData];
};

// Get form by ID
const getFormById = async (id: string): Promise<DynamicForm> => {
  initializeDefaultForm();

  const form = formsData.find((f) => f.id === id);
  if (!form) {
    throw new Error(`Form with ID ${id} not found`);
  }
  return { ...form };
};

// Create a new form
const createForm = async (
  data: Omit<DynamicForm, "id" | "createdAt" | "updatedAt">
): Promise<DynamicForm> => {
  const now = new Date().toISOString();
  const newForm: DynamicForm = {
    id: uuidv4(),
    ...data,
    createdAt: now,
    updatedAt: now,
  };
  formsData.push(newForm);
  return { ...newForm };
};

// Update an existing form
const updateForm = async (
  id: string,
  data: Partial<DynamicForm>
): Promise<DynamicForm> => {
  const formIndex = formsData.findIndex((f) => f.id === id);
  if (formIndex === -1) {
    throw new Error(`Form with ID ${id} not found`);
  }

  const updatedForm = {
    ...formsData[formIndex],
    ...data,
    updatedAt: new Date().toISOString(),
  };

  formsData[formIndex] = updatedForm;
  return { ...updatedForm };
};

// Delete a form
const deleteForm = async (id: string): Promise<void> => {
  const formIndex = formsData.findIndex((f) => f.id === id);
  if (formIndex === -1) {
    throw new Error(`Form with ID ${id} not found`);
  }
  formsData.splice(formIndex, 1);
};

export const formService = {
  getAllForms,
  getFormById,
  createForm,
  updateForm,
  deleteForm,
};
