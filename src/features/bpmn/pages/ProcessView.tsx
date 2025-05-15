
import { useNavigate, useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { processService } from "../api/processService";
import { integrationService } from "@/features/integration/api/integrationService";
import { formService } from "@/features/forms/api/formService";
import { Button } from "@/components/ui/button";
import { 
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle 
} from "@/components/ui/card";
import {
  ArrowLeft,
  Edit2,
  Link as LinkIcon,
  Unlink
} from "lucide-react";
import { BpmnModeler } from "../components/BpmnModeler";
import { format } from "date-fns";

const ProcessView = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();

  const { data: process, isLoading: isProcessLoading } = useQuery({
    queryKey: ["process", id],
    queryFn: () => processService.getProcessById(id!),
    enabled: Boolean(id),
  });

  const { data: integration } = useQuery({
    queryKey: ["integration", "byProcess", id],
    queryFn: () => integrationService.getIntegrationByProcessId(id!),
    enabled: Boolean(id),
  });

  const { data: linkedForm, isLoading: isFormLoading } = useQuery({
    queryKey: ["form", integration?.formId],
    queryFn: () => formService.getFormById(integration?.formId!),
    enabled: Boolean(integration?.formId),
  });

  if (isProcessLoading) {
    return (
      <div className="flex h-[calc(100vh-120px)] items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
      </div>
    );
  }

  if (!process) {
    return (
      <div className="flex h-[calc(100vh-120px)] items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold">Process not found</h2>
          <p className="text-muted-foreground">The requested process does not exist</p>
          <Button onClick={() => navigate("/processes")} className="mt-4">
            Go back to processes
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
          <h2 className="ml-4 text-3xl font-bold">{process.name}</h2>
        </div>
        <div className="mt-4 flex space-x-2 md:mt-0">
          <Button asChild variant="outline">
            <span onClick={() => navigate(`/processes/${id}/edit`)}>
              <Edit2 className="mr-2 h-4 w-4" />
              Edit Process
            </span>
          </Button>
          {integration ? (
            <Button asChild variant="outline">
              <span onClick={() => navigate(`/integration/${integration.id}`)}>
                <LinkIcon className="mr-2 h-4 w-4" />
                View Integration
              </span>
            </Button>
          ) : (
            <Button asChild>
              <span onClick={() => navigate(`/integration?processId=${id}`)}>
                <LinkIcon className="mr-2 h-4 w-4" />
                Link to Form
              </span>
            </Button>
          )}
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle>Process Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <h3 className="text-sm font-medium text-muted-foreground">Description</h3>
              <p>{process.description}</p>
            </div>
            <div>
              <h3 className="text-sm font-medium text-muted-foreground">Created</h3>
              <p>{format(new Date(process.createdAt), "PPP 'at' pp")}</p>
            </div>
            <div>
              <h3 className="text-sm font-medium text-muted-foreground">Last Updated</h3>
              <p>{format(new Date(process.updatedAt), "PPP 'at' pp")}</p>
            </div>
          </CardContent>
          <CardFooter className="border-t p-4">
            <div className="w-full">
              <h3 className="mb-2 text-sm font-medium text-muted-foreground">Linked Form</h3>
              {linkedForm ? (
                <div className="flex items-center justify-between">
                  <span>{linkedForm.name}</span>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={() => navigate(`/forms/${linkedForm.id}`)}
                  >
                    View Form
                  </Button>
                </div>
              ) : (
                <div className="text-sm text-muted-foreground">
                  No form linked to this process
                </div>
              )}
            </div>
          </CardFooter>
        </Card>

        <Card className="h-[calc(100vh-250px)] lg:col-span-2">
          <CardHeader>
            <CardTitle>Process Diagram</CardTitle>
            <CardDescription>
              BPMN diagram visualization (read-only)
            </CardDescription>
          </CardHeader>
          <CardContent className="h-[calc(100%-130px)]">
            <BpmnModeler initialXml={process.xml} readOnly />
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default ProcessView;
