
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
      toast.success("Integration deleted successfully");
    },
    onError: (error) => {
      toast.error("Failed to delete the integration");
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
          <h2 className="text-3xl font-bold">Process-Form Integrations</h2>
          <p className="text-muted-foreground">
            Connect your BPMN processes with dynamic forms
          </p>
        </div>
        <Button asChild className="mt-4 sm:mt-0">
          <Link to="/integration/new">
            <PlusCircle className="mr-2 h-4 w-4" />
            New Integration
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
                  Process-Form Integration
                </div>
              </CardTitle>
              <CardDescription>
                Created on {format(new Date(integration.createdAt), "PPP")}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h3 className="text-sm font-medium text-muted-foreground">Process</h3>
                <p className="font-medium">{integration.process?.name || "Unknown Process"}</p>
              </div>
              <div>
                <h3 className="text-sm font-medium text-muted-foreground">Form</h3>
                <p className="font-medium">{integration.form?.name || "Unknown Form"}</p>
              </div>
            </CardContent>
            <CardFooter className="flex justify-between">
              <Button asChild variant="outline" size="sm">
                <span onClick={() => navigate(`/integration/${integration.id}`)}>
                  <Edit2 className="mr-2 h-4 w-4" />
                  Edit
                </span>
              </Button>
              
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button variant="destructive" size="sm">
                    <Trash2 className="mr-2 h-4 w-4" />
                    Delete
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Confirm deletion</AlertDialogTitle>
                    <AlertDialogDescription>
                      Are you sure you want to delete this integration? This action cannot be undone.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction onClick={() => handleDelete(integration.id)}>
                      Delete
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
