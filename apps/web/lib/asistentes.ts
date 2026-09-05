// Validacion compartida de los "asistentes" (nombre + cedula) que se
// capturan en el checkout -- uno por cada unidad de boleto comprada.
// Usado tanto por /api/checkout (sitio web) como por /api/v1/ordenes
// (API publica / bot de WhatsApp), para que las dos vias de compra
// exijan exactamente los mismos datos.
export type Asistente = { nombre: string; documento: string };

export function validarAsistentes(
  asistentes: unknown,
  cantidad: number
): { ok: true; asistentes: Asistente[] } | { ok: false; error: string } {
  if (!Array.isArray(asistentes) || asistentes.length !== cantidad) {
    return {
      ok: false,
      error: `Se requiere un asistente (nombre y cedula) por cada boleto -- ${cantidad} en total.`,
    };
  }

  const limpios: Asistente[] = [];
  for (const raw of asistentes) {
    const a = raw as { nombre?: unknown; documento?: unknown } | null;
    const nombre = typeof a?.nombre === "string" ? a.nombre.trim() : "";
    const documento = typeof a?.documento === "string" ? a.documento.trim() : "";

    if (nombre.length < 3 || nombre.length > 120) {
      return { ok: false, error: "Cada asistente necesita un nombre completo valido." };
    }
    if (!/^[0-9]{5,15}$/.test(documento)) {
      return { ok: false, error: "Cada asistente necesita un numero de cedula valido (solo numeros, sin puntos)." };
    }
    limpios.push({ nombre, documento });
  }

  return { ok: true, asistentes: limpios };
}
