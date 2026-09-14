import { requireAdmin } from "@/lib/admin";
import { actualizarEstadoPqrs } from "./actions";

const TIPO_LABEL: Record<string, string> = {
  peticion: "Peticion",
  queja: "Queja",
  reclamo: "Reclamo",
  sugerencia: "Sugerencia",
  soporte_compra: "Soporte de compra",
};

const CANAL_LABEL: Record<string, string> = {
  sitio_web: "Sitio web",
  whatsapp: "WhatsApp",
  api: "API",
  correo: "Correo",
};

const ESTADO_BADGE: Record<string, string> = {
  abierta: "badge badge-danger",
  en_proceso: "badge badge-warning",
  cerrada: "badge badge-green",
};

export default async function PqrsPage() {
  const { supabase } = await requireAdmin();

  const { data: solicitudes } = await supabase
    .from("pqrs_solicitudes")
    .select("id, tipo, canal, nombre, correo, telefono, referencia_orden, mensaje, estado, created_at")
    .order("created_at", { ascending: false })
    .limit(300);

  const items = solicitudes ?? [];
  const pendientes = items.filter((s) => s.estado !== "cerrada").length;

  return (
    <>
      <h1>PQRS</h1>
      <p className="page-lede">Peticiones, quejas, reclamos y sugerencias recibidas por el sitio, WhatsApp o la API.</p>

      <div className="stat-grid">
        <div className="stat-card">
          <div className="value">{items.length}</div>
          <div className="label">Total</div>
        </div>
        <div className="stat-card">
          <div className="value">{pendientes}</div>
          <div className="label">Pendientes</div>
        </div>
      </div>

      {items.length === 0 ? (
        <p className="empty-state">Todavia no hay solicitudes.</p>
      ) : (
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Fecha</th>
                <th>Tipo</th>
                <th>Solicitante</th>
                <th>Canal</th>
                <th>Mensaje</th>
                <th>Estado</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {items.map((s) => (
                <tr key={s.id}>
                  <td>{new Date(s.created_at).toLocaleDateString("es-CO", { timeZone: "America/Bogota" })}</td>
                  <td>{TIPO_LABEL[s.tipo] ?? s.tipo}</td>
                  <td style={{ whiteSpace: "normal" }}>
                    {s.nombre}
                    <br />
                    <span className="muted">
                      {s.correo}
                      {s.telefono ? ` · ${s.telefono}` : ""}
                    </span>
                  </td>
                  <td>{CANAL_LABEL[s.canal] ?? s.canal}</td>
                  <td style={{ maxWidth: 260, whiteSpace: "normal" }}>
                    {s.mensaje}
                    {s.referencia_orden && (
                      <>
                        <br />
                        <span className="muted">Orden: {s.referencia_orden}</span>
                      </>
                    )}
                  </td>
                  <td>
                    <span className={ESTADO_BADGE[s.estado] ?? "badge"}>{s.estado}</span>
                  </td>
                  <td style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                    {s.estado !== "en_proceso" && s.estado !== "cerrada" && (
                      <form
                        action={async () => {
                          "use server";
                          await actualizarEstadoPqrs(s.id, "en_proceso");
                        }}
                      >
                        <button type="submit" className="btn btn-secondary btn-sm">
                          En proceso
                        </button>
                      </form>
                    )}
                    {s.estado !== "cerrada" && (
                      <form
                        action={async () => {
                          "use server";
                          await actualizarEstadoPqrs(s.id, "cerrada");
                        }}
                      >
                        <button type="submit" className="btn btn-secondary btn-sm">
                          Cerrar
                        </button>
                      </form>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </>
  );
}
