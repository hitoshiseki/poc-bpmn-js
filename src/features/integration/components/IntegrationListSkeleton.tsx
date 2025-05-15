
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";

export const IntegrationListSkeleton = () => {
  return (
    <div className="space-y-6 py-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-3xl font-bold">Process-Form Integrations</h2>
          <p className="text-muted-foreground">
            Connect your BPMN processes with dynamic forms
          </p>
        </div>
      </div>
      
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 3 }).map((_, index) => (
          <Card key={index}>
            <CardHeader>
              <div className="h-6 w-2/3 animate-pulse rounded-md bg-muted"></div>
              <div className="h-4 w-4/5 animate-pulse rounded-md bg-muted"></div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <div className="h-4 w-1/4 animate-pulse rounded-md bg-muted"></div>
                  <div className="mt-1 h-5 w-3/4 animate-pulse rounded-md bg-muted"></div>
                </div>
                <div>
                  <div className="h-4 w-1/4 animate-pulse rounded-md bg-muted"></div>
                  <div className="mt-1 h-5 w-3/4 animate-pulse rounded-md bg-muted"></div>
                </div>
              </div>
            </CardContent>
            <CardFooter className="flex justify-between">
              <div className="h-9 w-20 animate-pulse rounded-md bg-muted"></div>
              <div className="h-9 w-20 animate-pulse rounded-md bg-muted"></div>
            </CardFooter>
          </Card>
        ))}
      </div>
    </div>
  );
};
