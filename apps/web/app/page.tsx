import Link from "next/link";

export default function HomePage() {
  return (
    <main className="container">
      <div style={{ padding: "48px 0 24px", maxWidth: 640 }}>
        <p className="event-card-eyebrow" style={{ marginBottom: 12 }}>
          Acceso · Movimiento · Transformación
        </p>
        <h1 style={{ fontSize: "2.6rem", lineHeight: 1.1 }}>
          El ticket que se transforma en experiencia.
        </h1>
        <p className="page-lede">
          Boletos para eventos en Colombia, con control de aforo real y pago
          seguro con Bold.
        </p>
        <div style={{ marginTop: 28 }}>
          <Link href="/eventos" className="btn btn-primary">
            Ver eventos
          </Link>
        </div>
      </div>
    </main>
  );
}
