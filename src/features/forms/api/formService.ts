import { DynamicForm, ProcessFormIntegration } from "@/lib/types";

export const formService = {
  getAllForms: async (): Promise<DynamicForm[]> => {
    return new Promise((resolve) => {
      setTimeout(() => {
        const forms = JSON.parse(localStorage.getItem("dynamicForms") || "[]");
        resolve(forms);
      }, 300);
    });
  },

  getFormById: async (id: string): Promise<DynamicForm | null> => {
    return new Promise((resolve) => {
      setTimeout(() => {
        const forms = JSON.parse(localStorage.getItem("dynamicForms") || "[]");
        const form = forms.find((f: DynamicForm) => f.id === id);
        resolve(form || null);
      }, 300);
    });
  },

  createForm: async (form: Omit<DynamicForm, "id" | "createdAt" | "updatedAt">): Promise<DynamicForm> => {
    return new Promise((resolve) => {
      setTimeout(() => {
        const forms = JSON.parse(localStorage.getItem("dynamicForms") || "[]");
        const newForm: DynamicForm = {
          ...form,
          id: crypto.randomUUID(),
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };

        forms.push(newForm);
        localStorage.setItem("dynamicForms", JSON.stringify(forms));
        resolve(newForm);
      }, 500);
    });
  },

  updateForm: async (id: string, form: Partial<DynamicForm>): Promise<DynamicForm> => {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        const forms = JSON.parse(localStorage.getItem("dynamicForms") || "[]");
        const index = forms.findIndex((f: DynamicForm) => f.id === id);

        if (index === -1) {
          reject(new Error("Formulário não encontrado"));
          return;
        }

        const updatedForm = {
          ...forms[index],
          ...form,
          updatedAt: new Date().toISOString(),
        };

        forms[index] = updatedForm;
        localStorage.setItem("dynamicForms", JSON.stringify(forms));
        resolve(updatedForm);
      }, 500);
    });
  },

  deleteForm: async (id: string): Promise<void> => {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        const forms = JSON.parse(localStorage.getItem("dynamicForms") || "[]");
        const index = forms.findIndex((f: DynamicForm) => f.id === id);

        if (index === -1) {
          reject(new Error("Formulário não encontrado"));
          return;
        }

        forms.splice(index, 1);
        localStorage.setItem("dynamicForms", JSON.stringify(forms));

        // Also remove any integrations that use this form
        const integrations = JSON.parse(localStorage.getItem("processFormIntegration") || "[]");
        const updatedIntegrations = integrations.filter((i: ProcessFormIntegration) => i.formId !== id);
        localStorage.setItem("processFormIntegration", JSON.stringify(updatedIntegrations));

        resolve();
      }, 500);
    });
  },
};
