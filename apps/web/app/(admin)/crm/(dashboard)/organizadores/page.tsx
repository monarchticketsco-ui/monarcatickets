import Link from "next/link";
import { requireAdmin } from "@/lib/admin";
import { actualizarDianStatus } from "../actions";
import { actualizarEstadoLead } from "./actions";

const ESTADOS_DIAN = ["no_habilitado", "en_proceso", "habilitado"] as const;

const DIAN_BADGE: Record<string, string> = {
  no_habilitado: "badge badge-danger",
  en_proceso: "badge badge-warning",
  habilitado: "badge badge-green",
};

const LEAD_BADGE: Record<string, string> = {
  nuevo: "badge badge-blue",
  contactado: "badge badge-warning",
  convertido: "badge badge-green",
  descartado: "badge",
};

export default async function OrganizadoresPage() {
  const { supabase } = await requireAdmin();

  const [organizersRes, leadsRes] = await Promise.all([
    supabase
      .from("organizers")
      .select("id, legal_name, nit, dian_status, commission_rate, events(count)")
      .order("legal_name", { ascending: true }),
    supabase
      .from("empresa_leads")
      .select("id, nombre, empresa, correo, telefono, mensaje, estado, created_at")
      .order("created_at", { ascending: false })
      .limit(30),
  ]);

  const organizadores = organizersRes.data ?? [];
  const leads = leadsRes.data ?? [];

  return (
    <>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 8 }}>
        <h1 style={{ marginBottom: 0 }}>Organizadores</h1>
        <Link href="/crm/organizadores/nuevo" className="btn btn-primary btn-sm">
          + Crear cuenta de empresa
        </Link>
      </div>
      <p className="page-lede">Empresas con acceso al portal empresas y su estado de habilitacion DIAN.</p>

      {organizadores.length === 0 ? (
        <p className="empty-state">Todavia no hay organizadores registrados.</p>
      ) : (
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Razon social</th>
                <th>NIT</th>
                <th>Comision</th>
                <th>Eventos</th>
                <th title="Habilitacion ante la DIAN para facturar electronicamente">Estado DIAN</th>
                <th>Cambiar estado</th>
              </tr>
            </thead>
            <tbody>
              {organizadores.map((o) => {
                const totalEventos = Array.isArray(o.events) ? (o.events[0]?.count ?? 0) : 0;
                return (
                  <tr key={o.id}>
                    <td>
                      <Link href={`/crm/organizadores/${o.id}`} className="text-link">
                        {o.legal_name}
                      </Link>
                    </td>
                    <td>{o.nit}</td>
                    <td>{o.commission_rate}%</td>
                    <td>{totalEventos}</td>
                    <td>
                      <span className={DIAN_BADGE[o.dian_status] ?? "badge"}>{o.dian_status}</span>
                    </td>
                    <td>
                      <form
                        action={async (formData: FormData) => {
                          "use server";
                          const nuevoEstado = String(formData.get("dian_status")) as
                            | "no_habilitado"
                            | "en_proceso"
                            | "habilitado";
                          await actualizarDianStatus(o.id, nuevoEstado);
                        }}
                        style={{ display: "flex", gap: 8 }}
                      >
                        <select name="dian_status" defaultValue={o.dian_status} style={{ minWidth: 140 }}>
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
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      <h2>Solicitudes de empresas (portal empresas)</h2>
      <p className="page-lede">
        Clientes potenciales que dejaron sus datos en /empresas para vender boletos con nosotros. Contactalos y crea
        su cuenta cuando esten listos.
      </p>
      {leads.length === 0 ? (
        <p className="empty-state">Todavia no hay solicitudes.</p>
      ) : (
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Fecha</th>
                <th>Nombre</th>
                <th>Empresa</th>
                <th>Contacto</th>
                <th>Mensaje</th>
                <th>Estado</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {leads.map((lead) => (
                <tr key={lead.id}>
                  <td>{new Date(lead.created_at).toLocaleDateString("es-CO", { timeZone: "America/Bogota" })}</td>
                  <td>{lead.nombre}</td>
                  <td>{lead.empresa ?? "—"}</td>
                  <td>
                    {lead.correo}
                    {lead.telefono ? ` · ${lead.telefono}` : ""}
                  </td>
                  <td style={{ maxWidth: 220, whiteSpace: "normal" }}>{lead.mensaje ?? "—"}</td>
                  <td>
                    <span className={LEAD_BADGE[lead.estado] ?? "badge"}>{lead.estado}</span>
                  </td>
                  <td style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                    {lead.estado !== "contactado" && (
                      <form
                        action={async () => {
                          "use server";
                          await actualizarEstadoLead(lead.id, "contactado");
                        }}
                      >
                        <button type="submit" className="btn btn-secondary btn-sm">
                          Contactado
                        </button>
                      </form>
                    )}
                    {lead.estado !== "descartado" && lead.estado !== "convertido" && (
                      <form
                        action={async () => {
                          "use server";
                          await actualizarEstadoLead(lead.id, "descartado");
                        }}
                      >
                        <button type="submit" className="btn btn-secondary btn-sm">
                          Descartar
                        </button>
                      </form>
                    )}
                    {lead.estado !== "convertido" && (
                      <Link
                        href={`/crm/organizadores/nuevo?nombre=${encodeURIComponent(lead.nombre)}&empresa=${encodeURIComponent(
                          lead.empresa ?? ""
                        )}&correo=${encodeURIComponent(lead.correo)}&telefono=${encodeURIComponent(
                          lead.telefono ?? ""
                        )}&leadId=${lead.id}`}
                        className="btn btn-primary btn-sm"
                      >
                        Crear cuenta
                      </Link>
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
