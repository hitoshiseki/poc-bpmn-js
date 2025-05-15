
import { useEffect, useRef } from "react";
import { FormEditor } from "@bpmn-io/form-js-editor";
import "@bpmn-io/form-js-editor/dist/assets/form-js-editor.css";

const DEFAULT_FORM_SCHEMA = {
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
  ]
};

interface FormBuilderProps {
  initialSchema?: any;
  onChange?: (schema: any) => void;
}

export function FormBuilder({ initialSchema = DEFAULT_FORM_SCHEMA, onChange }: FormBuilderProps) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const formEditorRef = useRef<FormEditor | null>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    const formEditor = new FormEditor({
      container: containerRef.current
    });

    formEditorRef.current = formEditor;

    formEditor.importSchema(initialSchema).then(() => {
      console.log('Form imported successfully');
    }).catch(err => {
      console.error('Error importing form:', err);
    });

    if (onChange) {
      formEditor.on('changed', () => {
        const schema = formEditor.getSchema();
        onChange(schema);
      });
    }

    return () => {
      formEditor.destroy();
    };
  }, []);

  return (
    <div className="h-full">
      <div ref={containerRef} className="h-full" />
    </div>
  );
}
