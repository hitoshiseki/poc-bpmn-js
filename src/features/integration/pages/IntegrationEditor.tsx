import { useEffect, useState } from "react";
import { useNavigate, useParams, useLocation } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { integrationService } from "../api/integrationService";
import { processService } from "@/features/bpmn/api/processService";
import { formService } from "@/features/forms/api/formService";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ArrowLeft, Link2, Save } from "lucide-react";
import { toast } from "sonner";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { BpmnElement, ElementRegistry, ProcessFormIntegration } from "@/lib/types";
import * as BpmnJs from "bpmn-js/dist/bpmn-navigated-viewer.production.min.js";

const integrationSchema = z.object({
  processId: z.string().min(1, "Processo é obrigatório"),
  formId: z.string().min(1, "Formulário é obrigatório"),
  taskId: z.string().min(1, "Tarefa do processo é obrigatória"),
});

type IntegrationFormValues = z.infer<typeof integrationSchema>;

interface ProcessTask {
  id: string;
  name: string;
}

const IntegrationEditor = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const preselectedProcessId = queryParams.get("processId");

  const queryClient = useQueryClient();
  const isEditMode = Boolean(id);
  const [processTasks, setProcessTasks] = useState<ProcessTask[]>([]);

  // Form setup with validation
  const form = useForm<IntegrationFormValues>({
    resolver: zodResolver(integrationSchema),
    defaultValues: {
      processId: preselectedProcessId || "",
      formId: "",
      taskId: "",
    },
  });

  // Fetch data
  const { data: integration, isLoading: isLoadingIntegration } = useQuery({
    queryKey: ["integration", id],
    queryFn: () => integrationService.getIntegrationById(id!).catch((error) => console.error(error)),
    enabled: isEditMode,
  });

  const { data: processes = [], isLoading: isLoadingProcesses } = useQuery({
    queryKey: ["processes"],
    queryFn: () => processService.getAllProcesses(),
  });

  const { data: forms = [], isLoading: isLoadingForms } = useQuery({
    queryKey: ["forms"],
    queryFn: () => formService.getAllForms(),
  });

  const { data: selectedProcess, isLoading: isLoadingSelectedProcess } = useQuery({
    queryKey: ["process", form.watch("processId")],
    queryFn: () => processService.getProcessById(form.watch("processId")),
    enabled: Boolean(form.watch("processId")),
  });

  // Extract user tasks from BPMN XML
  useEffect(() => {
    if (selectedProcess?.xml) {
      let viewer = null;
      try {
        viewer = new BpmnJs.default();

        viewer.importXML(selectedProcess.xml).then(() => {
          try {
            const elementRegistry = viewer.get('elementRegistry') as ElementRegistry;

            // Find all user tasks in the process
            const userTasks = elementRegistry.filter((element: BpmnElement) => element.type === 'bpmn:UserTask' && !!element.businessObject);

            const tasks = userTasks.map((task: BpmnElement) => ({
              id: task.id,
              name: task.businessObject?.name || `Task ${task.id}`
            }));

            setProcessTasks(tasks);

            // If there are no tasks but form has a taskId, reset it
            if (tasks.length === 0 && form.getValues("taskId")) {
              form.setValue("taskId", "");
            }

            // If there's only one task and no taskId is selected, auto-select it
            if (tasks.length === 1 && !form.getValues("taskId")) {
              form.setValue("taskId", tasks[0].id);
            }
          } catch (error) {
            console.error("Error processing BPMN elements", error);
            setProcessTasks([]);
            form.setValue("taskId", "");
            toast.error("Erro ao processar elementos do diagrama BPMN");
          }
        }).catch((error: Error) => {
          console.error("Error importing BPMN XML", error);
          setProcessTasks([]);
          form.setValue("taskId", "");
          toast.error("Erro ao importar o XML do processo BPMN");
        });
      } catch (error) {
        console.error("Error initializing BPMN viewer", error);
        setProcessTasks([]);
        form.setValue("taskId", "");
        toast.error("Erro ao inicializar o visualizador BPMN");
      }

      return () => {
        if (viewer) {
          try {
            viewer.destroy();
          } catch (error) {
            console.error("Error destroying BPMN viewer", error);
          }
        }
      };
    } else {
      setProcessTasks([]);
      if (form.getValues("taskId")) {
        form.setValue("taskId", "");
      }
    }
  }, [selectedProcess, form]);

  // Set form values from integration if in edit mode
  useEffect(() => {
    if (integration) {
      form.reset({
        processId: integration.processId,
        formId: integration.formId,
        taskId: integration.taskId || "",
      });
    }
  }, [integration, form]);

  // Mutations for creating/updating integration
  const createIntegrationMutation = useMutation({
    mutationFn: (data: Omit<ProcessFormIntegration, "id" | "createdAt">) =>
      integrationService.createIntegration(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["integrations"] });
      toast.success("Integração criada com sucesso");
      navigate("/integration");
    },
    onError: () => {
      toast.error("Falha ao criar integração");
    },
  });

  const updateIntegrationMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: Omit<ProcessFormIntegration, "id" | "createdAt"> }) =>
      integrationService.updateIntegration(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["integrations"] });
      queryClient.invalidateQueries({ queryKey: ["integration", id] });
      toast.success("Integração atualizada com sucesso");
      navigate("/integration");
    },
    onError: (error) => {
      console.log(error);
      toast.error("Falha ao atualizar integração");
    },
  });

  const onSubmit = (values: IntegrationFormValues) => {
    const selectedTask = processTasks.find(task => task.id === values.taskId);

    if (!selectedTask) {
      toast.error("Selecione uma tarefa válida do processo");
      return;
    }

    // Convert the values to the correct type
    const integrationData: Omit<ProcessFormIntegration, "id" | "createdAt"> = {
      processId: values.processId,
      formId: values.formId,
      taskId: values.taskId,
      taskName: selectedTask.name
    };

    if (isEditMode && id) {
      updateIntegrationMutation.mutate({ id, data: integrationData });
    } else {
      createIntegrationMutation.mutate(integrationData);
    }
  };

  console.log(isLoadingIntegration, isLoadingProcesses, isLoadingForms, isLoadingSelectedProcess);

  const isLoadingScreen = isLoadingIntegration || isLoadingProcesses || isLoadingForms || isLoadingSelectedProcess;

  // Handle process change to reset task selection
  const handleProcessChange = (processId: string) => {
    form.setValue("processId", processId);
    form.setValue("taskId", "");
    setProcessTasks([]);
  };

  return (
    <div className="space-y-6 py-6">
      <div className="flex items-center">
        <Button variant="outline" size="icon" onClick={() => navigate("/integration")}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <h2 className="ml-4 text-3xl font-bold">
          {isEditMode ? "Editar Integração" : "Nova Integração"}
        </h2>
      </div>

      <Card className="max-w-2xl mx-auto">
        <CardHeader>
          <div className="flex items-center">
            <Link2 className="mr-2 h-5 w-5" />
            <CardTitle>Integração Processo-Formulário</CardTitle>
          </div>
          <CardDescription>
            Vincule uma tarefa específica do processo BPMN com um formulário dinâmico
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoadingScreen ? (
            <div className="py-8 flex justify-center">
              <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
            </div>
          ) : (
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <FormField
                  control={form.control}
                  name="processId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Processo BPMN</FormLabel>
                      <FormControl>
                        <Select
                          value={field.value}
                          onValueChange={handleProcessChange}
                          disabled={Boolean(preselectedProcessId) || processes.length === 0}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Selecione um processo" />
                          </SelectTrigger>
                          <SelectContent>
                            {processes.map((process) => (
                              <SelectItem key={process.id} value={process.id}>
                                {process.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </FormControl>
                      {processes.length === 0 && (
                        <div className="text-sm text-destructive">
                          Nenhum processo disponível. Por favor, crie um processo primeiro.
                        </div>
                      )}
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="taskId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Tarefa do Processo</FormLabel>
                      <FormControl>
                        <Select
                          value={field.value}
                          onValueChange={field.onChange}
                          disabled={processTasks.length === 0 || !form.watch("processId")}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Selecione uma tarefa" />
                          </SelectTrigger>
                          <SelectContent>
                            {processTasks.map((task) => (
                              <SelectItem key={task.id} value={task.id}>
                                {task.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </FormControl>
                      {form.watch("processId") && processTasks.length === 0 && (
                        <div className="text-sm text-destructive">
                          Este processo não contém tarefas de usuário. Adicione pelo menos uma tarefa de usuário ao processo.
                        </div>
                      )}
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="formId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Formulário Dinâmico</FormLabel>
                      <FormControl>
                        <Select
                          value={field.value}
                          onValueChange={field.onChange}
                          disabled={forms.length === 0}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Selecione um formulário" />
                          </SelectTrigger>
                          <SelectContent>
                            {forms.map((form) => (
                              <SelectItem key={form.id} value={form.id}>
                                {form.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </FormControl>
                      {forms.length === 0 && (
                        <div className="text-sm text-destructive">
                          Nenhum formulário disponível. Por favor, crie um formulário primeiro.
                        </div>
                      )}
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="flex justify-end">
                  <Button
                    type="submit"
                    disabled={
                      processes.length === 0 ||
                      forms.length === 0 ||
                      processTasks.length === 0 ||
                      createIntegrationMutation.isPending ||
                      updateIntegrationMutation.isPending
                    }
                  >
                    <Save className="mr-2 h-4 w-4" />
                    {isEditMode ? "Atualizar Integração" : "Salvar Integração"}
                  </Button>
                </div>
              </form>
            </Form>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default IntegrationEditor;
