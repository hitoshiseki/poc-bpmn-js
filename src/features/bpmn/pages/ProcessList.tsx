
import { Link } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { processService } from "../api/processService";
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
import { ProcessEmptyState } from "../components/ProcessEmptyState";
import { ProcessListSkeleton } from "../components/ProcessListSkeleton";

const ProcessList = () => {
  const queryClient = useQueryClient();
  
  const { data: processes = [], isLoading } = useQuery({
    queryKey: ["processes"],
    queryFn: () => processService.getAllProcesses(),
  });
  
  const deleteProcessMutation = useMutation({
    mutationFn: (id: string) => processService.deleteProcess(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["processes"] });
      toast.success("Process deleted successfully");
    },
    onError: (error) => {
      toast.error("Failed to delete the process");
      console.error(error);
    },
  });
  
  const handleDelete = (id: string) => {
    deleteProcessMutation.mutate(id);
  };
  
  if (isLoading) {
    return <ProcessListSkeleton />;
  }
  
  if (processes.length === 0) {
    return <ProcessEmptyState />;
  }
  
  return (
    <div className="space-y-6 py-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-3xl font-bold">BPMN Processes</h2>
          <p className="text-muted-foreground">Manage your business process models</p>
        </div>
        <Button asChild className="mt-4 sm:mt-0">
          <Link to="/processes/new">
            <PlusCircle className="mr-2 h-4 w-4" />
            New Process
          </Link>
        </Button>
      </div>
      
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {processes.map((process) => (
          <Card key={process.id}>
            <CardHeader>
              <CardTitle>{process.name}</CardTitle>
              <CardDescription>{process.description}</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-sm text-muted-foreground">
                <p>Created: {format(new Date(process.createdAt), "PPP")}</p>
                <p>Last updated: {format(new Date(process.updatedAt), "PPP")}</p>
              </div>
            </CardContent>
            <CardFooter className="flex justify-between">
              <div className="flex gap-2">
                <Button asChild variant="outline" size="sm">
                  <Link to={`/processes/${process.id}`}>
                    <Eye className="mr-2 h-4 w-4" />
                    View
                  </Link>
                </Button>
                <Button asChild variant="outline" size="sm">
                  <Link to={`/processes/${process.id}/edit`}>
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
                      Are you sure you want to delete this process? This action cannot be undone.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction onClick={() => handleDelete(process.id)}>
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

export default ProcessList;
