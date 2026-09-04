"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import gsap from "gsap";
import { imagenDeEvento } from "@/lib/event-visuals";
import { MagneticButton } from "@/components/magnetic-button";

type EventoDestacado = {
  id: string;
  name: string;
  venue: string;
  city: string;
  fecha: string;
  category: string | null;
  image_url: string | null;
};

export function HeroCarousel({ eventos }: { eventos: EventoDestacado[] }) {
  const [indice, setIndice] = useState(0);
  const contentRef = useRef<HTMLDivElement>(null);
  const imgRef = useRef<HTMLImageElement>(null);

  useEffect(() => {
    if (eventos.length < 2) return;
    const id = setInterval(() => setIndice((i) => (i + 1) % eventos.length), 6000);
    return () => clearInterval(id);
  }, [eventos.length]);

  // Al cambiar de slide: crossfade de la imagen y las palabras del
  // titular entrando con un leve stagger — la animacion "cinetica" de
  // los titulos principales que pidio el usuario.
  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const content = contentRef.current;
    const img = imgRef.current;
    if (!content) return;

    if (img) gsap.fromTo(img, { opacity: 0, scale: 1.06 }, { opacity: 1, scale: 1, duration: 1, ease: "power2.out" });

    const words = content.querySelectorAll<HTMLElement>(".hero-word");
    if (words.length > 0) {
      gsap.fromTo(
        words,
        { opacity: 0, y: 18, filter: "blur(4px)" },
        { opacity: 1, y: 0, filter: "blur(0px)", duration: 0.6, stagger: 0.045, ease: "power3.out", delay: 0.1 }
      );
    }
    gsap.fromTo(
      content.querySelectorAll(".hero-fade"),
      { opacity: 0, y: 12 },
      { opacity: 1, y: 0, duration: 0.6, delay: 0.25, ease: "power2.out" }
    );
  }, [indice]);

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
          <MagneticButton>
            <Link href="/eventos" className="btn btn-primary">
              Ver eventos
            </Link>
          </MagneticButton>
        </div>
      </div>
    );
  }

  const evento = eventos[indice];
  const palabras = evento.name.split(" ");

  return (
    <div className="hero">
      <div className="hero-slide">
        <img
          ref={imgRef}
          key={evento.id}
          src={evento.image_url || imagenDeEvento(evento.id, evento.category, 1400)}
          alt=""
        />
        <div className="hero-slide-scrim" />
        <div className="hero-slide-content" ref={contentRef} key={`content-${evento.id}`}>
          {evento.category && <p className="event-card-eyebrow hero-fade">{evento.category}</p>}
          <h1 aria-label={evento.name}>
            {palabras.map((palabra, i) => (
              <span className="hero-word" key={i}>
                {palabra}
                {i < palabras.length - 1 ? " " : ""}
              </span>
            ))}
          </h1>
          <p className="hero-fade">
            {evento.venue} · {evento.city} · {evento.fecha}
          </p>
          <div className="hero-fade">
            <MagneticButton>
              <Link href={`/eventos/${evento.id}`} className="btn btn-primary">
                Comprar boletos
              </Link>
            </MagneticButton>
          </div>
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
