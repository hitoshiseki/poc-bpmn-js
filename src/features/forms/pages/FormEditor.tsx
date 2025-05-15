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
import { DynamicForm, Schema } from "@/lib/types";
import { useIsMobile } from "@/hooks/use-mobile";

const formSchemaZod = z.object({
  name: z.string().min(2, { message: "O nome deve ter pelo menos 2 caracteres" }),
  description: z.string().min(5, { message: "A descrição deve ter pelo menos 5 caracteres" }),
});

type FormValues = z.infer<typeof formSchemaZod>;

// Default form schema with proper structure
const DEFAULT_FORM_SCHEMA = {
  type: "default",
  components: [
    {
      type: "text",
      text: "# Meu Novo Formulário\n\nEste é um novo formulário dinâmico."
    },
    {
      key: "textfield",
      label: "Campo de Texto",
      type: "textfield"
    },
    {
      key: "checkbox",
      label: "Caixa de Seleção",
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

  const [formSchema, setFormSchema] = useState<Schema>(DEFAULT_FORM_SCHEMA);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchemaZod),
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
      toast.success("Formulário criado com sucesso");
      navigate("/forms");
    },
    onError: () => {
      toast.error("Falha ao criar formulário");
    },
  });

  // Update form mutation
  const updateFormMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<DynamicForm> }) =>
      formService.updateForm(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["forms"] });
      queryClient.invalidateQueries({ queryKey: ["form", id] });
      toast.success("Formulário atualizado com sucesso");
      navigate("/forms");
    },
    onError: () => {
      toast.error("Falha ao atualizar formulário");
    },
  });

  const onFormSchemaChange = (schema: Schema) => {
    setFormSchema(schema);
  };

  const onSubmit = (values: FormValues) => {
    if (!formSchema) {
      toast.error("O esquema do formulário é obrigatório");
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
          {isEditMode ? "Editar Formulário" : "Novo Formulário"}
        </h2>
      </div>

      <div className="grid gap-6">

        <Card className={`h-[calc(100vh-250px)] ${isMobile || !isMobile && window.innerWidth < 1280 ? 'w-full' : ''}`}>
          <CardHeader>
            <CardTitle>Construtor de Formulário</CardTitle>
            <CardDescription>
              Projete seu formulário usando o construtor abaixo
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
        <Card className={`${isMobile || !isMobile && window.innerWidth < 1280 ? 'w-full' : ''}`}>
          <CardHeader>
            <CardTitle>Detalhes do Formulário</CardTitle>
            <CardDescription>
              Insira as informações básicas sobre seu formulário
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
                        <Input placeholder="Digite o nome do formulário" {...field} />
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
                          placeholder="Digite a descrição do formulário"
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
                  {isEditMode ? "Atualizar Formulário" : "Salvar Formulário"}
                </Button>
              </form>
            </Form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default FormEditor;
