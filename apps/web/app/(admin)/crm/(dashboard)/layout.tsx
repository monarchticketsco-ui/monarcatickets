import { requireAdmin } from "@/lib/admin";
import { DashboardShell } from "@/components/dashboard-shell";

export default async function CrmDashboardLayout({ children }: { children: React.ReactNode }) {
  const { user } = await requireAdmin();

  return (
    <DashboardShell role="admin" titulo="Management" etiqueta="MONARCA · MANAGEMENT" inicial={user?.email ?? "M"}>
      {children}
    </DashboardShell>
  );
}
