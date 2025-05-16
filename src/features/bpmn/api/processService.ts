import { BpmnProcess, ProcessFormIntegration } from "@/lib/types";
import { v4 as uuidv4 } from "uuid";

// Default BPMN XML with a user task for form filling
const DEFAULT_PROCESS_XML = `<?xml version="1.0" encoding="UTF-8"?>
<bpmn:definitions xmlns:bpmn="http://www.omg.org/spec/BPMN/20100524/MODEL" xmlns:bpmndi="http://www.omg.org/spec/BPMN/20100524/DI" xmlns:dc="http://www.omg.org/spec/DD/20100524/DC" xmlns:di="http://www.omg.org/spec/DD/20100524/DI" xmlns:modeler="http://camunda.org/schema/modeler/1.0" id="Definitions_1v44tjo" targetNamespace="http://bpmn.io/schema/bpmn" exporter="Camunda Modeler" exporterVersion="5.15.2" modeler:executionPlatform="Camunda Platform" modeler:executionPlatformVersion="7.19.0">
  <bpmn:process id="Process_1i1h5q0" isExecutable="true">
    <bpmn:startEvent id="StartEvent_1" name="Iniciar Processo">
      <bpmn:outgoing>Flow_12y57c3</bpmn:outgoing>
    </bpmn:startEvent>
    <bpmn:sequenceFlow id="Flow_12y57c3" sourceRef="StartEvent_1" targetRef="Activity_FillForm" />
    <bpmn:userTask id="Activity_FillForm" name="Preencher Formulário">
      <bpmn:incoming>Flow_12y57c3</bpmn:incoming>
      <bpmn:outgoing>Flow_0nrwdyi</bpmn:outgoing>
    </bpmn:userTask>
    <bpmn:sequenceFlow id="Flow_0nrwdyi" sourceRef="Activity_FillForm" targetRef="Activity_0qdh4tw" />
    <bpmn:userTask id="Activity_0qdh4tw" name="Revisar Dados">
      <bpmn:incoming>Flow_0nrwdyi</bpmn:incoming>
      <bpmn:outgoing>Flow_1nh6w70</bpmn:outgoing>
    </bpmn:userTask>
    <bpmn:sequenceFlow id="Flow_1nh6w70" sourceRef="Activity_0qdh4tw" targetRef="Activity_1fqvt4w" />
    <bpmn:serviceTask id="Activity_1fqvt4w" name="Processar Dados">
      <bpmn:incoming>Flow_1nh6w70</bpmn:incoming>
      <bpmn:outgoing>Flow_0xlb842</bpmn:outgoing>
    </bpmn:serviceTask>
    <bpmn:endEvent id="Event_10wphb7" name="Finalizar Processo">
      <bpmn:incoming>Flow_0xlb842</bpmn:incoming>
    </bpmn:endEvent>
    <bpmn:sequenceFlow id="Flow_0xlb842" sourceRef="Activity_1fqvt4w" targetRef="Event_10wphb7" />
  </bpmn:process>
  <bpmndi:BPMNDiagram id="BPMNDiagram_1">
    <bpmndi:BPMNPlane id="BPMNPlane_1" bpmnElement="Process_1i1h5q0">
      <bpmndi:BPMNShape id="_BPMNShape_StartEvent_2" bpmnElement="StartEvent_1">
        <dc:Bounds x="179" y="159" width="36" height="36" />
        <bpmndi:BPMNLabel>
          <dc:Bounds x="155" y="202" width="85" height="14" />
        </bpmndi:BPMNLabel>
      </bpmndi:BPMNShape>
      <bpmndi:BPMNShape id="Activity_0wl3v1m_di" bpmnElement="Activity_FillForm">
        <dc:Bounds x="270" y="137" width="100" height="80" />
        <bpmndi:BPMNLabel />
      </bpmndi:BPMNShape>
      <bpmndi:BPMNShape id="Activity_11b9fpi_di" bpmnElement="Activity_0qdh4tw">
        <dc:Bounds x="430" y="137" width="100" height="80" />
        <bpmndi:BPMNLabel />
      </bpmndi:BPMNShape>
      <bpmndi:BPMNShape id="Activity_0g2eqqu_di" bpmnElement="Activity_1fqvt4w">
        <dc:Bounds x="590" y="137" width="100" height="80" />
        <bpmndi:BPMNLabel />
      </bpmndi:BPMNShape>
      <bpmndi:BPMNShape id="Event_10wphb7_di" bpmnElement="Event_10wphb7">
        <dc:Bounds x="752" y="159" width="36" height="36" />
        <bpmndi:BPMNLabel>
          <dc:Bounds x="726" y="202" width="89" height="14" />
        </bpmndi:BPMNLabel>
      </bpmndi:BPMNShape>
      <bpmndi:BPMNEdge id="Flow_12y57c3_di" bpmnElement="Flow_12y57c3">
        <di:waypoint x="215" y="177" />
        <di:waypoint x="270" y="177" />
      </bpmndi:BPMNEdge>
      <bpmndi:BPMNEdge id="Flow_0nrwdyi_di" bpmnElement="Flow_0nrwdyi">
        <di:waypoint x="370" y="177" />
        <di:waypoint x="430" y="177" />
      </bpmndi:BPMNEdge>
      <bpmndi:BPMNEdge id="Flow_1nh6w70_di" bpmnElement="Flow_1nh6w70">
        <di:waypoint x="530" y="177" />
        <di:waypoint x="590" y="177" />
      </bpmndi:BPMNEdge>
      <bpmndi:BPMNEdge id="Flow_0xlb842_di" bpmnElement="Flow_0xlb842">
        <di:waypoint x="690" y="177" />
        <di:waypoint x="752" y="177" />
      </bpmndi:BPMNEdge>
    </bpmndi:BPMNPlane>
  </bpmndi:BPMNDiagram>
</bpmn:definitions>`;

