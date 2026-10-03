import { requireOrganizer, getEventoYTicketsDelOrganizador } from "@/lib/organizer";
import { AsistentesTable } from "./asistentes-table";

export const dynamic = "force-dynamic";

export default async function AsistentesPage() {
  const { organizer } = await requireOrganizer();
  const { evento, tickets } = await getEventoYTicketsDelOrganizador(organizer.fourvenues_event_id);

  if (!evento) {
    return (
      <>
        <div className="eyebrow">ASISTENTES</div>
        <h1>Sin evento asignado</h1>
        <p className="empty-state" style={{ marginTop: 20 }}>
          Cuando Monarca Tickets te asigne tu evento, aqui veras la lista de asistentes.
        </p>
      </>
    );
  }

  const filas = tickets
    .filter((t) => t.status !== "refunded" && t.status !== "cancelled")
    .map((t) => ({
      id: t._id,
      nombre: t.full_name,
      correo: t.email,
      telefono: t.phone,
      tarifa: evento.ticket_rates?.find((r) => r._id === t.ticket_rate_id)?.name ?? "—",
      estado: t.status,
    }));

  return (
    <>
      <div className="eyebrow">ASISTENTES</div>
      <h1 style={{ marginBottom: 4 }}>{evento.name}</h1>
      <p className="page-lede">{filas.length} personas con entrada para este evento.</p>

      <AsistentesTable filas={filas} />
    </>
  );
}
