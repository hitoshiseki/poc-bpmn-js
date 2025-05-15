
import { useNavigate, useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { formService } from "../api/formService";
import { integrationService } from "@/features/integration/api/integrationService";
import { processService } from "@/features/bpmn/api/processService";
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
} from "lucide-react";
import { FormViewer } from "../components/FormViewer";
import { format } from "date-fns";
import { toast } from "sonner";

const FormView = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();

  const { data: form, isLoading } = useQuery({
    queryKey: ["form", id],
    queryFn: () => formService.getFormById(id!),
    enabled: Boolean(id),
  });

  // Get all integrations and then find the ones that use this form
  const { data: integrations = [] } = useQuery({
    queryKey: ["integrations"],
    queryFn: () => integrationService.getAllIntegrations(),
    enabled: Boolean(id),
  });

  const formIntegrations = integrations.filter(i => i.formId === id);

  // Get processes linked to this form
  const { data: linkedProcesses = [] } = useQuery({
    queryKey: ["processes", "byForm", id],
    queryFn: async () => {
      const processPromises = formIntegrations.map(i => 
        processService.getProcessById(i.processId)
      );
      const processes = await Promise.all(processPromises);
      return processes.filter(Boolean); // Filter out null values
    },
    enabled: formIntegrations.length > 0,
  });

  const handleFormSubmit = (data: any) => {
    console.log("Form submitted with data:", data);
    toast.success("Form submitted successfully!");
  };

  if (isLoading) {
    return (
      <div className="flex h-[calc(100vh-120px)] items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
      </div>
    );
  }

  if (!form) {
    return (
      <div className="flex h-[calc(100vh-120px)] items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold">Form not found</h2>
          <p className="text-muted-foreground">The requested form does not exist</p>
          <Button onClick={() => navigate("/forms")} className="mt-4">
            Go back to forms
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 py-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between">
        <div className="flex items-center">
          <Button variant="outline" size="icon" onClick={() => navigate("/forms")}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <h2 className="ml-4 text-3xl font-bold">{form.name}</h2>
        </div>
        <div className="mt-4 flex space-x-2 md:mt-0">
          <Button asChild variant="outline">
            <span onClick={() => navigate(`/forms/${id}/edit`)}>
              <Edit2 className="mr-2 h-4 w-4" />
              Edit Form
            </span>
          </Button>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-1">
          <Card>
            <CardHeader>
              <CardTitle>Form Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h3 className="text-sm font-medium text-muted-foreground">Description</h3>
                <p>{form.description}</p>
              </div>
              <div>
                <h3 className="text-sm font-medium text-muted-foreground">Created</h3>
                <p>{format(new Date(form.createdAt), "PPP 'at' pp")}</p>
              </div>
              <div>
                <h3 className="text-sm font-medium text-muted-foreground">Last Updated</h3>
                <p>{format(new Date(form.updatedAt), "PPP 'at' pp")}</p>
              </div>
              <div>
                <h3 className="text-sm font-medium text-muted-foreground">Fields</h3>
                <p>{form.schema.components?.filter((c: any) => c.key)?.length || 0} fields</p>
              </div>
            </CardContent>
          </Card>

          {linkedProcesses.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Linked Processes</CardTitle>
                <CardDescription>
                  This form is used in these processes
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  {linkedProcesses.map((process: any) => (
                    <li key={process.id} className="flex items-center justify-between">
                      <span>{process.name}</span>
                      <Button 
                        variant="outline" 
                        size="sm" 
                        onClick={() => navigate(`/processes/${process.id}`)}
                      >
                        View
                      </Button>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          )}
        </div>

        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Form Preview</CardTitle>
            <CardDescription>
              Interactive preview of this form
            </CardDescription>
          </CardHeader>
          <CardContent>
            <FormViewer schema={form.schema} onSubmit={handleFormSubmit} />
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default FormView;
