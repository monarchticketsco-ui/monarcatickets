"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { imagenDeEvento } from "@/lib/event-visuals";

type EventoDestacado = {
  id: string;
  name: string;
  venue: string;
  city: string;
  starts_at: string;
  category: string | null;
};

export function HeroCarousel({ eventos }: { eventos: EventoDestacado[] }) {
  const [indice, setIndice] = useState(0);

  useEffect(() => {
    if (eventos.length < 2) return;
    const id = setInterval(() => setIndice((i) => (i + 1) % eventos.length), 6000);
    return () => clearInterval(id);
  }, [eventos.length]);

  if (eventos.length === 0) {
    return (
      <div className="hero">
        <div className="hero-empty">
          <p className="event-card-eyebrow" style={{ marginBottom: 12 }}>
            Acceso · Movimiento · Transformación
          </p>
          <h1>El ticket que se transforma en experiencia.</h1>
          <p className="page-lede" style={{ marginBottom: 20 }}>
            Boletos para eventos en Colombia, con control de aforo real y pago seguro con Bold.
          </p>
          <Link href="/eventos" className="btn btn-primary">
            Ver eventos
          </Link>
        </div>
      </div>
    );
  }

  const evento = eventos[indice];
  const fecha = new Date(evento.starts_at).toLocaleDateString("es-CO", {
    weekday: "long",
    day: "2-digit",
    month: "long",
  });

  return (
    <div className="hero">
      <div className="hero-slide">
        <img src={imagenDeEvento(evento.id, evento.category, 1400)} alt="" />
        <div className="hero-slide-scrim" />
        <div className="hero-slide-content">
          {evento.category && <p className="event-card-eyebrow">{evento.category}</p>}
          <h1>{evento.name}</h1>
          <p>
            {evento.venue} · {evento.city} · {fecha}
          </p>
          <Link href={`/eventos/${evento.id}`} className="btn btn-primary">
            Comprar boletos
          </Link>
        </div>
        {eventos.length > 1 && (
          <>
            <button
              type="button"
              className="hero-nav hero-nav-prev"
              aria-label="Evento anterior"
              onClick={() => setIndice((i) => (i - 1 + eventos.length) % eventos.length)}
            >
              ‹
            </button>
            <button
              type="button"
              className="hero-nav hero-nav-next"
              aria-label="Siguiente evento"
              onClick={() => setIndice((i) => (i + 1) % eventos.length)}
            >
              ›
            </button>
            <div className="hero-dots">
              {eventos.map((e, i) => (
                <button
                  key={e.id}
                  type="button"
                  className="hero-dot"
                  aria-label={`Ir al evento ${i + 1}`}
                  aria-current={i === indice}
                  onClick={() => setIndice(i)}
                />
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
