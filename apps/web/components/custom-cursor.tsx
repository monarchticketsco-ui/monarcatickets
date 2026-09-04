"use client";

import { useEffect, useRef } from "react";

// Cursor personalizado (punto + anillo con inercia) que crece al pasar
// sobre elementos interactivos. Solo se activa con mouse real y sin
// preferencia de "menos movimiento" -- en touch/tactil no hace nada y el
// cursor nativo del sistema se queda igual.
export function CustomCursor() {
  const dotRef = useRef<HTMLDivElement>(null);
  const ringRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const puedeUsarCursor = window.matchMedia("(hover: hover) and (pointer: fine)").matches;
    const menosMovimiento = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (!puedeUsarCursor || menosMovimiento) return;

    const dot = dotRef.current;
    const ring = ringRef.current;
    if (!dot || !ring) return;

    let mouseX = window.innerWidth / 2;
    let mouseY = window.innerHeight / 2;
    let ringX = mouseX;
    let ringY = mouseY;
    let raf = 0;

    const centrar = (el: HTMLElement, x: number, y: number) => {
      el.style.transform = `translate(${x}px, ${y}px) translate(-50%, -50%)`;
    };

    const onMove = (e: MouseEvent) => {
      mouseX = e.clientX;
      mouseY = e.clientY;
      centrar(dot, mouseX, mouseY);
    };

    const loop = () => {
      ringX += (mouseX - ringX) * 0.18;
      ringY += (mouseY - ringY) * 0.18;
      centrar(ring, ringX, ringY);
      raf = requestAnimationFrame(loop);
    };

    const esInteractivo = (target: EventTarget | null) =>
      target instanceof HTMLElement &&
      target.closest("a, button, input, select, textarea, .poster-card, .event-card, [role='button']");

    const onOver = (e: MouseEvent) => {
      if (esInteractivo(e.target)) document.body.classList.add("cursor-hover");
    };
    const onOut = (e: MouseEvent) => {
      if (esInteractivo(e.target)) document.body.classList.remove("cursor-hover");
    };
    const onDown = () => document.body.classList.add("cursor-down");
    const onUp = () => document.body.classList.remove("cursor-down");

    document.addEventListener("mousemove", onMove);
    document.addEventListener("mouseover", onOver);
    document.addEventListener("mouseout", onOut);
    document.addEventListener("mousedown", onDown);
    document.addEventListener("mouseup", onUp);
    document.body.classList.add("has-custom-cursor");
    raf = requestAnimationFrame(loop);

    return () => {
      document.removeEventListener("mousemove", onMove);
      document.removeEventListener("mouseover", onOver);
      document.removeEventListener("mouseout", onOut);
      document.removeEventListener("mousedown", onDown);
      document.removeEventListener("mouseup", onUp);
      document.body.classList.remove("has-custom-cursor", "cursor-hover", "cursor-down");
      cancelAnimationFrame(raf);
    };
  }, []);

  return (
    <>
      <div ref={dotRef} className="cursor-dot" aria-hidden="true" />
      <div ref={ringRef} className="cursor-ring" aria-hidden="true" />
    </>
  );
}
