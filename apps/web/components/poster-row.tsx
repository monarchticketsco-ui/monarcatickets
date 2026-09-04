"use client";

import { useEffect, useRef } from "react";
import Link from "next/link";
import gsap from "gsap";
import { imagenDeEvento } from "@/lib/event-visuals";

type EventoPoster = {
  id: string;
  name: string;
  venue: string;
  city: string;
  category: string | null;
  image_url: string | null;
  fecha: string;
};

// Fila de eventos estilo "elegir una pelicula" (streaming): posters
// verticales en scroll horizontal, con tilt 3D sutil al mover el mouse
// y una entrada animada (GSAP) al montar. Reemplaza el hero tipo banner.
export function PosterRow({ eventos }: { eventos: EventoPoster[] }) {
  const rowRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const row = rowRef.current;
    if (!row) return;

    const prefiereMenosMovimiento = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const cards = Array.from(row.querySelectorAll<HTMLElement>(".poster-card"));

    if (!prefiereMenosMovimiento && cards.length > 0) {
      gsap.fromTo(
        cards,
        { opacity: 0, y: 36 },
        { opacity: 1, y: 0, duration: 0.7, ease: "power3.out", stagger: 0.07 }
      );
    }

    if (prefiereMenosMovimiento || !window.matchMedia("(hover: hover) and (pointer: fine)").matches) {
      return;
    }

    const limpiar: (() => void)[] = [];
    cards.forEach((card) => {
      const onMove = (e: MouseEvent) => {
        const r = card.getBoundingClientRect();
        const px = (e.clientX - r.left) / r.width - 0.5;
        const py = (e.clientY - r.top) / r.height - 0.5;
        gsap.to(card, {
          rotateY: px * 12,
          rotateX: py * -12,
          transformPerspective: 800,
          duration: 0.4,
          ease: "power2.out",
        });
      };
      const onLeave = () => {
        gsap.to(card, { rotateY: 0, rotateX: 0, duration: 0.6, ease: "power3.out" });
      };
      card.addEventListener("mousemove", onMove);
      card.addEventListener("mouseleave", onLeave);
      limpiar.push(() => {
        card.removeEventListener("mousemove", onMove);
        card.removeEventListener("mouseleave", onLeave);
      });
    });

    return () => limpiar.forEach((fn) => fn());
  }, [eventos.length]);

  function desplazar(dir: number) {
    rowRef.current?.scrollBy({ left: dir * 320, behavior: "smooth" });
  }

  if (eventos.length === 0) return null;

  return (
    <div className="poster-row-wrap">
      {eventos.length > 3 && (
        <button type="button" className="hero-nav poster-nav-prev" aria-label="Anterior" onClick={() => desplazar(-1)}>
          ‹
        </button>
      )}
      <div className="poster-row" ref={rowRef}>
        {eventos.map((e) => (
          <Link href={`/eventos/${e.id}`} key={e.id} className="poster-card">
            <img
              src={e.image_url || imagenDeEvento(e.id, e.category, 500)}
              alt=""
              decoding="async"
            />
            <div className="poster-scrim" />
            <div className="poster-body">
              {e.category && <p className="event-card-eyebrow">{e.category}</p>}
              <h3>{e.name}</h3>
              <p className="poster-meta">
                {e.city} · {e.fecha}
              </p>
              <span className="btn btn-primary btn-sm poster-cta">Comprar boletos</span>
            </div>
          </Link>
        ))}
      </div>
      {eventos.length > 3 && (
        <button type="button" className="hero-nav poster-nav-next" aria-label="Siguiente" onClick={() => desplazar(1)}>
          ›
        </button>
      )}
    </div>
  );
}
