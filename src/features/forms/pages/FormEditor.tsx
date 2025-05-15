
import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { formService } from "../api/formService";
import { FormBuilder } from "../components/FormBuilder";
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
import { DynamicForm } from "@/lib/types";
import { useIsMobile } from "@/hooks/use-mobile";

const formSchema = z.object({
  name: z.string().min(2, { message: "Name must be at least 2 characters" }),
  description: z.string().min(5, { message: "Description must be at least 5 characters" }),
});

type FormValues = z.infer<typeof formSchema>;

// Default form schema with proper structure
const DEFAULT_FORM_SCHEMA = {
  type: "default",
  components: [
    {
      type: "text",
      text: "# My New Form\n\nThis is a new dynamic form."
    },
    {
      key: "textfield",
      label: "Text Field",
      type: "textfield"
    },
    {
      key: "checkbox",
      label: "Checkbox",
      type: "checkbox"
    }
  ],
  schemaVersion: 5
};

const FormEditor = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const queryClient = useQueryClient();
  const isEditMode = Boolean(id);
  const isMobile = useIsMobile();
  
  const [formSchema, setFormSchema] = useState<any>(DEFAULT_FORM_SCHEMA);
  
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      description: "",
    },
  });
  
  // Fetch form data if in edit mode
  const { data: existingForm, isLoading } = useQuery({
    queryKey: ["form", id],
    queryFn: () => formService.getFormById(id!),
    enabled: isEditMode,
  });
  
  // Set form values when form data is loaded
  useEffect(() => {
    if (existingForm) {
      form.reset({
        name: existingForm.name,
        description: existingForm.description,
      });
      
      // Ensure the schema has the proper structure
      if (existingForm.schema) {
        const validSchema = { ...existingForm.schema };
        
        if (!validSchema.type) {
          validSchema.type = "default";
        }
        
        if (!validSchema.components || !Array.isArray(validSchema.components)) {
          validSchema.components = DEFAULT_FORM_SCHEMA.components;
        }
        
        if (!validSchema.schemaVersion) {
          validSchema.schemaVersion = 5;
        }
        
        setFormSchema(validSchema);
      } else {
        setFormSchema(DEFAULT_FORM_SCHEMA);
      }
    }
  }, [existingForm, form]);
  
  // Create form mutation
  const createFormMutation = useMutation({
    mutationFn: (data: Omit<DynamicForm, "id" | "createdAt" | "updatedAt">) =>
      formService.createForm(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["forms"] });
      toast.success("Form created successfully");
      navigate("/forms");
    },
    onError: () => {
      toast.error("Failed to create form");
    },
  });
  
  // Update form mutation
  const updateFormMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<DynamicForm> }) =>
      formService.updateForm(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["forms"] });
      queryClient.invalidateQueries({ queryKey: ["form", id] });
      toast.success("Form updated successfully");
      navigate("/forms");
    },
    onError: () => {
      toast.error("Failed to update form");
    },
  });
  
  const onFormSchemaChange = (schema: any) => {
    setFormSchema(schema);
  };
  
  const onSubmit = (values: FormValues) => {
    if (!formSchema) {
      toast.error("Form schema is required");
      return;
    }
    
    const data = {
      name: values.name,
      description: values.description,
      schema: formSchema,
    };
    
    if (isEditMode && id) {
      updateFormMutation.mutate({ id, data });
    } else {
      createFormMutation.mutate(data as Omit<DynamicForm, "id" | "createdAt" | "updatedAt">);
    }
  };
  
  return (
    <div className="space-y-6 py-6">
      <div className="flex items-center">
        <Button variant="outline" size="icon" onClick={() => navigate("/forms")}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <h2 className="ml-4 text-3xl font-bold">
          {isEditMode ? "Edit Form" : "New Form"}
        </h2>
      </div>
      
      <div className="grid gap-6 xl:grid-cols-3">
        <Card className={`${isMobile || !isMobile && window.innerWidth < 1280 ? 'w-full' : ''} xl:col-span-1`}>
          <CardHeader>
            <CardTitle>Form Details</CardTitle>
            <CardDescription>
              Enter the basic information about your form
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
                        <Input placeholder="Enter form name" {...field} />
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
                          placeholder="Enter form description"
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
                  disabled={isLoading || createFormMutation.isPending || updateFormMutation.isPending}
                >
                  <Save className="mr-2 h-4 w-4" />
                  {isEditMode ? "Update Form" : "Save Form"}
                </Button>
              </form>
            </Form>
          </CardContent>
        </Card>
        
        <Card className={`h-[calc(100vh-250px)] ${isMobile || !isMobile && window.innerWidth < 1280 ? 'w-full' : ''} xl:col-span-2`}>
          <CardHeader>
            <CardTitle>Form Builder</CardTitle>
            <CardDescription>
              Design your form using the form builder below
            </CardDescription>
          </CardHeader>
          <CardContent className="h-[calc(100%-130px)]">
            {(isLoading && isEditMode) ? (
              <div className="flex h-full w-full items-center justify-center">
                <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
              </div>
            ) : (
              <FormBuilder 
                initialSchema={formSchema} 
                onChange={onFormSchemaChange} 
              />
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default FormEditor;
