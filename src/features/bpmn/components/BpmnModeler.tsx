
import { useEffect, useRef, useState } from "react";
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
                  id="Definitions_1" 
                  targetNamespace="http://bpmn.io/schema/bpmn">
  <bpmn:process id="Process_1" isExecutable="false">
    <bpmn:startEvent id="StartEvent_1" />
  </bpmn:process>
  <bpmndi:BPMNDiagram id="BPMNDiagram_1">
    <bpmndi:BPMNPlane id="BPMNPlane_1" bpmnElement="Process_1">
      <bpmndi:BPMNShape id="_BPMNShape_StartEvent_2" bpmnElement="StartEvent_1">
        <dc:Bounds xmlns:dc="http://www.omg.org/spec/DD/20100524/DC" x="173" y="102" width="36" height="36" />
      </bpmndi:BPMNShape>
    </bpmndi:BPMNPlane>
  </bpmndi:BPMNDiagram>
</bpmn:definitions>`;

export const BpmnModeler: React.FC<BpmnModelerProps> = ({
  initialXml = DEFAULT_DIAGRAM_XML,
  onChange,
  readOnly = false,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const bpmnModelerRef = useRef<any>(null);
  const [error, setError] = useState<string | null>(null);
  
  useEffect(() => {
    if (!containerRef.current) return;
    
    // Create the BPMN modeler instance
    const modeler = new BpmnJS({
      container: containerRef.current,
      keyboard: { bindTo: document },
      propertiesPanel: {
        parent: "#properties-panel",
      },
    });
    
    // Make editor read-only if specified
    if (readOnly) {
      modeler.get("editorActions").register({
        toggleMode: () => {
          modeler.get("canvas").setDefaultLayer("readonly");
          modeler.get("contextPad").close();
          modeler.get("palette").close();
        },
      });
    }
    
    bpmnModelerRef.current = modeler;
    
    // Import the initial XML
    modeler.importXML(initialXml).then(() => {
      if (readOnly) {
        modeler.get("editorActions").trigger("toggleMode");
        modeler.get("canvas").zoom("fit-viewport");
      }
    }).catch((err: Error) => {
      console.error("Error importing BPMN XML", err);
      setError("Failed to load BPMN diagram");
    });
    
    // Setup event listeners for XML changes
    if (onChange) {
      const eventBus = modeler.get("eventBus");
      
      // Listen for change events in the diagram
      const onChanged = () => {
        modeler.saveXML({ format: true }).then(({ xml }: { xml: string }) => {
          onChange(xml);
        });
      };
      
      eventBus.on("commandStack.changed", onChanged);
    }
    
    return () => {
      if (bpmnModelerRef.current) {
        bpmnModelerRef.current.destroy();
      }
    };
  }, [initialXml, onChange, readOnly]);
  
  return (
    <div className="relative h-full">
      {error && (
        <div className="absolute inset-0 flex items-center justify-center bg-background/80">
          <div className="text-center text-destructive">
            <p className="mb-2 text-lg font-bold">Error</p>
            <p>{error}</p>
          </div>
        </div>
      )}
      <div ref={containerRef} className="bpmn-container h-full" />
    </div>
  );
};
