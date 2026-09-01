import type { Metadata } from "next";
import { PqrsForm } from "./pqrs-form";

export const metadata: Metadata = {
  title: "PQRS — Monarca Tickets",
};

export default function PqrsPage() {
  return (
    <main className="container">
      <h1>PQRS</h1>
      <p className="page-lede">
        Radica tu Petición, Queja, Reclamo o Sugerencia. Este canal es distinto del{" "}
        <a href="/soporte">soporte de compra</a>: úsalo cuando quieras presentar una solicitud formal sobre nuestro
        servicio.
      </p>
      <div className="prose" style={{ marginBottom: 24 }}>
        <ul>
          <li><strong>Petición</strong> — solicitas información o una actuación de nuestra parte.</li>
          <li><strong>Queja</strong> — expresas inconformidad con la atención recibida.</li>
          <li><strong>Reclamo</strong> — exiges la solución a un problema concreto con nuestro servicio.</li>
          <li><strong>Sugerencia</strong> — nos propones una mejora.</li>
        </ul>
      </div>
      <PqrsForm />
    </main>
  );
}
