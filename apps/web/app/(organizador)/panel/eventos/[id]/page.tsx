import { notFound } from "next/navigation";
import { requireOrganizer } from "@/lib/organizer";
import { imagenDeEvento } from "@/lib/event-visuals";
import { actualizarImagen, crearTipoDeBoleto, publicarEvento } from "./actions";

const ESTADO_BADGE: Record<string, string> = {
  borrador: "badge",
  publicado: "badge badge-blue",
  en_venta: "badge badge-green",
  finalizado: "badge",
  cancelado: "badge badge-danger",
};

export default async function GestionEventoPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ error?: string }>;
}) {
  const { id } = await params;
  const { error } = await searchParams;
  const { supabase, organizer } = await requireOrganizer();

  const { data: evento } = await supabase
    .from("events")
    .select("id, name, venue, city, category, starts_at, status, image_url")
    .eq("id", id)
    .eq("organizer_id", organizer.id)
    .single();

  if (!evento) notFound();

  const { data: tiposDeBoleto } = await supabase
    .from("ticket_types")
    .select("id, name, price_cop, capacity, sold_count")
    .eq("event_id", id)
    .order("price_cop", { ascending: false });

  const crearTipoDeBoletoConId = crearTipoDeBoleto.bind(null, id);
  const publicarEventoConId = publicarEvento.bind(null, id);
  const actualizarImagenConId = actualizarImagen.bind(null, id);

  return (
    <main className="container">
      <div style={{ display: "flex", alignItems: "center", gap: 12, flexWrap: "wrap" }}>
        <h1 style={{ marginBottom: 0 }}>{evento.name}</h1>
        <span className={ESTADO_BADGE[evento.status] ?? "badge"}>{evento.status}</span>
      </div>
      {error && <p role="alert">{error}</p>}
      <p className="page-lede">
        {evento.venue} — {evento.city} — {new Date(evento.starts_at).toLocaleString("es-CO")}
      </p>

      <h2>Imagen de banner</h2>
      <div className="card" style={{ maxWidth: 480, display: "flex", gap: 16, flexWrap: "wrap" }}>
        <img
          src={evento.image_url || imagenDeEvento(evento.id, evento.category, 300)}
          alt=""
          style={{ width: 160, aspectRatio: "16 / 10", objectFit: "cover", borderRadius: "var(--radius-sm)", flexShrink: 0 }}
        />
        <form action={actualizarImagenConId} className="form" style={{ flex: "1 1 200px" }}>
          <div className="field">
            <label htmlFor="image_url">URL de imagen</label>
            <input id="image_url" name="image_url" type="url" placeholder="https://..." defaultValue={evento.image_url ?? ""} />
            <p className="muted" style={{ fontSize: "0.82rem", margin: "2px 0 0" }}>
              Vacio = usamos una foto segun la categoria.
            </p>
          </div>
          <button type="submit" className="btn btn-secondary btn-sm">
            Guardar imagen
          </button>
        </form>
      </div>

      {evento.status === "borrador" && (
        <form action={publicarEventoConId} style={{ marginBottom: 8 }}>
          <button type="submit" className="btn btn-primary">
            Publicar (pasar a en venta)
          </button>
        </form>
      )}

      <h2>Tipos de boleto (aforo)</h2>
      {!tiposDeBoleto || tiposDeBoleto.length === 0 ? (
        <p className="empty-state">Todavia no has agregado tipos de boleto.</p>
      ) : (
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Nombre</th>
                <th>Precio</th>
                <th>Vendidos</th>
                <th>Aforo</th>
              </tr>
            </thead>
            <tbody>
              {tiposDeBoleto.map((t) => (
                <tr key={t.id}>
                  <td>{t.name}</td>
                  <td>${t.price_cop.toLocaleString("es-CO")}</td>
                  <td>{t.sold_count}</td>
                  <td>{t.capacity}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <h3>Agregar tipo de boleto</h3>
      <div className="card" style={{ maxWidth: 440 }}>
        <form action={crearTipoDeBoletoConId} className="form">
          <div className="field">
            <label htmlFor="ticket_name">Nombre</label>
            <input id="ticket_name" name="name" type="text" placeholder="General, VIP, Palco..." required />
          </div>
          <div className="field">
            <label htmlFor="price_cop">Precio (COP)</label>
            <input id="price_cop" name="price_cop" type="number" min={0} required />
          </div>
          <div className="field">
            <label htmlFor="capacity">Aforo (cupos disponibles)</label>
            <input id="capacity" name="capacity" type="number" min={1} required />
          </div>
          <button type="submit" className="btn btn-primary">
            Agregar
          </button>
        </form>
      </div>
    </main>
  );
}
