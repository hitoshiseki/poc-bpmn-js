import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Workflow, FileText, Link as LinkIcon } from "lucide-react";
import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { processService } from "@/features/bpmn/api/processService";
import { formService } from "@/features/forms/api/formService";
import { integrationService } from "@/features/integration/api/integrationService";

const Dashboard = () => {
  const { data: processes = [], isLoading: isLoadingProcesses } = useQuery({
    queryKey: ["processes"],
    queryFn: () => processService.getAllProcesses(),
  });

  const { data: forms = [], isLoading: isLoadingForms } = useQuery({
    queryKey: ["forms"],
    queryFn: () => formService.getAllForms(),
  });

  const { data: integrations = [], isLoading: isLoadingIntegrations } = useQuery({
    queryKey: ["integrations"],
    queryFn: () => integrationService.getAllIntegrations(),
  });

  return (
    <div className="space-y-6 py-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between">
        <div>
          <h2 className="text-3xl font-bold">Painel</h2>
          <p className="text-muted-foreground">Bem-vindo ao POC de BPMN e Formulários Dinâmicos</p>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-2xl font-bold">Processos BPMN</CardTitle>
            <Workflow className="h-5 w-5 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">
              {isLoadingProcesses ? (
                <div className="h-8 w-16 animate-pulse rounded-md bg-muted"></div>
              ) : (
                processes.length
              )}
            </div>
            <p className="text-xs text-muted-foreground">
              Total de processos modelados
            </p>
            <div className="mt-4">
              <Button asChild variant="outline" className="w-full">
                <Link to="/processes">Ver Todos os Processos</Link>
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-2xl font-bold">Formulários Dinâmicos</CardTitle>
            <FileText className="h-5 w-5 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">
              {isLoadingForms ? (
                <div className="h-8 w-16 animate-pulse rounded-md bg-muted"></div>
              ) : (
                forms.length
              )}
            </div>
            <p className="text-xs text-muted-foreground">
              Total de formulários criados
            </p>
            <div className="mt-4">
              <Button asChild variant="outline" className="w-full">
                <Link to="/forms">Ver Todos os Formulários</Link>
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-2xl font-bold">Integrações</CardTitle>
            <LinkIcon className="h-5 w-5 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">
              {isLoadingIntegrations ? (
                <div className="h-8 w-16 animate-pulse rounded-md bg-muted"></div>
              ) : (
                integrations.length
              )}
            </div>
            <p className="text-xs text-muted-foreground">
              Conexões processo-formulário
            </p>
            <div className="mt-4">
              <Button asChild variant="outline" className="w-full">
                <Link to="/integration">Ver Todas as Integrações</Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="mt-10">
        <Card>
          <CardHeader>
            <CardTitle>Começando</CardTitle>
            <CardDescription>
              Bem-vindo ao prova de conceito de BPMN e Formulários Dinâmicos.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <h3 className="font-medium">1. Criar Processo BPMN</h3>
              <p className="text-sm text-muted-foreground">
                Primeiro, crie um processo BPMN usando o editor BPMN.js integrado.
              </p>
              <Button asChild size="sm">
                <Link to="/processes/new">Criar Processo</Link>
              </Button>
            </div>

            <div className="space-y-2">
              <h3 className="font-medium">2. Criar Formulário Dinâmico</h3>
              <p className="text-sm text-muted-foreground">
                Desenhe formulários interativos usando o editor form-js.
              </p>
              <Button asChild size="sm">
                <Link to="/forms/new">Criar Formulário</Link>
              </Button>
            </div>

            <div className="space-y-2">
              <h3 className="font-medium">3. Vincular Processo e Formulário</h3>
              <p className="text-sm text-muted-foreground">
                Conecte seu processo BPMN com o formulário apropriado.
              </p>
              <Button asChild size="sm">
                <Link to="/integration">Criar Integração</Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Dashboard;
