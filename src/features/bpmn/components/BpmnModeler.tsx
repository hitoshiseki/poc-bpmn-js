import { Ref, useEffect, useRef, useState } from "react";
import BpmnJS from "bpmn-js/dist/bpmn-modeler.production.min.js";
import "bpmn-js/dist/assets/diagram-js.css";
import "bpmn-js/dist/assets/bpmn-font/css/bpmn-embedded.css";

interface BpmnModelerProps {
  initialXml?: string;
  onChange?: (xml: string) => void;
  readOnly?: boolean;
}

const DEFAULT_DIAGRAM_XML = `<?xml version="1.0" encoding="UTF-8"?>
<bpmn:definitions xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" 
                  xmlns:bpmn="http://www.omg.org/spec/BPMN/20100524/MODEL" 
                  xmlns:bpmndi="http://www.omg.org/spec/BPMN/20100524/DI" 
                  xmlns:dc="http://www.omg.org/spec/DD/20100524/DC" 
                  xmlns:di="http://www.omg.org/spec/DD/20100524/DI" 
                  id="Definitions_1" 
                  targetNamespace="http://bpmn.io/schema/bpmn">
  <bpmn:process id="Process_1" isExecutable="false">
    <bpmn:startEvent id="StartEvent_1" />
  </bpmn:process>
  <bpmndi:BPMNDiagram id="BPMNDiagram_1">
    <bpmndi:BPMNPlane id="BPMNPlane_1" bpmnElement="Process_1">
      <bpmndi:BPMNShape id="_BPMNShape_StartEvent_2" bpmnElement="StartEvent_1">
        <dc:Bounds x="173" y="102" width="36" height="36" />
      </bpmndi:BPMNShape>
    </bpmndi:BPMNPlane>
  </bpmndi:BPMNDiagram>
</bpmn:definitions>`;

// Helper function to validate XML
const isValidBpmnXml = (xml: string): boolean => {
  if (!xml || typeof xml !== 'string') return false;
  // Basic check: must include required BPMN elements
  return (
    xml.includes('<?xml') &&
    xml.includes('<bpmn:definitions') &&
    xml.includes('</bpmn:definitions>')
  );
};

export const BpmnModeler: React.FC<BpmnModelerProps> = ({
  initialXml,
  onChange,
  readOnly = false,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const bpmnModelerRef = useRef(null);
  const [error, setError] = useState<string | null>(null);

  // Use effect for initializing the BPMN modeler
  useEffect(() => {
    if (!containerRef.current) return;

    // Clean up any previous instance
    if (bpmnModelerRef.current) {
      bpmnModelerRef.current.destroy();
    }

    // Create the BPMN modeler instance
    const modeler = new BpmnJS({
      container: containerRef.current,
      keyboard: { bindTo: document },
      propertiesPanel: {
        parent: "#properties-panel",
      },
    });

    bpmnModelerRef.current = modeler;

    // Reset error state on new initialization
    setError(null);

    return () => {
      if (bpmnModelerRef.current) {
        bpmnModelerRef.current.destroy();
        bpmnModelerRef.current = null;
      }
    };
  }, [readOnly]);

  // Separate effect for handling XML import
  useEffect(() => {
    if (!bpmnModelerRef.current) return;

    const modeler = bpmnModelerRef.current;
    const xmlToUse = initialXml && isValidBpmnXml(initialXml) ? initialXml : DEFAULT_DIAGRAM_XML;

    // Import the XML diagram
    modeler.importXML(xmlToUse)
      .then(() => {
        setError(null);
        if (readOnly) {
          try {
            modeler.get("editorActions").trigger("toggleMode");
          } catch (err) {
            console.error("Error triggering read-only mode:", err);
          }
        }
        try {
          modeler.get("canvas").zoom("fit-viewport");
        } catch (err) {
          console.error("Error zooming to fit viewport:", err);
        }

        // If it's a new diagram and onChange exists, notify parent of default XML
        if (!initialXml && onChange) {
          onChange(DEFAULT_DIAGRAM_XML);
        }
      })
      .catch((err: Error) => {
        console.error("Erro ao importar BPMN XML", err);
        setError("Falha ao carregar o diagrama BPMN. Utilizando diagrama padrão.");

        // Fallback to default diagram on error
        modeler.importXML(DEFAULT_DIAGRAM_XML)
          .then(() => {
            if (readOnly) {
              try {
                modeler.get("editorActions").trigger("toggleMode");
              } catch (err) {
                console.error("Error triggering read-only mode:", err);
              }
            }
            try {
              modeler.get("canvas").zoom("fit-viewport");
            } catch (err) {
              console.error("Error zooming to fit viewport:", err);
            }

            // Notify parent of the default XML being used
            if (onChange) {
              onChange(DEFAULT_DIAGRAM_XML);
            }
          })
          .catch(() => {
            setError("Erro crítico ao carregar o diagrama. Por favor, atualize a página.");
          });
      });
  }, [initialXml, readOnly, onChange]);

  // Setup event listeners for XML changes
  useEffect(() => {
    if (!bpmnModelerRef.current || !onChange) return;

    const modeler = bpmnModelerRef.current;
    let eventBus;

    try {
      eventBus = modeler.get("eventBus");
    } catch (err) {
      console.error("Error getting eventBus:", err);
      return;
    }

    if (!eventBus) return;

    // Listen for change events in the diagram
    const onChanged = () => {
      try {
        modeler.saveXML({ format: true })
          .then(({ xml }: { xml: string }) => {
            if (xml && onChange) {
              onChange(xml);
            }
          })
          .catch((err: Error) => {
            console.error("Erro ao salvar BPMN XML", err);
          });
      } catch (err) {
        console.error("Error in change event handler:", err);
      }
    };

    try {
      eventBus.on("commandStack.changed", onChanged);
    } catch (err) {
      console.error("Error registering event listener:", err);
    }

    return () => {
      try {
        if (eventBus) {
          eventBus.off("commandStack.changed", onChanged);
        }
      } catch (err) {
        console.error("Error removing event listener:", err);
      }
    };
  }, [onChange]);

  return (
    <div className="relative h-full">
      {error && (
        <div className="absolute inset-0 flex items-center justify-center bg-background/80 z-10">
          <div className="text-center text-destructive p-4 bg-destructive/10 rounded-md border border-destructive">
            <p className="mb-2 text-lg font-bold">Erro</p>
            <p>{error}</p>
          </div>
        </div>
      )}
      <div ref={containerRef} className="bpmn-container h-full" />
    </div>
  );
};
