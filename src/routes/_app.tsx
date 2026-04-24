import { createFileRoute, Outlet } from "@tanstack/react-router";
import { AuthGate } from "@/components/AuthGate";
import { DashboardLayout } from "@/components/DashboardLayout";

export const Route = createFileRoute("/_app")({
  component: AppLayout,
});

function AppLayout() {
  return (
    <AuthGate>
      <DashboardLayout />
    </AuthGate>
  );
}

// Re-export Outlet so DashboardLayout can render child routes
export { Outlet };
