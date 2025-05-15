import { useEffect } from "react";
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
import { ProcessFormIntegration } from "@/lib/types";

const integrationSchema = z.object({
  processId: z.string().min(1, "Process is required"),
  formId: z.string().min(1, "Form is required"),
});

type IntegrationFormValues = z.infer<typeof integrationSchema>;

const IntegrationEditor = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const preselectedProcessId = queryParams.get("processId");
  
  const queryClient = useQueryClient();
  const isEditMode = Boolean(id);
  
  // Form setup with validation
  const form = useForm<IntegrationFormValues>({
    resolver: zodResolver(integrationSchema),
    defaultValues: {
      processId: preselectedProcessId || "",
      formId: "",
    },
  });
  
  // Fetch data
  const { data: integration, isLoading: isLoadingIntegration } = useQuery({
    queryKey: ["integration", id],
    queryFn: () => integrationService.getIntegrationById(id!),
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
  
  // Set form values from integration if in edit mode
  useEffect(() => {
    if (integration) {
      form.reset({
        processId: integration.processId,
        formId: integration.formId,
      });
    }
  }, [integration, form]);
  
  // Mutations for creating/updating integration
  const createIntegrationMutation = useMutation({
    mutationFn: (data: Omit<ProcessFormIntegration, "id" | "createdAt">) =>
      integrationService.createIntegration(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["integrations"] });
      toast.success("Integration created successfully");
      navigate("/integration");
    },
    onError: () => {
      toast.error("Failed to create integration");
    },
  });
  
  const updateIntegrationMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: Omit<ProcessFormIntegration, "id" | "createdAt"> }) =>
      integrationService.updateIntegration(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["integrations"] });
      queryClient.invalidateQueries({ queryKey: ["integration", id] });
      toast.success("Integration updated successfully");
      navigate("/integration");
    },
    onError: () => {
      toast.error("Failed to update integration");
    },
  });
  
  const onSubmit = (values: IntegrationFormValues) => {
    // Convert the values to the correct type
    const integrationData: Omit<ProcessFormIntegration, "id" | "createdAt"> = {
      processId: values.processId,
      formId: values.formId,
    };
    
    if (isEditMode && id) {
      updateIntegrationMutation.mutate({ id, data: integrationData });
    } else {
      createIntegrationMutation.mutate(integrationData);
    }
  };
  
  const isLoading = isLoadingIntegration || isLoadingProcesses || isLoadingForms;
  
  return (
    <div className="space-y-6 py-6">
      <div className="flex items-center">
        <Button variant="outline" size="icon" onClick={() => navigate("/integration")}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <h2 className="ml-4 text-3xl font-bold">
          {isEditMode ? "Edit Integration" : "New Integration"}
        </h2>
      </div>
      
      <Card className="max-w-2xl mx-auto">
        <CardHeader>
          <div className="flex items-center">
            <Link2 className="mr-2 h-5 w-5" />
            <CardTitle>Process-Form Integration</CardTitle>
          </div>
          <CardDescription>
            Link a BPMN process with a dynamic form
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
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
                      <FormLabel>BPMN Process</FormLabel>
                      <FormControl>
                        <Select
                          value={field.value}
                          onValueChange={field.onChange}
                          disabled={Boolean(preselectedProcessId) || processes.length === 0}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select a process" />
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
                          No processes available. Please create a process first.
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
                      <FormLabel>Dynamic Form</FormLabel>
                      <FormControl>
                        <Select
                          value={field.value}
                          onValueChange={field.onChange}
                          disabled={forms.length === 0}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select a form" />
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
                          No forms available. Please create a form first.
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
                      createIntegrationMutation.isPending || 
                      updateIntegrationMutation.isPending
                    }
                  >
                    <Save className="mr-2 h-4 w-4" />
                    {isEditMode ? "Update Integration" : "Save Integration"}
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
