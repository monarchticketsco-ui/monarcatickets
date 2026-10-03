import { requireComprador } from "@/lib/admin";
import { DashboardSidebar } from "@/components/dashboard-sidebar";

export default async function MiCuentaLayout({ children }: { children: React.ReactNode }) {
  await requireComprador();

  return (
    <main className="container dashboard-shell">
      <DashboardSidebar role="comprador" titulo="Mi cuenta" />
      <div className="dashboard-main">{children}</div>
    </main>
  );
}
