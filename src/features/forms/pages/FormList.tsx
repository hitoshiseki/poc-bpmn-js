
import { Link } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { formService } from "../api/formService";
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
import { PlusCircle, Eye, Edit2, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { format } from "date-fns";
import { FormEmptyState } from "../components/FormEmptyState";
import { FormListSkeleton } from "../components/FormListSkeleton";

const FormList = () => {
  const queryClient = useQueryClient();
  
  const { data: forms = [], isLoading } = useQuery({
    queryKey: ["forms"],
    queryFn: () => formService.getAllForms(),
  });
  
  const deleteFormMutation = useMutation({
    mutationFn: (id: string) => formService.deleteForm(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["forms"] });
      toast.success("Form deleted successfully");
    },
    onError: (error) => {
      toast.error("Failed to delete the form");
      console.error(error);
    },
  });
  
  const handleDelete = (id: string) => {
    deleteFormMutation.mutate(id);
  };
  
  if (isLoading) {
    return <FormListSkeleton />;
  }
  
  if (forms.length === 0) {
    return <FormEmptyState />;
  }
  
  return (
    <div className="space-y-6 py-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-3xl font-bold">Dynamic Forms</h2>
          <p className="text-muted-foreground">Manage your interactive forms</p>
        </div>
        <Button asChild className="mt-4 sm:mt-0">
          <Link to="/forms/new">
            <PlusCircle className="mr-2 h-4 w-4" />
            New Form
          </Link>
        </Button>
      </div>
      
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {forms.map((form) => (
          <Card key={form.id}>
            <CardHeader>
              <CardTitle>{form.name}</CardTitle>
              <CardDescription>{form.description}</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-sm text-muted-foreground">
                <p>Created: {format(new Date(form.createdAt), "PPP")}</p>
                <p>Last updated: {format(new Date(form.updatedAt), "PPP")}</p>
                <p className="mt-2">
                  Fields: {form.schema.components?.filter((c: any) => c.key)?.length || 0}
                </p>
              </div>
            </CardContent>
            <CardFooter className="flex justify-between">
              <div className="flex gap-2">
                <Button asChild variant="outline" size="sm">
                  <Link to={`/forms/${form.id}`}>
                    <Eye className="mr-2 h-4 w-4" />
                    View
                  </Link>
                </Button>
                <Button asChild variant="outline" size="sm">
                  <Link to={`/forms/${form.id}/edit`}>
                    <Edit2 className="mr-2 h-4 w-4" />
                    Edit
                  </Link>
                </Button>
              </div>
              
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
                      Are you sure you want to delete this form? This action cannot be undone.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction onClick={() => handleDelete(form.id)}>
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

export default FormList;
