import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { processService } from "../api/processService";
import { BpmnModeler } from "../components/BpmnModeler";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from "@/components/ui/card";
import { Save, ArrowLeft, Edit2, Link as LinkIcon } from "lucide-react";
import { toast } from "sonner";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { BpmnProcess, ProcessTask } from "@/lib/types";
import { useIsMobile } from "@/hooks/use-mobile";

const processFormSchema = z.object({
  name: z.string().min(2, { message: "O nome deve ter pelo menos 2 caracteres" }),
  description: z.string().min(5, { message: "A descrição deve ter pelo menos 5 caracteres" }),
});

type ProcessFormValues = z.infer<typeof processFormSchema>;

interface ProcessEditorProps {
  mode?: "edit" | "view";
}

const ProcessEditor = ({ mode = "edit" }: ProcessEditorProps) => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const queryClient = useQueryClient();
  const isEditMode = mode === "edit";
  const isViewMode = mode === "view";
  const isMobile = useIsMobile();

  const [bpmnXml, setBpmnXml] = useState<string>("");
  const [tasks, setTasks] = useState<ProcessTask[]>([]);

  const form = useForm<ProcessFormValues>({
    resolver: zodResolver(processFormSchema),
    defaultValues: {
      name: "",
      description: "",
    },
  });

  // Fetch process data
  const { data: process, isLoading: isProcessLoading } = useQuery({
    queryKey: ["process", id],
    queryFn: () => processService.getProcessById(id!),
    enabled: Boolean(id),
  });

  // Set form values when process data is loaded
  useEffect(() => {
    if (process) {
      form.reset({
        name: process.name,
        description: process.description,
      });

      // Set the BPMN XML with a slight delay to ensure component is ready
      setTimeout(() => {
        setBpmnXml(process.xml || "");
      }, 100);
    }
  }, [process, form]);

  // Add an effect to log when bpmnXml changes to help with debugging
  useEffect(() => {
    if (bpmnXml) {
      // XML is available and ready for rendering
    }
  }, [bpmnXml]);

  // Create process mutation
  const createProcessMutation = useMutation({
    mutationFn: (data: Omit<BpmnProcess, "id" | "createdAt" | "updatedAt">) =>
      processService.createProcess(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["processes"] });
      toast.success("Processo criado com sucesso");
      navigate("/processes");
    },
    onError: () => {
      toast.error("Falha ao criar processo");
    },
  });

  // Update process mutation
  const updateProcessMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<BpmnProcess> }) =>
      processService.updateProcess(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["processes"] });
      queryClient.invalidateQueries({ queryKey: ["process", id] });
      toast.success("Processo atualizado com sucesso");
      navigate("/processes");
    },
    onError: () => {
      toast.error("Falha ao atualizar processo");
    },
  });

  const onBpmnChange = (xml: string) => {
    setBpmnXml(xml);
  };

  const onSubmit = (values: ProcessFormValues) => {
    if (!bpmnXml) {
      toast.error("O diagrama BPMN é obrigatório");
      return;
    }

    // Ensure we're passing all required fields with proper types
    const data = {
      name: values.name,
      description: values.description,
      xml: bpmnXml,
    };

    if (id) {
      updateProcessMutation.mutate({ id, data });
    } else {
      createProcessMutation.mutate(data as Omit<BpmnProcess, "id" | "createdAt" | "updatedAt">);
    }
  };

  if (isProcessLoading && id) {
    return (
      <div className="flex h-[calc(100vh-120px)] items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
      </div>
    );
  }

  if (id && !process) {
    return (
      <div className="flex h-[calc(100vh-120px)] items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold">Processo não encontrado</h2>
          <p className="text-muted-foreground">O processo solicitado não existe</p>
          <Button onClick={() => navigate("/processes")} className="mt-4">
            Voltar para processos
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 py-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between">
        <div className="flex items-center">
          <Button variant="outline" size="icon" onClick={() => navigate("/processes")}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <h2 className="ml-4 text-3xl font-bold">
            {isViewMode ? process?.name : (id ? "Editar Processo" : "Novo Processo")}
          </h2>
        </div>
        {isViewMode && id && (
          <div className="mt-4 flex space-x-2 md:mt-0">
            <Button asChild variant="outline">
              <span onClick={() => navigate(`/processes/${id}/edit`)}>
                <Edit2 className="mr-2 h-4 w-4" />
                Editar Processo
              </span>
            </Button>
            <Button asChild>
              <span onClick={() => navigate(`/integration/new?processId=${id}`)}>
                <LinkIcon className="mr-2 h-4 w-4" />
                Nova Integração
              </span>
            </Button>
          </div>
        )}
      </div>

      <div className="grid gap-6">
        {/* Diagrama BPMN */}
        <Card className={`${isViewMode ? 'h-[calc(100)]' : 'h-[calc(100vh)]'} ${isMobile || !isMobile && window.innerWidth < 1280 ? 'w-full' : ''}`}>
          <CardHeader>
            <CardTitle>Diagrama do Processo</CardTitle>
            <CardDescription>
              {isViewMode
                ? "Visualização do diagrama BPMN (somente leitura)"
                : "Desenhe seu diagrama BPMN usando o modelador abaixo"}
            </CardDescription>
          </CardHeader>
          <CardContent className="h-[calc(100%-130px)]">
            {(isProcessLoading && id) ? (
              <div className="flex h-full w-full items-center justify-center">
                <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
              </div>
            ) : (
              <BpmnModeler
                initialXml={bpmnXml}
                onChange={isEditMode ? onBpmnChange : undefined}
                readOnly={isViewMode}
                key={bpmnXml ? "loaded" : "empty"} // Force re-render when XML changes
              />
            )}
          </CardContent>
        </Card>

        {/* Formulário - usado em ambos os modos, apenas desabilitado no modo visualização */}
        <Card className={`${isMobile || !isMobile && window.innerWidth < 1280 ? 'w-full' : ''}`}>
          <CardHeader>
            <CardTitle>Detalhes do Processo</CardTitle>
            <CardDescription>
              {isViewMode
                ? "Informações básicas do processo"
                : "Insira as informações básicas sobre seu processo BPMN"}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Nome</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="Digite o nome do processo"
                          disabled={isViewMode}
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="description"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Descrição</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Digite a descrição do processo"
                          rows={4}
                          disabled={isViewMode}
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {isEditMode && (
                  <Button
                    type="submit"
                    className="w-full"
                    disabled={isProcessLoading || createProcessMutation.isPending || updateProcessMutation.isPending}
                  >
                    <Save className="mr-2 h-4 w-4" />
                    {id ? "Atualizar Processo" : "Salvar Processo"}
                  </Button>
                )}

                {isViewMode && id && (
                  <Button
                    type="button"
                    className="w-full"
                    variant="outline"
                    onClick={() => navigate(`/processes/${id}/edit`)}
                  >
                    <Edit2 className="mr-2 h-4 w-4" />
                    Editar Processo
                  </Button>
                )}
              </form>
            </Form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default ProcessEditor;
