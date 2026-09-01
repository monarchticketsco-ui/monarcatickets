import { NextRequest, NextResponse } from "next/server";

// Paso 2 del flujo de pago (blueprint Fig. 3):
// recibe { ticketTypeId, quantity } del comprador, valida contra el cupo
// disponible (ticket_types.capacity - sold_count), crea un "hold" con
// expiracion (8-10 min, ver seccion 06), crea la orden en estado
// 'pendiente' y llama a la API de Bold para crear el intento de pago.
// TODO (Fase 2).
export async function POST(req: NextRequest) {
  return NextResponse.json({ error: "not_implemented" }, { status: 501 });
}
