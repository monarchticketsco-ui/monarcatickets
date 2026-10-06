import { requireAdmin } from "@/lib/admin";
import { getFourvenuesEvents } from "@/lib/fourvenues";

export const dynamic = "force-dynamic";

export default async function IntegracionesPage() {
  await requireAdmin();

  const configurada = Boolean(process.env.FOURVENUES_CHANNEL_API_KEY);
  let eventos: Awaited<ReturnType<typeof getFourvenuesEvents>> = [];
  let conectado = false;
  if (configurada) {
    try {
      eventos = await getFourvenuesEvents({ incluirPasados: true });
      conectado = true;
    } catch {
      conectado = false;
    }
  }

  return (
    <>
      <h1>Integraciones</h1>
      <p className="page-lede">
        FourVenues es el motor unico de Monarca Tickets: eventos, localidades, precios, checkout y tickets. Esta pagina
        solo muestra el estado de esa conexion.
      </p>

      <div className="stat-grid">
        <div className="stat-card">
          <div className="value" style={{ fontSize: "1.1rem" }}>
            <span className={conectado ? "badge badge-green" : "badge badge-danger"}>
              {conectado ? "Conectado" : configurada ? "Sin respuesta" : "Sin llave"}
            </span>
          </div>
          <div className="label">FourVenues Channel Manager</div>
        </div>
        <div className="stat-card">
          <div className="value">{eventos.length}</div>
          <div className="label">Eventos visibles para el canal</div>
        </div>
      </div>

      <div className="card" style={{ maxWidth: 640 }}>
        <p style={{ marginTop: 0 }}>
          <strong>API para socios e integradores.</strong> Monarca ya no publica una API propia (<code>/api/v1</code>
          fue retirada): cualquier integracion de terceros debe usar directamente la API de FourVenues, que es la
          fuente de la informacion.
        </p>
        <p className="muted" style={{ marginBottom: 0 }}>
          Documentacion: docs.fourvenues.com. La llave del canal vive en las variables de entorno del servidor
          (FOURVENUES_CHANNEL_API_KEY) y nunca se muestra en pantalla.
        </p>
      </div>
    </>
  );
}
