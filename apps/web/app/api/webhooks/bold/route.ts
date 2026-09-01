import { NextRequest, NextResponse } from "next/server";

// Paso 5 del flujo de pago (blueprint Fig. 3): unica fuente de verdad de
// que un pago se confirmo.
//
// TODO (Fase 2):
//   1. Verificar la firma del webhook (confirmar el esquema exacto con
//      soporte de Bold — no esta detallado en la doc publica).
//   2. Idempotencia: si bold_payment_id ya existe en `orders` como
//      'pagada', responder 200 sin reprocesar.
//   3. Marcar la orden como 'pagada' dentro de una transaccion que
//      tambien confirma sold_count en ticket_types.
//   4. Encolar (no ejecutar inline): generar boletos QR, emitir factura
//      DIAN, notificar al comprador. Ver seccion 01, Fig. 1.
export async function POST(req: NextRequest) {
  return NextResponse.json({ error: "not_implemented" }, { status: 501 });
}
