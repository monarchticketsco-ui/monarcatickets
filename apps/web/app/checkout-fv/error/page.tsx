import Link from "next/link";

// FourVenues redirige aqui si el pago fue rechazado o el comprador
// cancelo en la pasarela (dLocal Colombia).
export default function CheckoutFourvenuesErrorPage() {
  return (
    <main className="container" style={{ maxWidth: 560, textAlign: "center", padding: "64px 0" }}>
      <h1>No se pudo completar el pago</h1>
      <p className="page-lede">
        La transaccion fue rechazada o se cancelo antes de terminar. No se genero ningun boleto ni se hizo ningun
        cobro.
      </p>
      <Link href="/eventos" className="btn btn-primary" style={{ marginTop: 24, display: "inline-block" }}>
        Intentar de nuevo
      </Link>
    </main>
  );
}
