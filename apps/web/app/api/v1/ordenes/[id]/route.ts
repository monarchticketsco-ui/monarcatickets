import { retirado } from "@/lib/retirada";

// Endpoint retirado: FourVenues es el motor unico de eventos, precios, checkout y tickets.
const respuesta = () => retirado("La API publica de ordenes de Monarca fue retirada. Las compras y tickets se gestionan en FourVenues.");

export const GET = respuesta;
export const POST = respuesta;
export const PUT = respuesta;
export const PATCH = respuesta;
export const DELETE = respuesta;
