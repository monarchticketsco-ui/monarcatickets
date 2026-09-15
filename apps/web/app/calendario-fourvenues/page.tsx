import type { Metadata } from "next";
import Script from "next/script";

// Pagina nueva y separada del checkout propio (Bold/Supabase): aqui se
// embebe el checkout de FourVenues, nuestro aliado de ticketing. No toca
// /eventos ni el flujo de compra actual -- si en algun momento se retira
// FourVenues, basta con quitar esta pagina y el enlace del header (ver
// components/site-header.tsx).
//
// Nota: este es el "Sales iframe" del evento "Prueba Evento" (slug ZHLX),
// generado desde FourVenues > Calendario > [evento] > Enlaces de venta >
// Ver iframe de venta. Cada evento tiene su propio codigo -- cuando haya
// mas eventos activos en FourVenues, hay que repetir este mismo patron
// (nueva pagina o bloque con el src correspondiente a cada slug), o
// reemplazar este bloque por el embed general de calendario cuando
// FourVenues lo tenga activado para la cuenta.
export const metadata: Metadata = {
  title: "Calendario de eventos — Monarca Tickets",
  description: "Consulta nuestros proximos eventos y compra tu boleto de forma segura.",
};

export default function CalendarioFourvenuesPage() {
  return (
    <main className="container">
      <div className="portal-hero">
        <p className="event-card-eyebrow">Calendario de eventos</p>
        <h1>Compra tus boletos aquí</h1>
        <p className="page-lede">
          Elige tu evento y compra tu boleto de forma segura, directo desde FourVenues, nuestro aliado de ticketing.
        </p>
      </div>

      <div id="fourvenues-iframe" style={{ minHeight: 480 }} />
      <Script
        src="https://www.fourvenues.com/assets/iframe/monarch-tickets/ZHLX"
        strategy="afterInteractive"
      />
    </main>
  );
}
