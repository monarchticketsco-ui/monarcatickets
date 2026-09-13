import Link from "next/link";
import { notFound } from "next/navigation";
import { requireAdmin } from "@/lib/admin";
import { createAdminClient } from "@/lib/supabase/admin";
import { actualizarDianStatus } from "../../actions";
import { actualizarFichaOrganizador } from "../actions";

const ESTADOS_DIAN = ["no_habilitado", "en_proceso", "habilitado"] as const;

const DIAN_BADGE: Record<string, string> = {
  no_habilitado: "badge badge-danger",
  en_proceso: "badge badge-warning",
  habilitado: "badge badge-green",
};

const EVENTO_BADGE: Record<string, string> = {
  borrador: "badge",
  publicado: "badge badge-blue",
  en_venta: "badge badge-green",
  finalizado: "badge",
  cancelado: "badge badge-danger",
};

export default async function OrganizadorDetallePage({ params }: { params: Promise<{ id: string }> }) {
  await requireAdmin();
  const { id } = await params;
  const admin = createAdminClient();

  const { data: organizador } = await admin
    .from("organizers")
    .select(
      "id, legal_name, nit, dian_status, commission_rate, contact_name, contact_phone, contact_email, commercial_owner, notas, created_at"
    )
    .eq("id", id)
    .single();

  if (!organizador) notFound();

  const { data: eventos } = await admin
    .from("events")
    .select("id, name, city, starts_at, status")
    .eq("organizer_id", id)
    .order("starts_at", { ascending: false });

  const actualizarFichaConId = actualizarFichaOrganizador.bind(null, id);

  return (
    <main className="container">
      <p>
        <Link href="/crm" className="nav-link" style={{ padding: 0 }}>
          ← Volver al CRM
        </Link>
      </p>
      <div style={{ display: "flex", alignItems: "center", gap: 12, flexWrap: "wrap" }}>
        <h1 style={{ marginBottom: 0 }}>{organizador.legal_name}</h1>
        <span className={DIAN_BADGE[organizador.dian_status] ?? "badge"}>{organizador.dian_status}</span>
      </div>
      <p className="page-lede">
        NIT {organizador.nit} · Cliente desde {new Date(organizador.created_at).toLocaleDateString("es-CO", { timeZone: "America/Bogota" })}
      </p>

      <h2>Estado DIAN</h2>
      <div className="card" style={{ maxWidth: 420 }}>
        <form
          action={async (formData: FormData) => {
            "use server";
            const nuevoEstado = String(formData.get("dian_status")) as
              | "no_habilitado"
              | "en_proceso"
              | "habilitado";
            await actualizarDianStatus(id, nuevoEstado);
          }}
          style={{ display: "flex", gap: 8 }}
        >
          <select name="dian_status" defaultValue={organizador.dian_status} style={{ minWidth: 160 }}>
            {ESTADOS_DIAN.map((estado) => (
              <option key={estado} value={estado}>
                {estado}
              </option>
            ))}
          </select>
          <button type="submit" className="btn btn-secondary btn-sm">
            Guardar
          </button>
        </form>
      </div>

      <h2>Ficha del organizador</h2>
      <p className="muted" style={{ maxWidth: "60ch" }}>
        Datos de contacto, responsable comercial y comision acordada. Solo visibles para el equipo de Monarca
        Tickets.
      </p>
      <div className="card" style={{ maxWidth: 620 }}>
        <form action={actualizarFichaConId} className="form" style={{ maxWidth: "none" }}>
          <div className="form-row" style={{ flexWrap: "wrap" }}>
            <div className="field" style={{ flex: "1 1 240px" }}>
              <label htmlFor="legal_name">Razon social</label>
              <input id="legal_name" name="legal_name" type="text" defaultValue={organizador.legal_name} required />
            </div>
            <div className="field" style={{ flex: "1 1 160px" }}>
              <label htmlFor="nit">NIT</label>
              <input id="nit" name="nit" type="text" defaultValue={organizador.nit} required />
            </div>
          </div>
          <div className="form-row" style={{ flexWrap: "wrap" }}>
            <div className="field" style={{ flex: "1 1 200px" }}>
              <label htmlFor="contact_name">Nombre de contacto</label>
              <input id="contact_name" name="contact_name" type="text" defaultValue={organizador.contact_name ?? ""} />
            </div>
            <div className="field" style={{ flex: "1 1 160px" }}>
              <label htmlFor="contact_phone">Telefono de contacto</label>
              <input id="contact_phone" name="contact_phone" type="tel" defaultValue={organizador.contact_phone ?? ""} />
            </div>
          </div>
          <div className="field">
            <label htmlFor="contact_email">Correo de contacto</label>
            <input id="contact_email" name="contact_email" type="email" defaultValue={organizador.contact_email ?? ""} />
          </div>
          <div className="form-row" style={{ flexWrap: "wrap" }}>
            <div className="field" style={{ flex: "1 1 220px" }}>
              <label htmlFor="commercial_owner">Responsable comercial (Monarca Tickets)</label>
              <input
                id="commercial_owner"
                name="commercial_owner"
                type="text"
                placeholder="Nombre del asesor"
                defaultValue={organizador.commercial_owner ?? ""}
              />
            </div>
            <div className="field" style={{ flex: "1 1 140px" }}>
              <label htmlFor="commission_rate">Comision (%)</label>
              <input
                id="commission_rate"
                name="commission_rate"
                type="number"
                min={0}
                max={100}
                step="0.01"
                defaultValue={organizador.commission_rate}
              />
            </div>
          </div>
          <div className="field">
            <label htmlFor="notas">Notas internas</label>
            <textarea id="notas" name="notas" rows={3} defaultValue={organizador.notas ?? ""} />
          </div>
          <button type="submit" className="btn btn-primary">
            Guardar ficha
          </button>
        </form>
      </div>

      <h2>Eventos</h2>
      {!eventos || eventos.length === 0 ? (
        <p className="empty-state">Este organizador todavia no tiene eventos.</p>
      ) : (
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Evento</th>
                <th>Ciudad</th>
                <th>Fecha</th>
                <th>Estado</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {eventos.map((e) => (
                <tr key={e.id}>
                  <td>{e.name}</td>
                  <td>{e.city}</td>
                  <td>{new Date(e.starts_at).toLocaleDateString("es-CO", { timeZone: "America/Bogota" })}</td>
                  <td>
                    <span className={EVENTO_BADGE[e.status] ?? "badge"}>{e.status}</span>
                  </td>
                  <td>
                    <Link href={`/crm/eventos/${e.id}`} className="btn btn-secondary btn-sm">
                      Editar
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </main>
  );
}
