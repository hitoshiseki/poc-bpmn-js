
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

const processFormSchema = z.object({
  name: z.string().min(2, { message: "Name must be at least 2 characters" }),
  description: z.string().min(5, { message: "Description must be at least 5 characters" }),
});

type ProcessFormValues = z.infer<typeof processFormSchema>;

const ProcessEditor = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const queryClient = useQueryClient();
  const isEditMode = Boolean(id);
  
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
      toast.success("Process created successfully");
      navigate("/processes");
    },
    onError: () => {
      toast.error("Failed to create process");
    },
  });
  
  // Update process mutation
  const updateProcessMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<BpmnProcess> }) =>
      processService.updateProcess(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["processes"] });
      queryClient.invalidateQueries({ queryKey: ["process", id] });
      toast.success("Process updated successfully");
      navigate("/processes");
    },
    onError: () => {
      toast.error("Failed to update process");
    },
  });
  
  const onBpmnChange = (xml: string) => {
    setBpmnXml(xml);
  };
  
  const onSubmit = (values: ProcessFormValues) => {
    if (!bpmnXml) {
      toast.error("BPMN diagram is required");
      return;
    }
    
    // Ensure we're passing all required fields with proper types
    const data = {
      name: values.name, // Explicitly use the name from the form values
      description: values.description, // Explicitly use the description from the form values
      xml: bpmnXml,
    };
    
    if (isEditMode && id) {
      updateProcessMutation.mutate({ id, data });
    } else {
      createProcessMutation.mutate(data);
    }
  };
  
  return (
    <div className="space-y-6 py-6">
      <div className="flex items-center">
        <Button variant="outline" size="icon" onClick={() => navigate("/processes")}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <h2 className="ml-4 text-3xl font-bold">
          {isEditMode ? "Edit Process" : "New Process"}
        </h2>
      </div>
      
      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle>Process Details</CardTitle>
            <CardDescription>
              Enter the basic information about your BPMN process
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
                      <FormLabel>Name</FormLabel>
                      <FormControl>
                        <Input placeholder="Enter process name" {...field} />
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
                      <FormLabel>Description</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Enter process description"
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
                  {isEditMode ? "Update Process" : "Save Process"}
                </Button>
              </form>
            </Form>
          </CardContent>
        </Card>
        
        <Card className="h-[calc(100vh-250px)] lg:col-span-2">
          <CardHeader>
            <CardTitle>Process Diagram</CardTitle>
            <CardDescription>
              Design your BPMN process diagram using the modeler below
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
      </div>
    </div>
  );
};

export default ProcessEditor;
