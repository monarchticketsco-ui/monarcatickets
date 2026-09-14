import { requireAdmin } from "@/lib/admin";
import { revocarApiCliente } from "../actions";
import { ApiClientForm } from "../api-client-form";

export default async function IntegracionesPage() {
  const { supabase } = await requireAdmin();

  const { data: apiClientesData } = await supabase
    .from("api_clients")
    .select("id, company_name, scopes, rate_limit_per_min, created_at")
    .order("created_at", { ascending: false });

  const apiClientes = apiClientesData ?? [];

  return (
    <>
      <h1>Integraciones</h1>
      <p className="page-lede">
        Llaves para integradores externos (bot de WhatsApp, apps de socios, etc.) que consumen la API publica en{" "}
        <code>/api/v1</code>. La llave en texto plano solo se muestra una vez, al crearla.
      </p>

      {apiClientes.length === 0 ? (
        <p className="empty-state">Todavia no hay credenciales de API generadas.</p>
      ) : (
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Integrador</th>
                <th>Scopes</th>
                <th>Limite/min</th>
                <th>Creada</th>
                <th>Revocar</th>
              </tr>
            </thead>
            <tbody>
              {apiClientes.map((cliente) => (
                <tr key={cliente.id}>
                  <td>{cliente.company_name}</td>
                  <td>
                    {(cliente.scopes ?? []).map((scope: string) => (
                      <span key={scope} className="badge badge-blue" style={{ marginRight: 6 }}>
                        {scope}
                      </span>
                    ))}
                  </td>
                  <td>{cliente.rate_limit_per_min}</td>
                  <td>{new Date(cliente.created_at).toLocaleDateString("es-CO", { timeZone: "America/Bogota" })}</td>
                  <td>
                    <form
                      action={async () => {
                        "use server";
                        await revocarApiCliente(cliente.id);
                      }}
                    >
                      <button type="submit" className="btn btn-secondary btn-sm">
                        Revocar
                      </button>
                    </form>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <div style={{ marginTop: 16 }}>
        <ApiClientForm />
      </div>
    </>
  );
}
