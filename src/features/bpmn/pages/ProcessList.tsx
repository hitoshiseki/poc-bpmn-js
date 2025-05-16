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
      toast.success("Processo excluído com sucesso");
    },
    onError: (error) => {
      toast.error("Falha ao excluir o processo");
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
          <h2 className="text-3xl font-bold">Processos BPMN</h2>
          <p className="text-muted-foreground">Gerencie seus modelos de processos de negócio</p>
        </div>
        <Button asChild className="mt-4 sm:mt-0">
          <Link to="/processes/new">
            <PlusCircle className="mr-2 h-4 w-4" />
            Novo Processo
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
                <p>Criado: {format(new Date(process.createdAt), "PPP")}</p>
                <p>Última atualização: {format(new Date(process.updatedAt), "PPP")}</p>
              </div>
            </CardContent>
            <CardFooter className="flex justify-end">
              <div className="flex gap-2">
                <Button asChild variant="outline" size="sm">
                  <Link to={`/processes/${process.id}`}>
                    <Eye className="h-4 w-4" />
                  </Link>
                </Button>
                <Button asChild variant="outline" size="sm">
                  <Link to={`/processes/${process.id}/edit`}>
                    <Edit2 className="h-4 w-4" />
                  </Link>
                </Button>

                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button variant="destructive" size="sm">
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Confirmar exclusão</AlertDialogTitle>
                      <AlertDialogDescription>
                        Tem certeza que deseja excluir este processo? Esta ação não pode ser desfeita.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancelar</AlertDialogCancel>
                      <AlertDialogAction onClick={() => handleDelete(process.id)}>
                        Excluir
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </div>
            </CardFooter>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default ProcessList;