// Mock storage for processes
const processesData: BpmnProcess[] = [];

// Initialize with a sample process if empty
const initializeDefaultProcess = () => {
  if (processesData.length === 0) {
    const now = new Date().toISOString();
    const defaultProcess: BpmnProcess = {
      id: '518c0c7f-6f32-470c-bf71-876031408258',
      name: "Processo de Solicitação",
      description: "Processo de solicitação com preenchimento de formulário",
      xml: DEFAULT_PROCESS_XML,
      createdAt: now,
      updatedAt: now
    };
    processesData.push(defaultProcess);
  }
};

export const processService = {
  getAllProcesses: async (): Promise<BpmnProcess[]> => {
    initializeDefaultProcess();
    return [...processesData];
  },

  getProcessById: async (id: string): Promise<BpmnProcess | null> => {
    initializeDefaultProcess();
    console.log(id)
    const process = processesData.find((p) => p.id === id);
    return process || null;
  },

  createProcess: async (process: Omit<BpmnProcess, "id" | "createdAt" | "updatedAt">): Promise<BpmnProcess> => {
    const now = new Date().toISOString();
    const newProcess: BpmnProcess = {
      id: uuidv4(),
      ...process,
      createdAt: now,
      updatedAt: now,
    };
    processesData.push(newProcess);
    return { ...newProcess };
  },

  updateProcess: async (id: string, process: Partial<BpmnProcess>): Promise<BpmnProcess> => {
    const processIndex = processesData.findIndex((p) => p.id === id);
    if (processIndex === -1) {
      throw new Error("Process not found");
    }

    const updatedProcess = {
      ...processesData[processIndex],
      ...process,
      updatedAt: new Date().toISOString(),
    };

    processesData[processIndex] = updatedProcess;
    return { ...updatedProcess };
  },

  deleteProcess: async (id: string): Promise<void> => {
    const processIndex = processesData.findIndex((p) => p.id === id);
    if (processIndex === -1) {
      throw new Error("Process not found");
    }
    processesData.splice(processIndex, 1);

    // Also remove any integrations that use this process
    const integrations = JSON.parse(localStorage.getItem("processFormIntegration") || "[]");
    const updatedIntegrations = integrations.filter((i: ProcessFormIntegration) => i.processId !== id);
    localStorage.setItem("processFormIntegration", JSON.stringify(updatedIntegrations));
  },
};
