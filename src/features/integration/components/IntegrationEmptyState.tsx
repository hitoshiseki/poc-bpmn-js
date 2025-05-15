
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { Link2, PlusCircle } from "lucide-react";

export const IntegrationEmptyState = () => {
  return (
    <div className="flex h-[calc(100vh-160px)] items-center justify-center">
      <div className="mx-auto flex max-w-md flex-col items-center justify-center text-center">
        <div className="mb-4 rounded-full bg-primary/10 p-3">
          <Link2 className="h-10 w-10 text-primary" />
        </div>
        <h2 className="text-2xl font-bold">Nenhuma integração cadastrada</h2>
        <p className="mt-2 text-muted-foreground">
          Crie sua primeira integração ao conectar o processo BPMN com um formulário dinâmico.
        </p>
        <Button asChild className="mt-6">
          <Link to="/integration/new">
            <PlusCircle className="mr-2 h-4 w-4" />
            Criar Integração
          </Link>
        </Button>
      </div>
    </div>
  );
};
