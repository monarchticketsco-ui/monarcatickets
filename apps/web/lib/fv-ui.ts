
/** Valor en pesos con formato colombiano, sin decimales. */
export function dineroCOP(valor: number, moneda = "COP"): string {
  return valor.toLocaleString("es-CO", { style: "currency", currency: moneda || "COP", maximumFractionDigits: 0 });
}

export type EstadoBoleto = { texto: string; tono: "ok" | "info" | "malo" | "neutro" };

/** Estado de un boleto de FourVenues, en español, para Mi cuenta y el Panel Polinizador. */
export function estadoBoleto(t: { status: string; entry_time?: string | null }): EstadoBoleto {
  if (t.status === "refunded") return { texto: "Reembolsada", tono: "malo" };
  if (t.status === "cancelled" || t.status === "canceled") return { texto: "Cancelada", tono: "malo" };
  if (t.entry_time || t.status === "used") return { texto: "Ya ingresó", tono: "neutro" };
  if (t.status === "active") return { texto: "Activa", tono: "ok" };
  const limpio = (t.status || "").replace(/[_-]/g, " ").trim();
  return { texto: limpio ? limpio.charAt(0).toUpperCase() + limpio.slice(1) : "Activa", tono: "info" };
}

/** Boletos vendidos por dia en los ultimos `dias` dias (hora de Bogota); null si FourVenues no entrega fecha de creacion. */
export function serieDiaria(tickets: { created_at?: string }[], dias = 30): number[] | null {
  if (!tickets.some((t) => t.created_at)) return null;
  const fmt = (d: Date) => d.toLocaleDateString("en-CA", { timeZone: "America/Bogota" });
  const hoy = new Date();
  const llaves: string[] = [];
  for (let i = dias - 1; i >= 0; i--) llaves.push(fmt(new Date(hoy.getTime() - i * 86400000)));
  const cuenta = new Map<string, number>(llaves.map((k) => [k, 0]));
  for (const t of tickets) {
    if (!t.created_at) continue;
    const k = fmt(new Date(t.created_at));
    if (cuenta.has(k)) cuenta.set(k, (cuenta.get(k) ?? 0) + 1);
  }
  return llaves.map((k) => cuenta.get(k) ?? 0);
}
