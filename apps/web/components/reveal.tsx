"use client";

import { useLayoutEffect, useRef } from "react";
import gsap from "gsap";

// Envuelve una seccion server-renderizada (llega completa y visible en el
// HTML inicial) y la anima con un fade + subida al entrar en pantalla.
// Si el usuario prefiere menos movimiento, o si JS no corre, el contenido
// se queda tal cual -- nunca depende de JS para ser visible.
export function Reveal({
  children,
  className,
  y = 28,
  delay = 0,
}: {
  children: React.ReactNode;
  className?: string;
  y?: number;
  delay?: number;
}) {
  const ref = useRef<HTMLDivElement>(null);

  useLayoutEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    let triggered = false;
    const anima = () => {
      if (triggered) return;
      triggered = true;
      gsap.fromTo(
        el,
        { opacity: 0, y },
        { opacity: 1, y: 0, duration: 0.9, delay, ease: "power3.out" }
      );
    };

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries.some((entry) => entry.isIntersecting)) {
          anima();
          observer.disconnect();
        }
      },
      { threshold: 0.15, rootMargin: "0px 0px -10% 0px" }
    );

    gsap.set(el, { opacity: 0, y });
    observer.observe(el);

    return () => observer.disconnect();
  }, [y, delay]);

  return (
    <div ref={ref} className={className}>
      {children}
    </div>
  );
}
