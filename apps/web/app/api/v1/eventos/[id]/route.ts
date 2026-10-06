import { retirado } from "@/lib/retirada";

// Endpoint retirado: FourVenues es el motor unico de eventos, precios, checkout y tickets.
const respuesta = () => retirado("La API publica de eventos de Monarca fue retirada. Consulta los eventos directamente en la API de FourVenues (Channel Manager).");

export const GET = respuesta;
export const POST = respuesta;
export const PUT = respuesta;
export const PATCH = respuesta;
export const DELETE = respuesta;
