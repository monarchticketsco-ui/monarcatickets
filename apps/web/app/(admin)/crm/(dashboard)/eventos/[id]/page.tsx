import Link from "next/link";
import { notFound } from "next/navigation";
import { requireAdmin } from "@/lib/admin";
import { createAdminClient } from "@/lib/supabase/admin";
import { imagenDeEvento, CATEGORIAS } from "@/lib/event-visuals";
import {
  actualizarBannerAdmin,
  actualizarCoreAdmin,
  actualizarDetallesAdmin,
  actualizarEstadoAdmin,
  actualizarImagenAdmin,
  actualizarTipoDeBoletoAdmin,
  crearTipoDeBoletoAdmin,
  eliminarImagenLocalidadAdmin,
  subirImagenLocalidadAdmin,
} from "./actions";

const ESTADOS_EVENTO = ["borrador", "publicado", "en_venta", "finalizado", "cancelado"] as const;

const ESTADO_BADGE: Record<string, string> = {
  borrador: "badge",
  publicado: "badge badge-blue",
  en_venta: "badge badge-green",
  finalizado: "badge",
  cancelado: "badge badge-danger",
};

function inputDateTimeLocal(value: string | null): string {
  if (!value) return "";
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

export default async function EventoAdminPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ error?: string }>;
}) {
  await requireAdmin();
  const { id } = await params;
  const { error } = await searchParams;
  const admin = createAdminClient();

  const { data: evento } = await admin
    .from("events")
    .select(
      "id, name, venue, city, category, starts_at, ends_at, status, image_url, banner_url, organizer_id, doors_open_at, min_age, seating_type, capacity, food_sale, alcohol_sale, wheelchair_accessible, pregnant_allowed, venue_address, lineup, pulep_code, responsable_razon_social, responsable_nit, responsable_direccion, responsable_email, terms_extra, organizers(id, legal_name)"
    )
    .eq("id", id)
    .single();

  if (!evento) notFound();

  const organizador = evento.organizers as unknown as { id: string; legal_name: string } | null;

  const { data: tiposDeBoleto } = await admin
    .from("ticket_types")
    .select("id, name, price_cop, capacity, sold_count, etapa, sale_starts_at, sale_ends_at")
    .eq("event_id", id)
    .order("price_cop", { ascending: false });

  const { data: imagenesLocalidad } = await admin
    .from("event_location_images")
    .select("id, image_url")
    .eq("event_id", id)
    .order("created_at", { ascending: true });

  const actualizarCoreConId = actualizarCoreAdmin.bind(null, id);
  const actualizarEstadoConId = actualizarEstadoAdmin.bind(null, id);
  const actualizarImagenConId = actualizarImagenAdmin.bind(null, id);
  const actualizarBannerConId = actualizarBannerAdmin.bind(null, id);
  const actualizarDetallesConId = actualizarDetallesAdmin.bind(null, id);
  const crearTipoDeBoletoConId = crearTipoDeBoletoAdmin.bind(null, id);
  const subirImagenLocalidadConId = subirImagenLocalidadAdmin.bind(null, id);

  return (
    <>
      {organizador && (
        <p>
          <Link href={`/crm/organizadores/${organizador.id}`} className="nav-link" style={{ padding: 0 }}>
            ← {organizador.legal_name}
          </Link>
        </p>
      )}
      <div style={{ display: "flex", alignItems: "center", gap: 12, flexWrap: "wrap" }}>
        <h1 style={{ marginBottom: 0 }}>{evento.name}</h1>
        <span className={ESTADO_BADGE[evento.status] ?? "badge"}>{evento.status}</span>
      </div>
      {error && <p role="alert">{error}</p>}
      <p className="page-lede">
        {evento.venue} — {evento.city} — {new Date(evento.starts_at).toLocaleString("es-CO", { timeZone: "America/Bogota" })}
      </p>

      <h2>Estado del evento</h2>
      <div className="card" style={{ maxWidth: 420 }}>
        <form action={actualizarEstadoConId} style={{ display: "flex", gap: 8 }}>
          <select name="status" defaultValue={evento.status} style={{ minWidth: 160 }}>
            {ESTADOS_EVENTO.map((estado) => (
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

      <h2>Informacion basica</h2>
      <div className="card" style={{ maxWidth: 620 }}>
        <form action={actualizarCoreConId} className="form" style={{ maxWidth: "none" }}>
          <div className="field">
            <label htmlFor="name">Nombre del evento</label>
            <input id="name" name="name" type="text" defaultValue={evento.name} required />
          </div>
          <div className="form-row" style={{ flexWrap: "wrap" }}>
            <div className="field" style={{ flex: "1 1 200px" }}>
              <label htmlFor="venue">Lugar (venue)</label>
              <input id="venue" name="venue" type="text" defaultValue={evento.venue} required />
            </div>
            <div className="field" style={{ flex: "1 1 160px" }}>
              <label htmlFor="city">Ciudad</label>
              <input id="city" name="city" type="text" defaultValue={evento.city} required />
            </div>
          </div>
          <div className="form-row" style={{ flexWrap: "wrap" }}>
            <div className="field" style={{ flex: "1 1 200px" }}>
              <label htmlFor="category">Categoria</label>
              <select id="category" name="category" defaultValue={evento.category ?? ""}>
                <option value="">Sin categoria</option>
                {CATEGORIAS.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </div>
          </div>
          <div className="form-row" style={{ flexWrap: "wrap" }}>
            <div className="field" style={{ flex: "1 1 200px" }}>
              <label htmlFor="starts_at">Fecha y hora de inicio</label>
              <input
                id="starts_at"
                name="starts_at"
                type="datetime-local"
                defaultValue={inputDateTimeLocal(evento.starts_at)}
                required
              />
            </div>
            <div className="field" style={{ flex: "1 1 200px" }}>
              <label htmlFor="ends_at">Fecha y hora de terminacion (opcional)</label>
              <input id="ends_at" name="ends_at" type="datetime-local" defaultValue={inputDateTimeLocal(evento.ends_at)} />
            </div>
          </div>
          <button type="submit" className="btn btn-primary">
            Guardar informacion basica
          </button>
        </form>
      </div>

      <h2>Imagen de portada</h2>
      <p className="muted" style={{ maxWidth: "60ch" }}>
        Se ve en las tarjetas del listado de /eventos y como respaldo del banner. Tamano recomendado:{" "}
        <strong>1600×1000 px</strong> (proporcion 16:10).
      </p>
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
          </div>
          <button type="submit" className="btn btn-secondary btn-sm">
            Guardar imagen
          </button>
        </form>
      </div>

      <h2>Banner ancho (cabecera de la pagina del evento)</h2>
      <p className="muted" style={{ maxWidth: "60ch" }}>
        Afiche o pieza grafica del evento, se muestra arriba de todo en la pagina publica. Tamano recomendado:{" "}
        <strong>1920×840 px</strong> (proporcion ~16:7). Vacio = usamos la portada.
      </p>
      <div className="card" style={{ maxWidth: 480, display: "flex", gap: 16, flexWrap: "wrap" }}>
        {evento.banner_url && (
          <img
            src={evento.banner_url}
            alt=""
            style={{ width: 200, aspectRatio: "16 / 7", objectFit: "cover", borderRadius: "var(--radius-sm)", flexShrink: 0 }}
          />
        )}
        <form action={actualizarBannerConId} className="form" style={{ flex: "1 1 200px" }}>
          <div className="field">
            <label htmlFor="banner_url">URL del banner</label>
            <input id="banner_url" name="banner_url" type="url" placeholder="https://..." defaultValue={evento.banner_url ?? ""} />
          </div>
          <button type="submit" className="btn btn-secondary btn-sm">
            Guardar banner
          </button>
        </form>
      </div>

      <h2>Imagenes de localidades y zonas</h2>
      <p className="muted" style={{ maxWidth: "60ch" }}>
        Fotos o mapas de las localidades/zonas del venue. Tamano recomendado: <strong>1080×1080 px</strong>.
      </p>
      {imagenesLocalidad && imagenesLocalidad.length > 0 && (
        <div className="gallery-grid">
          {imagenesLocalidad.map((img) => (
            <div className="gallery-item" key={img.id}>
              <img src={img.image_url} alt="" />
              <form action={eliminarImagenLocalidadAdmin.bind(null, img.id, id)}>
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

      <h2>Detalles del evento</h2>
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
              <input id="venue_address" name="venue_address" type="text" defaultValue={evento.venue_address ?? ""} />
              <p className="muted" style={{ fontSize: "0.82rem", margin: "2px 0 0" }}>
                <a
                  href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
                    [evento.venue, evento.venue_address, evento.city, "Colombia"].filter(Boolean).join(", ")
                  )}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-link"
                >
                  Ver ubicacion actual en Google Maps
                </a>
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
              <input id="pulep_code" name="pulep_code" type="text" defaultValue={evento.pulep_code ?? ""} />
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
              <input id="responsable_email" name="responsable_email" type="email" defaultValue={evento.responsable_email ?? ""} />
            </div>
          </fieldset>

          <fieldset>
            <legend>Terminos especificos del evento (opcional)</legend>
            <div className="field">
              <label htmlFor="terms_extra">Terminos y condiciones adicionales</label>
              <textarea id="terms_extra" name="terms_extra" rows={3} defaultValue={evento.terms_extra ?? ""} />
            </div>
          </fieldset>

          <button type="submit" className="btn btn-primary">
            Guardar detalles
          </button>
        </form>
      </div>

      <h2>Localidades y precios (tipos de boleto)</h2>
      <p className="muted" style={{ maxWidth: "60ch" }}>
        Si el mismo lugar tiene varias etapas de precio (preventa, etapa 2...), crea una fila por etapa con el
        mismo nombre y sus fechas de venta.
      </p>
      {!tiposDeBoleto || tiposDeBoleto.length === 0 ? (
        <p className="empty-state">Este evento todavia no tiene tipos de boleto.</p>
      ) : (
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Nombre</th>
                <th>Etapa</th>
                <th>Precio (COP)</th>
                <th>Vendidos</th>
                <th>Aforo</th>
                <th>Venta desde</th>
                <th>Venta hasta</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {tiposDeBoleto.map((t) => (
                <tr key={t.id}>
                  <td colSpan={8} style={{ padding: 0 }}>
                    <form
                      action={actualizarTipoDeBoletoAdmin.bind(null, id, t.id)}
                      style={{ display: "flex", alignItems: "center", gap: 8, padding: "8px 12px", flexWrap: "wrap" }}
                    >
                      <input name="name" type="text" defaultValue={t.name} required style={{ maxWidth: 160 }} aria-label="Nombre" />
                      <input
                        name="etapa"
                        type="text"
                        placeholder="Preventa, Etapa 2..."
                        defaultValue={t.etapa ?? ""}
                        style={{ maxWidth: 130 }}
                        aria-label="Etapa"
                      />
                      <input
                        name="price_cop"
                        type="number"
                        min={0}
                        defaultValue={t.price_cop}
                        required
                        style={{ maxWidth: 130 }}
                        aria-label="Precio COP"
                      />
                      <span className="muted" style={{ fontSize: "0.82rem" }}>
                        vendidos: {t.sold_count}
                      </span>
                      <input
                        name="capacity"
                        type="number"
                        min={t.sold_count}
                        defaultValue={t.capacity}
                        required
                        style={{ maxWidth: 110 }}
                        aria-label="Aforo"
                      />
                      <input
                        name="sale_starts_at"
                        type="datetime-local"
                        defaultValue={inputDateTimeLocal(t.sale_starts_at)}
                        aria-label="Venta desde"
                      />
                      <input
                        name="sale_ends_at"
                        type="datetime-local"
                        defaultValue={inputDateTimeLocal(t.sale_ends_at)}
                        aria-label="Venta hasta"
                      />
                      <button type="submit" className="btn btn-secondary btn-sm">
                        Guardar
                      </button>
                    </form>
                  </td>
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
            <label htmlFor="etapa">Etapa (opcional)</label>
            <input id="etapa" name="etapa" type="text" placeholder="Preventa, Etapa 2, Etapa unica..." />
          </div>
          <div className="field">
            <label htmlFor="price_cop">Precio (COP)</label>
            <input id="price_cop" name="price_cop" type="number" min={0} required />
          </div>
          <div className="field">
            <label htmlFor="capacity">Aforo (cupos disponibles)</label>
            <input id="capacity" name="capacity" type="number" min={1} required />
          </div>
          <div className="form-row" style={{ flexWrap: "wrap" }}>
            <div className="field" style={{ flex: "1 1 180px" }}>
              <label htmlFor="sale_starts_at">Venta desde (opcional)</label>
              <input id="sale_starts_at" name="sale_starts_at" type="datetime-local" />
            </div>
            <div className="field" style={{ flex: "1 1 180px" }}>
              <label htmlFor="sale_ends_at">Venta hasta (opcional)</label>
              <input id="sale_ends_at" name="sale_ends_at" type="datetime-local" />
            </div>
          </div>
          <button type="submit" className="btn btn-primary">
            Agregar
          </button>
        </form>
      </div>
    </>
  );
}
