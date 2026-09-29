import Link from "next/link";

// FourVenues redirige aqui despues de un pago exitoso. El boleto (QR) ya
// se envio por email desde FourVenues (send_resources: true en el
// checkout) -- esta pagina es solo confirmacion visual, no hay estado
// que consultar en Supabase (catalogo/boletos viven 100% en FourVenues).
export default function CheckoutFourvenuesOkPage() {
  return (
    <main className="container" style={{ maxWidth: 560, textAlign: "center", padding: "64px 0" }}>
      <h1>Compra confirmada</h1>
      <p className="page-lede">
        Tu pago se proceso correctamente. Te enviamos el boleto con el codigo QR al correo que registraste.
      </p>
      <p className="muted">Si no lo ves en unos minutos, revisa la carpeta de spam.</p>
      <Link href="/eventos" className="btn btn-primary" style={{ marginTop: 24, display: "inline-block" }}>
        Ver mas eventos
      </Link>
    </main>
  );
}
