import { NextRequest, NextResponse } from "next/server";

// Notificacion de estado de una factura electronica emitida via
// Factus/Alegra (CUFE emitido, o fallo de emision). Ver seccion 05.
// TODO (Fase 3).
export async function POST(req: NextRequest) {
  return NextResponse.json({ error: "not_implemented" }, { status: 501 });
}
