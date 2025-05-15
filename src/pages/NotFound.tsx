import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { AlertTriangle } from "lucide-react";

const NotFound = () => {
  const navigate = useNavigate();

  return (
    <div className="flex h-[calc(100vh-120px)] flex-col items-center justify-center text-center">
      <div className="mb-4 rounded-full bg-primary/10 p-3">
        <AlertTriangle className="h-10 w-10 text-primary" />
      </div>
      <h1 className="text-4xl font-bold">404</h1>
      <p className="mt-4 text-xl">Página não encontrada</p>
      <p className="mt-2 text-muted-foreground">
        A página que você está procurando não existe ou foi movida.
      </p>
      <div className="mt-8">
        <Button onClick={() => navigate("/")}>Retornar ao Dashboard</Button>
      </div>
    </div>
  );
};

export default NotFound;
