import type { Metadata } from "next";
import Script from "next/script";

// Pagina nueva y separada del checkout propio (Bold/Supabase): aqui se
// embebe el calendario y checkout de FourVenues, nuestro aliado de
// ticketing. No toca /eventos ni el flujo de compra actual -- si en algun
// momento se retira FourVenues, basta con quitar esta pagina y el enlace
// del header (ver components/site-header.tsx).
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
          Elige tu evento y compra tu boleto de forma segura, directo desde nuestro calendario en línea.
        </p>
      </div>

      <div id="fourvenues-calendar-embed" style={{ minHeight: 480 }} />
      <Script
        src="https://www.fourvenues.com/assets/iframe/monarch-tickets/calendar@"
        strategy="afterInteractive"
      />
    </main>
  );
}
