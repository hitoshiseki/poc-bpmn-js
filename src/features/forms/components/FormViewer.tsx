
import { useEffect, useRef } from "react";
import { Form } from "@bpmn-io/form-js-viewer";
import "@bpmn-io/form-js-viewer/dist/assets/form-js.css";

interface FormViewerProps {
  schema: any;
  onSubmit?: (data: any) => void;
}

export function FormViewer({ schema, onSubmit }: FormViewerProps) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const formRef = useRef<Form | null>(null);

  useEffect(() => {
    if (!containerRef.current || !schema) return;

    const form = new Form({
      container: containerRef.current,
    });

    formRef.current = form;

    form
      .importSchema(schema)
      .then(() => {
        console.log("Form rendered successfully");
      })
      .catch((err) => {
        console.error("Error rendering form:", err);
      });

    if (onSubmit) {
      form.on("submit", (event: any) => {
        const { data } = event;
        onSubmit(data);
      });
    }

    return () => {
      form.destroy();
    };
  }, [schema, onSubmit]);

  return (
    <div ref={containerRef} className="fjs-container" />
  );
}
