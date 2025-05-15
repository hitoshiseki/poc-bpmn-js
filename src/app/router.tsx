
import { Route, Routes } from "react-router-dom";

// Pages
import Dashboard from "@/features/dashboard/pages/Dashboard";
import ProcessList from "@/features/bpmn/pages/ProcessList";
import ProcessEditor from "@/features/bpmn/pages/ProcessEditor";
import ProcessView from "@/features/bpmn/pages/ProcessView";
import FormList from "@/features/forms/pages/FormList";
import FormEditor from "@/features/forms/pages/FormEditor";
import FormView from "@/features/forms/pages/FormView";
import IntegrationList from "@/features/integration/pages/IntegrationList";
import IntegrationEditor from "@/features/integration/pages/IntegrationEditor";
import NotFoundPage from "@/pages/NotFound";

export const AppRoutes = () => {
  return (
    <Routes>
      {/* Dashboard */}
      <Route path="/poc-bpmn-js" element={<Dashboard />} />
      <Route path="/" element={<Dashboard />} />

      {/* BPMN Process Routes */}
      <Route path="/processes" element={<ProcessList />} />
      <Route path="/processes/new" element={<ProcessEditor />} />
      <Route path="/processes/:id" element={<ProcessView />} />
      <Route path="/processes/:id/edit" element={<ProcessEditor />} />

      {/* Dynamic Forms Routes */}
      <Route path="/forms" element={<FormList />} />
      <Route path="/forms/new" element={<FormEditor />} />
      <Route path="/forms/:id" element={<FormView />} />
      <Route path="/forms/:id/edit" element={<FormEditor />} />

      {/* Integration Routes */}
      <Route path="/integration" element={<IntegrationList />} />
      <Route path="/integration/:id" element={<IntegrationEditor />} />

      {/* 404 page */}
      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  );
};
