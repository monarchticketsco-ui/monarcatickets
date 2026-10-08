import { requireOrganizer } from "@/lib/organizer";
import { DashboardShell } from "@/components/dashboard-shell";
import { getFourvenuesEventById } from "@/lib/fourvenues";

export default async function PanelDashboardLayout({ children }: { children: React.ReactNode }) {
  const { organizer, eventIds } = await requireOrganizer();
  const eventos = await Promise.all(
    eventIds.map(async (id) => ({ id, evento: await getFourvenuesEventById(id).catch(() => null) }))
  );
  const evento = eventos.find((e) => e.id === organizer.fourvenues_event_id)?.evento ?? null;

  return (
    <DashboardShell
      role="organizador"
      titulo="Panel de Polinizador"
      evento={evento?.name ?? null}
      eventos={eventos.map((e) => ({ id: e.id, nombre: e.evento?.name ?? "Evento no disponible" }))}
      eventoActivo={organizer.fourvenues_event_id}
      etiqueta={evento ? `${organizer.legal_name} · ${evento.name}` : organizer.legal_name}
      inicial={organizer.legal_name}
    >
      {children}
    </DashboardShell>
  );
}
