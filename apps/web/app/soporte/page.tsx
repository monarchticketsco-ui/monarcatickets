import type { Metadata } from "next";
import { SoporteForm } from "./soporte-form";

export const metadata: Metadata = {
  title: "Soporte de compra — Monarca Tickets",
};

export default function SoportePage() {
  return (
    <main className="container">
      <h1>Solicitud de soporte de compra</h1>
      <p className="page-lede">
        ¿Tienes un problema con una compra? Cuéntanos qué pasó y te ayudamos. Para reembolsos y cambios revisa
        también nuestra <a href="/legal/cancelaciones">política de cancelaciones y cambios</a>.
      </p>
      <SoporteForm />
    </main>
  );
}
