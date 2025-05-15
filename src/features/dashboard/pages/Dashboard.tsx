
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
          <h2 className="text-3xl font-bold">Dashboard</h2>
          <p className="text-muted-foreground">Welcome to the BPMN & Dynamic Forms POC</p>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-2xl font-bold">BPMN Processes</CardTitle>
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
              Total processes modeled
            </p>
            <div className="mt-4">
              <Button asChild variant="outline" className="w-full">
                <Link to="/processes">View All Processes</Link>
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-2xl font-bold">Dynamic Forms</CardTitle>
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
              Total forms created
            </p>
            <div className="mt-4">
              <Button asChild variant="outline" className="w-full">
                <Link to="/forms">View All Forms</Link>
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-2xl font-bold">Integrations</CardTitle>
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
              Process-form links
            </p>
            <div className="mt-4">
              <Button asChild variant="outline" className="w-full">
                <Link to="/integration">View All Integrations</Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="mt-10">
        <Card>
          <CardHeader>
            <CardTitle>Getting Started</CardTitle>
            <CardDescription>
              Welcome to the BPMN & Dynamic Forms proof of concept.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <h3 className="font-medium">1. Create BPMN Process</h3>
              <p className="text-sm text-muted-foreground">
                First, create a BPMN process using the integrated BPMN.js editor.
              </p>
              <Button asChild size="sm">
                <Link to="/processes/new">Create Process</Link>
              </Button>
            </div>

            <div className="space-y-2">
              <h3 className="font-medium">2. Create Dynamic Form</h3>
              <p className="text-sm text-muted-foreground">
                Design interactive forms using the form-js editor.
              </p>
              <Button asChild size="sm">
                <Link to="/forms/new">Create Form</Link>
              </Button>
            </div>

            <div className="space-y-2">
              <h3 className="font-medium">3. Link Process and Form</h3>
              <p className="text-sm text-muted-foreground">
                Connect your BPMN process with the appropriate form.
              </p>
              <Button asChild size="sm">
                <Link to="/integration">Create Integration</Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Dashboard;
