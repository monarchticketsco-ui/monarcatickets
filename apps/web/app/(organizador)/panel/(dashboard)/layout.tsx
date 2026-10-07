import { requireOrganizer } from "@/lib/organizer";
import { DashboardShell } from "@/components/dashboard-shell";
import { getFourvenuesEventById } from "@/lib/fourvenues";

export default async function PanelDashboardLayout({ children }: { children: React.ReactNode }) {
  const { organizer } = await requireOrganizer();
  const evento = organizer.fourvenues_event_id
    ? await getFourvenuesEventById(organizer.fourvenues_event_id).catch(() => null)
    : null;

  return (
    <DashboardShell
      role="organizador"
      titulo="Panel de Polinizador"
      evento={evento?.name ?? null}
      etiqueta={evento ? `${organizer.legal_name} · ${evento.name}` : organizer.legal_name}
      inicial={organizer.legal_name}
    >
      {children}
    </DashboardShell>
  );
}
