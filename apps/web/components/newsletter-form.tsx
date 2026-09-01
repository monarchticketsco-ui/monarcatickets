"use client";

import { useState } from "react";

export function NewsletterForm({ correoContacto }: { correoContacto: string }) {
  const [email, setEmail] = useState("");

  function suscribirse(e: React.FormEvent) {
    e.preventDefault();
    if (!email) return;
    const asunto = encodeURIComponent("Quiero suscribirme al boletín de Monarca Tickets");
    const cuerpo = encodeURIComponent(`Por favor suscribe este correo al boletín de próximos eventos: ${email}`);
    window.location.href = `mailto:${correoContacto}?subject=${asunto}&body=${cuerpo}`;
  }

  return (
    <form onSubmit={suscribirse} className="newsletter-form">
      <div className="newsletter-input-row">
        <input
          type="email"
          required
          placeholder="ejemplo@dominio.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          aria-label="Correo electrónico"
        />
        <button type="submit" aria-label="Suscribirme">
          →
        </button>
      </div>
      <p className="newsletter-hint">Suscríbete a nuestro boletín y entérate de los próximos eventos.</p>
    </form>
  );
}
