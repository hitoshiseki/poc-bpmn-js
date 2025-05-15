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
  CardFooter,
  CardHeader,
  CardTitle
} from "@/components/ui/card";
import { Save, ArrowLeft } from "lucide-react";
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
import { BpmnProcess } from "@/lib/types";
import { useIsMobile } from "@/hooks/use-mobile";

const processFormSchema = z.object({
  name: z.string().min(2, { message: "O nome deve ter pelo menos 2 caracteres" }),
  description: z.string().min(5, { message: "A descrição deve ter pelo menos 5 caracteres" }),
});

type ProcessFormValues = z.infer<typeof processFormSchema>;

const ProcessEditor = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const queryClient = useQueryClient();
  const isEditMode = Boolean(id);
  const isMobile = useIsMobile();

  const [bpmnXml, setBpmnXml] = useState<string>("");

  const form = useForm<ProcessFormValues>({
    resolver: zodResolver(processFormSchema),
    defaultValues: {
      name: "",
      description: "",
    },
  });

  // Fetch process data if in edit mode
  const { data: process, isLoading } = useQuery({
    queryKey: ["process", id],
    queryFn: () => processService.getProcessById(id!),
    enabled: isEditMode,
  });

  // Set form values when process data is loaded
  useEffect(() => {
    if (process) {
      form.reset({
        name: process.name,
        description: process.description,
      });
      setBpmnXml(process.xml);
    }
  }, [process, form]);

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

    if (isEditMode && id) {
      updateProcessMutation.mutate({ id, data });
    } else {
      createProcessMutation.mutate(data as Omit<BpmnProcess, "id" | "createdAt" | "updatedAt">);
    }
  };

  return (
    <div className="space-y-6 py-6">
      <div className="flex items-center">
        <Button variant="outline" size="icon" onClick={() => navigate("/processes")}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <h2 className="ml-4 text-3xl font-bold">
          {isEditMode ? "Editar Processo" : "Novo Processo"}
        </h2>
      </div>

      <div className="grid gap-6">
        <Card className={`h-[calc(100vh-250px)] ${isMobile || !isMobile && window.innerWidth < 1280 ? 'w-full' : ''}`}>
          <CardHeader>
            <CardTitle>Diagrama do Processo</CardTitle>
            <CardDescription>
              Desenhe seu diagrama BPMN usando o modelador abaixo
            </CardDescription>
          </CardHeader>
          <CardContent className="h-[calc(100%-130px)]">
            {(isLoading && isEditMode) ? (
              <div className="flex h-full w-full items-center justify-center">
                <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
              </div>
            ) : (
              <BpmnModeler
                initialXml={bpmnXml}
                onChange={onBpmnChange}
              />
            )}
          </CardContent>
        </Card>
        <Card className={`${isMobile || !isMobile && window.innerWidth < 1280 ? 'w-full' : ''}`}>
          <CardHeader>
            <CardTitle>Detalhes do Processo</CardTitle>
            <CardDescription>
              Insira as informações básicas sobre seu processo BPMN
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
                        <Input placeholder="Digite o nome do processo" {...field} />
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
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <Button
                  type="submit"
                  className="w-full"
                  disabled={isLoading || createProcessMutation.isPending || updateProcessMutation.isPending}
                >
                  <Save className="mr-2 h-4 w-4" />
                  {isEditMode ? "Atualizar Processo" : "Salvar Processo"}
                </Button>
              </form>
            </Form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default ProcessEditor;
