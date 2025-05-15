
import { useEffect, useRef, useState } from "react";
import { FormEditor } from "@bpmn-io/form-js-editor";
import "@bpmn-io/form-js-editor/dist/assets/form-js-editor.css";
import { Schema } from "../../../lib/types";

const DEFAULT_FORM_SCHEMA = {
  type: "default",
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
};

interface FormBuilderProps {
  initialSchema?: Schema;
  onChange?: (schema: Schema) => void;
}

export function FormBuilder ({ initialSchema, onChange }: FormBuilderProps) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const formEditorRef = useRef<FormEditor | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    // Make sure we have a valid schema
    const schemaToUse = validateAndFixSchema(initialSchema);

    const formEditor = new FormEditor({
      container: containerRef.current
    });

    formEditorRef.current = formEditor;

    formEditor.importSchema(schemaToUse)
      .then(() => {
        console.log('Form imported successfully');
        setError(null);
      })
      .catch(err => {
        console.error('Error importing form:', err);
        setError(`Error importing form: ${err.message}`);

        // Try again with the default schema
        if (initialSchema !== DEFAULT_FORM_SCHEMA) {
          console.log('Trying to import default schema instead');
          formEditor.importSchema(DEFAULT_FORM_SCHEMA)
            .then(() => {
              console.log('Default form imported successfully');
              if (onChange) {
                onChange(DEFAULT_FORM_SCHEMA);
              }
              setError(null);
            })
            .catch(fallbackErr => {
              console.error('Error importing default form:', fallbackErr);
              setError(`Error importing form: ${fallbackErr.message}`);
            });
        }
      });

    if (onChange) {
      formEditor.on('changed', () => {
        try {
          const schema = formEditor.getSchema();
          onChange(schema);
        } catch (err) {
          console.error('Error getting schema:', err);
        }
      });
    }

    return () => {
      formEditor.destroy();
    };
  }, [initialSchema, onChange]);

  // Helper function to validate and fix schema if needed
  const validateAndFixSchema = (schema: Schema): unknown => {
    if (!schema) {
      return DEFAULT_FORM_SCHEMA;
    }

    // Ensure schema has the required properties
    const validSchema = { ...schema };

    // Make sure it has a type
    if (!validSchema.type) {
      validSchema.type = "default";
    }

    // Make sure it has the components array
    if (!validSchema.components || !Array.isArray(validSchema.components)) {
      validSchema.components = DEFAULT_FORM_SCHEMA.components;
    }

    // Make sure it has a schema version
    if (!validSchema.schemaVersion) {
      validSchema.schemaVersion = 5;
    }

    return validSchema;
  };

  return (
    <div className="h-full">
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}
      <div ref={containerRef} className="h-full" />
    </div>
  );
}
