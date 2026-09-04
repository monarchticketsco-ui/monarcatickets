"use client";

import { useLayoutEffect, useRef } from "react";
import gsap from "gsap";

// Envuelve una seccion server-renderizada (llega completa y visible en el
// HTML inicial) y la anima con una entrada "de profundidad" (fade + subida
// + leve escala/blur, como si la capa se despegara del fondo) al entrar en
// pantalla. Si el usuario prefiere menos movimiento, o si JS no corre, el
// contenido se queda tal cual -- nunca depende de JS para ser visible.
export function Reveal({
  children,
  className,
  y = 28,
  delay = 0,
  depth = true,
}: {
  children: React.ReactNode;
  className?: string;
  y?: number;
  delay?: number;
  depth?: boolean;
}) {
  const ref = useRef<HTMLDivElement>(null);

  useLayoutEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const desde: gsap.TweenVars = depth
      ? { opacity: 0, y, scale: 0.96, filter: "blur(6px)" }
      : { opacity: 0, y };
    const hacia: gsap.TweenVars = depth
      ? { opacity: 1, y: 0, scale: 1, filter: "blur(0px)", duration: 1, delay, ease: "power3.out" }
      : { opacity: 1, y: 0, duration: 0.9, delay, ease: "power3.out" };

    let triggered = false;
    const anima = () => {
      if (triggered) return;
      triggered = true;
      gsap.fromTo(el, desde, hacia);
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

    gsap.set(el, desde);
    observer.observe(el);

    return () => observer.disconnect();
  }, [y, delay, depth]);

  return (
    <div ref={ref} className={className}>
      {children}
    </div>
  );
}
