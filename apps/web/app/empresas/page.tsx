import Link from "next/link";
import { whatsappLink } from "@/lib/whatsapp";
import { EmpresaLeadForm } from "./lead-form";

export const metadata = {
  title: "Conviértete en Polinizador — Monarca Tickets",
  description: "Vende boletos para tus eventos en Colombia con Monarca Tickets: checkout seguro, disponibilidad en tiempo real y acompañamiento para cumplir la ley.",
};

const BENEFICIOS = [
  {
    titulo: "Pagos seguros en línea",
    texto: "Tus asistentes pagan en el checkout seguro de FourVenues. La liquidación de tus ventas se coordina con Monarca Tickets.",
    icon: (
      <path d="M3 8h18M3 8a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8Zm4 7h4" />
    ),
  },
  {
    titulo: "Disponibilidad en tiempo real",
    texto: "Cada tipo de boleto muestra cupos disponibles y precio vigente directamente desde FourVenues, el motor de venta.",
    icon: (
      <path d="M9 11a3 3 0 1 0 0-6 3 3 0 0 0 0 6Zm7-6a3 3 0 1 1 0 6M2 21c0-3.9 3.1-7 7-7s7 3.1 7 7M16 14c3.5.4 6 3.3 6 7" />
    ),
  },
  {
    titulo: "Cumplimiento y PULEP",
    texto: "Incluye tu código PULEP y los datos del responsable en la descripción del evento, visibles en tu página pública.",
    icon: (
      <path d="M12 3 4 6v6c0 4.6 3.2 8.4 8 9 4.8-.6 8-4.4 8-9V6l-8-3Zm-1.5 9.5 2 2 4-4" />
    ),
  },
  {
    titulo: "Cashless (próximamente)",
    texto: "Pagos sin efectivo dentro del evento: módulo en desarrollo, aún no disponible.",
    icon: (
      <>
        <path d="M3 7h18v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V7Zm0 0 2-3h14l2 3M7 15h4" />
        <path d="M15 12.3a2.2 2.2 0 0 1 0 3.9M17.2 10.5a4.6 4.6 0 0 1 0 7.5" />
      </>
    ),
  },
] as const;

export default function EmpresasPage() {
  return (
    <main className="container">
      <div className="portal-hero">
        <p className="event-card-eyebrow">Monarca para organizadores</p>
        <h1>Conviértete en un Polinizador</h1>
        <p className="page-lede">
          Tú creas la experiencia. Monarca te da el ecosistema para venderla: venta en línea con FourVenues,
          boletos digitales y un panel para seguir tus ventas.
        </p>
      </div>

      <div className="portal-benefits portal-benefits-4">
        {BENEFICIOS.map((b) => (
          <div className="portal-benefit-card" key={b.titulo}>
            <svg
              className="portal-benefit-icon"
              width="26"
              height="26"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.6"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
            >
              {b.icon}
            </svg>
            <h3>{b.titulo}</h3>
            <p>{b.texto}</p>
          </div>
        ))}
      </div>

      <section className="event-section" style={{ margin: "8px 0 32px" }}>
        <h2>Cashless: próximamente</h2>
        <p className="page-lede" style={{ marginBottom: 0 }}>
          Estamos trabajando en pagos sin efectivo dentro del evento. Todavía no está disponible; te avisaremos
          cuando esté listo para operar.
        </p>
      </section>

      <div className="portal-cta-row" style={{ marginBottom: 16 }}>
        <a
          href={whatsappLink("Hola, quiero vender los boletos de mi evento con Monarca Tickets")}
          target="_blank"
          rel="noopener noreferrer"
          className="btn btn-primary"
        >
          Escribenos por WhatsApp
        </a>
        <p className="muted" style={{ margin: 0 }}>
          ¿Ya vendes con nosotros? <Link href="/login" className="text-link">Ingresa</Link>
        </p>
      </div>

      <EmpresaLeadForm />
    </main>
  );
}
