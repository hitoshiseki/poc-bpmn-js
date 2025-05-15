import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { Workflow, PlusCircle } from "lucide-react";

export const ProcessEmptyState = () => {
  return (
    <div className="flex h-[calc(100vh-160px)] items-center justify-center">
      <div className="mx-auto flex max-w-md flex-col items-center justify-center text-center">
        <div className="mb-4 rounded-full bg-primary/10 p-3">
          <Workflow className="h-10 w-10 text-primary" />
        </div>
        <h2 className="text-2xl font-bold">Nenhum processo BPMN encontrado</h2>
        <p className="mt-2 text-muted-foreground">
          Crie seu primeiro processo BPMN para começar a modelar seus fluxos de trabalho.
        </p>
        <Button asChild className="mt-6">
          <Link to="/processes/new">
            <PlusCircle className="mr-2 h-4 w-4" />
            Criar Processo
          </Link>
        </Button>
      </div>
    </div>
  );
};
