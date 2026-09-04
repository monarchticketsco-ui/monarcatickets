import Link from "next/link";

export const metadata = {
  title: "Portal personas — Monarca Tickets",
  description: "Compra boletos para conciertos, festivales, teatro y más en Colombia, con pago seguro y boleto digital.",
};

const BENEFICIOS = [
  {
    titulo: "Boleto 100% digital",
    texto: "Tu entrada llega a tu correo y a tu cuenta al instante — sin filas, sin papel, sin perderlo.",
    icon: (
      <path d="M4 7h16v10H4V7Zm0 0 8 6 8-6" />
    ),
  },
  {
    titulo: "Pago seguro",
    texto: "Compra con tarjeta o PSE a través de Bold. Tus datos nunca quedan guardados en Monarca.",
    icon: (
      <path d="M12 3 4 6v6c0 4.6 3.2 8.4 8 9 4.8-.6 8-4.4 8-9V6l-8-3Zm-1.5 9.5 2 2 4-4" />
    ),
  },
  {
    titulo: "Descubre eventos cerca de ti",
    texto: "Filtra por ciudad, fecha y categoría — conciertos, deporte, teatro, fiestas y más en un solo lugar.",
    icon: (
      <path d="M12 21s-7-6.2-7-11a7 7 0 1 1 14 0c0 4.8-7 11-7 11Zm0-8a3 3 0 1 0 0-6 3 3 0 0 0 0 6Z" />
    ),
  },
] as const;

export default function PersonasPage() {
  return (
    <main className="container">
      <div className="portal-hero">
        <p className="event-card-eyebrow">Portal personas</p>
        <h1>Encuentra y compra boletos para tu próxima experiencia</h1>
        <p className="page-lede">
          Conciertos, festivales, teatro, deporte y planes familiares en toda Colombia, con boleto digital y
          control de aforo real.
        </p>
      </div>

      <div className="portal-benefits">
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

      <div className="portal-cta-row">
        <Link href="/signup?tipo=persona" className="btn btn-primary">
          Crear cuenta
        </Link>
        <Link href="/eventos" className="btn btn-secondary">
          Ver eventos
        </Link>
        <p className="muted" style={{ margin: 0 }}>
          ¿Ya tienes cuenta? <Link href="/login" className="text-link">Ingresa</Link>
        </p>
      </div>
    </main>
  );
}
