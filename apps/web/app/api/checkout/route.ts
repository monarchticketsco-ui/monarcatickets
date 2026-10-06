import { retirado } from "@/lib/retirada";

// Endpoint retirado: FourVenues es el motor unico de eventos, precios, checkout y tickets.
const respuesta = () => retirado("El checkout con Bold fue retirado. El pago se hace con el checkout de FourVenues (/api/checkout-fv).");

export const GET = respuesta;
export const POST = respuesta;
export const PUT = respuesta;
export const PATCH = respuesta;
export const DELETE = respuesta;
