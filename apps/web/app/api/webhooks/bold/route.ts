import { retirado } from "@/lib/retirada";

// Endpoint retirado: FourVenues es el motor unico de eventos, precios, checkout y tickets.
const respuesta = () => retirado("Webhook de Bold retirado: Monarca ya no procesa pagos con Bold.");

export const POST = respuesta;
export const GET = respuesta;
