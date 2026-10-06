// Formatos compartidos para mostrar datos de FourVenues tal cual los
// entrega la API (la pagina espejo no inventa ni reinterpreta fechas).
import type { FVEvent, FVTicketRate } from "@/lib/fourvenues";

const TZ = "America/Bogota";

/** Fecha de promocion del evento (display_date): la que FourVenues muestra al publico. */
export function fechaEvento(e: Pick<FVEvent, "display_date" | "start_date">, estilo: "long" | "full" = "long"): string {
  return new Date(e.display_date || e.start_date).toLocaleDateString("es-CO", { dateStyle: estilo, timeZone: TZ });
}

/** Fecha corta para tarjetas del catalogo. */
export function fechaCorta(e: Pick<FVEvent, "display_date" | "start_date">): string {
  return new Date(e.display_date || e.start_date).toLocaleDateString("es-CO", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    timeZone: TZ,
  });
}

/** Horario real (start_date - end_date), p. ej. "12:00 a. m. – 7:30 a. m.". */
export function horarioEvento(e: Pick<FVEvent, "start_date" | "end_date">): string {
  const f = (iso: string) =>
    new Date(iso).toLocaleTimeString("es-CO", { hour: "numeric", minute: "2-digit", timeZone: TZ });
  return e.end_date ? `${f(e.start_date)} – ${f(e.end_date)}` : f(e.start_date);
}

/** Un evento sigue vigente hasta que termina (end_date), no cuando empieza. */
export function eventoVigente(e: Pick<FVEvent, "end_date" | "start_date">): boolean {
  return new Date(e.end_date || e.start_date).getTime() >= Date.now();
}

export type EstadoTarifa = { tipo: "disponible" | "agotado" | "no-iniciada" | "no-disponible"; texto: string };

/** Estado de venta de una tarifa segun los campos reales de FourVenues. */
export function estadoTarifa(t: FVTicketRate): EstadoTarifa {
  const disponibles = t.availability?.available ?? 0;
  if (t.valid_from && new Date(t.valid_from).getTime() > Date.now()) {
    return {
      tipo: "no-iniciada",
      texto: `Venta desde ${new Date(t.valid_from).toLocaleDateString("es-CO", { day: "2-digit", month: "short", timeZone: TZ })}`,
    };
  }
  if (t.available && disponibles > 0) return { tipo: "disponible", texto: `${disponibles} disponibles` };
  if ((t.availability?.sold ?? 0) > 0 && disponibles <= 0) return { tipo: "agotado", texto: "Agotado" };
  return { tipo: "no-disponible", texto: "No disponible" };
}

export const ARTISTAS_ETIQUETA = (g: string) => g.replace(/-/g, " ");
