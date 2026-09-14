import { requireAdmin } from "@/lib/admin";
import { DashboardSidebar } from "@/components/dashboard-sidebar";

export default async function CrmDashboardLayout({ children }: { children: React.ReactNode }) {
  await requireAdmin();

  return (
    <main className="container dashboard-shell">
      <DashboardSidebar role="admin" titulo="Panel admin" />
      <div className="dashboard-main">{children}</div>
    </main>
  );
}
