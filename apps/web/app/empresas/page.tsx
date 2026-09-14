import Link from "next/link";
import { whatsappLink } from "@/lib/whatsapp";
import { EmpresaLeadForm } from "./lead-form";

export const metadata = {
  title: "Portal empresas — Monarca Tickets",
  description: "Vende boletos para tus eventos en Colombia con Monarca Tickets: pago seguro, control de aforo real y todo lo que exige la ley.",
};

const BENEFICIOS = [
  {
    titulo: "Pagos seguros con Bold",
    texto: "Cobra en línea con tarjeta, PSE y más. El dinero de tus ventas queda liquidado directo a tu cuenta.",
    icon: (
      <path d="M3 8h18M3 8a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8Zm4 7h4" />
    ),
  },
  {
    titulo: "Control de aforo real",
    texto: "Cada boleto vendido descuenta cupo en tiempo real, sin sobreventa ni sorpresas el día del evento.",
    icon: (
      <path d="M9 11a3 3 0 1 0 0-6 3 3 0 0 0 0 6Zm7-6a3 3 0 1 1 0 6M2 21c0-3.9 3.1-7 7-7s7 3.1 7 7M16 14c3.5.4 6 3.3 6 7" />
    ),
  },
  {
    titulo: "Cumplimiento y PULEP",
    texto: "Ficha técnica, responsable del evento y código PULEP en tu página pública, listos para las autoridades.",
    icon: (
      <path d="M12 3 4 6v6c0 4.6 3.2 8.4 8 9 4.8-.6 8-4.4 8-9V6l-8-3Zm-1.5 9.5 2 2 4-4" />
    ),
  },
  {
    titulo: "Pagos cashless en el evento",
    texto: "Pulseras o tarjetas prepago para que tus asistentes paguen comida, bebidas y merchandising sin efectivo ni filas en caja.",
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
        <p className="event-card-eyebrow">Portal empresas</p>
        <h1>Vende los boletos de tu evento con Monarca Tickets</h1>
        <p className="page-lede">
          Cuentanos de tu evento y nuestro equipo crea tu cuenta de empresa. Tú te encargas de la experiencia,
          nosotros del cobro, el aforo y los boletos digitales.
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
        <h2>Cashless: pagos sin efectivo dentro de tu evento</h2>
        <p className="page-lede" style={{ marginBottom: 16 }}>
          Ademas de vender la entrada, Monarca Tickets tambien puede operar el consumo interno de tu evento con
          pulseras o tarjetas prepago, para que tus asistentes paguen comida, bebidas y merchandising sin efectivo
          ni filas en caja.
        </p>
        <div className="prose">
          <ul>
            <li><strong>Recarga en punto o desde el celular</strong> — tus asistentes cargan saldo antes o durante el evento.</li>
            <li><strong>Cero efectivo en barra</strong> — cada punto de venta cobra con lectura NFC, mas rapido que una caja tradicional.</li>
            <li><strong>Consumo en tiempo real</strong> — ves cuanto se esta vendiendo en cada punto mientras el evento sucede.</li>
            <li><strong>Liquidacion despues del evento</strong> — el saldo no gastado se reintegra y te entregamos el corte de ventas por punto.</li>
          </ul>
        </div>
        <p className="muted" style={{ margin: "12px 0 0" }}>
          ¿Tu evento necesita cashless? Cuentanoslo por WhatsApp y lo dejamos listo junto con tus boletos.
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
