import { notFound } from "next/navigation";
import { requireOrganizer } from "@/lib/organizer";
import { imagenDeEvento } from "@/lib/event-visuals";
import {
  actualizarDetalles,
  actualizarImagen,
  crearTipoDeBoleto,
  eliminarImagenLocalidad,
  publicarEvento,
  subirImagenLocalidad,
} from "./actions";

const ESTADO_BADGE: Record<string, string> = {
  borrador: "badge",
  publicado: "badge badge-blue",
  en_venta: "badge badge-green",
  finalizado: "badge",
  cancelado: "badge badge-danger",
};

function inputDateTimeLocal(value: string | null): string {
  if (!value) return "";
  // <input type="datetime-local"> espera "YYYY-MM-DDTHH:mm" en hora local.
  const d = new Date(value);
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

function selectSiNo(name: string, actual: boolean | null) {
  return (
    <select id={name} name={name} defaultValue={actual === null ? "" : actual ? "si" : "no"}>
      <option value="">Sin especificar</option>
      <option value="si">Si</option>
      <option value="no">No</option>
    </select>
  );
}

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
    .select(
      "id, name, venue, city, category, starts_at, status, image_url, doors_open_at, min_age, seating_type, capacity, food_sale, alcohol_sale, wheelchair_accessible, pregnant_allowed, venue_address, lineup, pulep_code, responsable_razon_social, responsable_nit, responsable_direccion, responsable_email, terms_extra"
    )
    .eq("id", id)
    .eq("organizer_id", organizer.id)
    .single();

  if (!evento) notFound();

  const [{ data: tiposDeBoleto }, { data: imagenesLocalidad }] = await Promise.all([
    supabase
      .from("ticket_types")
      .select("id, name, price_cop, capacity, sold_count")
      .eq("event_id", id)
      .order("price_cop", { ascending: false }),
    supabase
      .from("event_location_images")
      .select("id, image_url")
      .eq("event_id", id)
      .order("created_at", { ascending: true }),
  ]);

  const crearTipoDeBoletoConId = crearTipoDeBoleto.bind(null, id);
  const publicarEventoConId = publicarEvento.bind(null, id);
  const actualizarImagenConId = actualizarImagen.bind(null, id);
  const actualizarDetallesConId = actualizarDetalles.bind(null, id);
  const subirImagenLocalidadConId = subirImagenLocalidad.bind(null, id);

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

      <h2>Detalles del evento</h2>
      <p className="muted" style={{ maxWidth: "60ch" }}>
        Esta informacion aparece en la pagina publica del evento (ficha tecnica, ubicacion y datos legales). Todo es
        opcional, pero entre mas completo, mas confianza le da al comprador.
      </p>
      <div className="card" style={{ maxWidth: 620 }}>
        <form action={actualizarDetallesConId} className="form" style={{ maxWidth: "none" }}>
          <fieldset>
            <legend>Ficha tecnica</legend>
            <div className="form-row" style={{ flexWrap: "wrap" }}>
              <div className="field" style={{ flex: "1 1 200px" }}>
                <label htmlFor="doors_open_at">Apertura de puertas</label>
                <input
                  id="doors_open_at"
                  name="doors_open_at"
                  type="datetime-local"
                  defaultValue={inputDateTimeLocal(evento.doors_open_at)}
                />
              </div>
              <div className="field" style={{ flex: "1 1 140px" }}>
                <label htmlFor="min_age">Edad minima</label>
                <input id="min_age" name="min_age" type="number" min={0} max={99} defaultValue={evento.min_age ?? ""} />
              </div>
            </div>
            <div className="form-row" style={{ flexWrap: "wrap" }}>
              <div className="field" style={{ flex: "1 1 200px" }}>
                <label htmlFor="seating_type">Acomodacion</label>
                <select id="seating_type" name="seating_type" defaultValue={evento.seating_type ?? ""}>
                  <option value="">Sin especificar</option>
                  <option value="libre">En orden de llegada</option>
                  <option value="numerada">Numerada</option>
                </select>
              </div>
              <div className="field" style={{ flex: "1 1 140px" }}>
                <label htmlFor="event_capacity">Aforo total</label>
                <input id="event_capacity" name="capacity" type="number" min={1} defaultValue={evento.capacity ?? ""} />
              </div>
            </div>
            <div className="form-row" style={{ flexWrap: "wrap" }}>
              <div className="field" style={{ flex: "1 1 140px" }}>
                <label htmlFor="food_sale">Venta de comida</label>
                {selectSiNo("food_sale", evento.food_sale)}
              </div>
              <div className="field" style={{ flex: "1 1 140px" }}>
                <label htmlFor="alcohol_sale">Venta de licor</label>
                {selectSiNo("alcohol_sale", evento.alcohol_sale)}
              </div>
            </div>
            <div className="form-row" style={{ flexWrap: "wrap" }}>
              <div className="field" style={{ flex: "1 1 200px" }}>
                <label htmlFor="wheelchair_accessible">Acceso movilidad reducida</label>
                {selectSiNo("wheelchair_accessible", evento.wheelchair_accessible)}
              </div>
              <div className="field" style={{ flex: "1 1 200px" }}>
                <label htmlFor="pregnant_allowed">Acceso mujeres embarazadas</label>
                {selectSiNo("pregnant_allowed", evento.pregnant_allowed)}
              </div>
            </div>
          </fieldset>

          <fieldset>
            <legend>Ubicacion y artistas</legend>
            <div className="field">
              <label htmlFor="venue_address">Direccion exacta del venue</label>
              <input
                id="venue_address"
                name="venue_address"
                type="text"
                placeholder="Cra. 44 #48-18, barrio..."
                defaultValue={evento.venue_address ?? ""}
              />
              <p className="muted" style={{ fontSize: "0.82rem", margin: "2px 0 0" }}>
                Se usa para el mapa en la pagina del evento. Si la dejas vacia, el mapa busca por el nombre del venue
                y la ciudad.
              </p>
            </div>
            <div className="field">
              <label htmlFor="lineup">Artistas principales</label>
              <textarea id="lineup" name="lineup" rows={2} defaultValue={evento.lineup ?? ""} />
            </div>
          </fieldset>

          <fieldset>
            <legend>Cumplimiento legal (PULEP)</legend>
            <div className="field">
              <label htmlFor="pulep_code">Codigo PULEP</label>
              <input id="pulep_code" name="pulep_code" type="text" placeholder="Ej. VCR550" defaultValue={evento.pulep_code ?? ""} />
            </div>
            <div className="field">
              <label htmlFor="responsable_razon_social">Razon social del responsable</label>
              <input
                id="responsable_razon_social"
                name="responsable_razon_social"
                type="text"
                defaultValue={evento.responsable_razon_social ?? ""}
              />
            </div>
            <div className="form-row" style={{ flexWrap: "wrap" }}>
              <div className="field" style={{ flex: "1 1 200px" }}>
                <label htmlFor="responsable_nit">NIT</label>
                <input id="responsable_nit" name="responsable_nit" type="text" defaultValue={evento.responsable_nit ?? ""} />
              </div>
              <div className="field" style={{ flex: "2 1 260px" }}>
                <label htmlFor="responsable_direccion">Direccion legal</label>
                <input
                  id="responsable_direccion"
                  name="responsable_direccion"
                  type="text"
                  defaultValue={evento.responsable_direccion ?? ""}
                />
              </div>
            </div>
            <div className="field">
              <label htmlFor="responsable_email">Correo de contacto / notificaciones</label>
              <input
                id="responsable_email"
                name="responsable_email"
                type="email"
                defaultValue={evento.responsable_email ?? ""}
              />
            </div>
          </fieldset>

          <fieldset>
            <legend>Terminos especificos del evento (opcional)</legend>
            <div className="field">
              <label htmlFor="terms_extra">Terminos y condiciones adicionales</label>
              <textarea
                id="terms_extra"
                name="terms_extra"
                rows={3}
                placeholder="Reglas propias del evento, ademas de las condiciones generales de Monarca Tickets."
                defaultValue={evento.terms_extra ?? ""}
              />
            </div>
          </fieldset>

          <button type="submit" className="btn btn-primary">
            Guardar detalles
          </button>
        </form>
      </div>

      <h2>Imagenes de localidades y zonas</h2>
      <p className="muted" style={{ maxWidth: "60ch" }}>
        Sube fotos o mapas de las localidades/zonas del venue (recomendado 1080x1080 px). Se muestran en la pagina
        publica del evento para que el comprador sepa donde queda cada zona.
      </p>
      {imagenesLocalidad && imagenesLocalidad.length > 0 && (
        <div className="gallery-grid">
          {imagenesLocalidad.map((img) => (
            <div className="gallery-item" key={img.id}>
              <img src={img.image_url} alt="" />
              <form action={eliminarImagenLocalidad.bind(null, img.id, id)}>
                <button type="submit" className="btn btn-secondary btn-sm">
                  Eliminar
                </button>
              </form>
            </div>
          ))}
        </div>
      )}
      <div className="card" style={{ maxWidth: 420 }}>
        <form action={subirImagenLocalidadConId} className="form" encType="multipart/form-data">
          <div className="field">
            <label htmlFor="imagen">Subir imagen (1080x1080 recomendado)</label>
            <input id="imagen" name="imagen" type="file" accept="image/*" required />
          </div>
          <button type="submit" className="btn btn-secondary btn-sm">
            Subir imagen
          </button>
        </form>
      </div>

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
