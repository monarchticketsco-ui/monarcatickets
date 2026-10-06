import { NextResponse } from "next/server";

// Respuesta estandar para endpoints retirados al adoptar FourVenues como
// motor unico: HTTP 410 Gone con un mensaje que apunta a la fuente real.
export function retirado(detalle: string) {
  return NextResponse.json(
    {
      error: "gone",
      message: detalle,
      fuente: "https://docs.fourvenues.com",
    },
    { status: 410 }
  );
}
