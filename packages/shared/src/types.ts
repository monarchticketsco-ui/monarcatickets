// Tipos que reflejan el esquema de supabase/migrations/0001_init.sql
// (blueprint seccion 02). Mantener sincronizados a mano por ahora; en
// Fase 1 se puede generar esto automaticamente con
// `supabase gen types typescript`.

export type UserRole = "comprador" | "organizador" | "staff_puerta" | "admin";
export type EventStatus = "borrador" | "publicado" | "en_venta" | "finalizado" | "cancelado";
export type OrderStatus = "pendiente" | "pagada" | "fallida" | "reembolsada";
export type TicketStatus = "valido" | "usado" | "cancelado" | "transferido";
export type InvoiceStatus = "pendiente" | "emitida" | "fallida";
export type PayoutStatus = "pendiente" | "pagado";
export type DianStatus = "no_habilitado" | "en_proceso" | "habilitado";

export interface Organizer {
  id: string;
  ownerUserId: string;
  legalName: string;
  nit: string;
  dianStatus: DianStatus;
  commissionRate: number;
}

export interface Event {
  id: string;
  organizerId: string;
  name: string;
  venue: string;
  city: string;
  startsAt: string;
  status: EventStatus;
}

export interface TicketType {
  id: string;
  eventId: string;
  name: string;
  priceCop: number;
  capacity: number;
  soldCount: number;
}

export interface Order {
  id: string;
  userId: string;
  eventId: string;
  status: OrderStatus;
  totalCop: number;
  boldPaymentId: string | null;
}

export interface TicketRecord {
  id: string;
  orderItemId: string;
  qrSigned: string;
  status: TicketStatus;
  holderUserId: string;
}

export interface PayoutLedgerEntry {
  id: string;
  organizerId: string;
  eventId: string;
  grossCop: number;
  commissionCop: number;
  netCop: number;
  status: PayoutStatus;
}
