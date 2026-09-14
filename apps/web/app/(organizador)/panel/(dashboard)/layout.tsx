import { requireOrganizer } from "@/lib/organizer";
import { DashboardSidebar } from "@/components/dashboard-sidebar";

export default async function PanelDashboardLayout({ children }: { children: React.ReactNode }) {
  const { organizer } = await requireOrganizer();

  return (
    <main className="container dashboard-shell">
      <DashboardSidebar role="organizador" titulo={organizer.legal_name} />
      <div className="dashboard-main">{children}</div>
    </main>
  );
}
