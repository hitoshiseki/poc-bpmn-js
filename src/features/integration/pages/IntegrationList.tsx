import { Link, useNavigate } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { integrationService } from "../api/integrationService";
import { processService } from "@/features/bpmn/api/processService";
import { formService } from "@/features/forms/api/formService";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { PlusCircle, Edit2, Trash2, Link2 } from "lucide-react";
import { toast } from "sonner";
import { format } from "date-fns";
import { IntegrationEmptyState } from "../components/IntegrationEmptyState";
import { IntegrationListSkeleton } from "../components/IntegrationListSkeleton";

const IntegrationList = () => {
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  const { data: integrations = [], isLoading: isLoadingIntegrations } = useQuery({
    queryKey: ["integrations"],
    queryFn: () => integrationService.getAllIntegrations(),
  });

  const { data: processes = [], isLoading: isLoadingProcesses } = useQuery({
    queryKey: ["processes"],
    queryFn: () => processService.getAllProcesses(),
  });

  const { data: forms = [], isLoading: isLoadingForms } = useQuery({
    queryKey: ["forms"],
    queryFn: () => formService.getAllForms(),
  });

  const deleteIntegrationMutation = useMutation({
    mutationFn: (id: string) => integrationService.deleteIntegration(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["integrations"] });
      toast.success("Integração excluída com sucesso");
    },
    onError: (error) => {
      toast.error("Falha ao excluir a integração");
      console.error(error);
    },
  });

  const handleDelete = (id: string) => {
    deleteIntegrationMutation.mutate(id);
  };

  const isLoading = isLoadingIntegrations || isLoadingProcesses || isLoadingForms;

  // Map integrations with process and form data
  const integrationsWithData = integrations.map(integration => {
    const process = processes.find(p => p.id === integration.processId);
    const form = forms.find(f => f.id === integration.formId);

    return {
      ...integration,
      process,
      form
    };
  });

  if (isLoading) {
    return <IntegrationListSkeleton />;
  }

  if (integrations.length === 0) {
    return <IntegrationEmptyState />;
  }

  return (
    <div className="space-y-6 py-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-3xl font-bold">Integrações de Processo-Formulário</h2>
          <p className="text-muted-foreground">
            Conecte seus processos BPMN com formulários dinâmicos
          </p>
        </div>
        <Button asChild className="mt-4 sm:mt-0">
          <Link to="/integration/new">
            <PlusCircle className="mr-2 h-4 w-4" />
            Nova Integração
          </Link>
        </Button>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {integrationsWithData.map((integration) => (
          <Card key={integration.id}>
            <CardHeader>
              <CardTitle>
                <div className="flex items-center">
                  <Link2 className="mr-2 h-4 w-4" />
                  Integração Processo-Formulário
                </div>
              </CardTitle>
              <CardDescription>
                Criado em {format(new Date(integration.createdAt), "PPP")}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h3 className="text-sm font-medium text-muted-foreground">Processo</h3>
                <p className="font-medium">{integration.process?.name || "Processo Desconhecido"}</p>
              </div>
              <div>
                <h3 className="text-sm font-medium text-muted-foreground">Formulário</h3>
                <p className="font-medium">{integration.form?.name || "Formulário Desconhecido"}</p>
              </div>
            </CardContent>
            <CardFooter className="flex justify-between">
              <Button asChild variant="outline" size="sm">
                <span onClick={() => navigate(`/integration/${integration.id}`)}>
                  <Edit2 className="mr-2 h-4 w-4" />
                  Editar
                </span>
              </Button>

              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button variant="destructive" size="sm">
                    <Trash2 className="mr-2 h-4 w-4" />
                    Excluir
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Confirmar exclusão</AlertDialogTitle>
                    <AlertDialogDescription>
                      Tem certeza que deseja excluir esta integração? Esta ação não pode ser desfeita.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancelar</AlertDialogCancel>
                    <AlertDialogAction onClick={() => handleDelete(integration.id)}>
                      Excluir
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </CardFooter>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default IntegrationList;
