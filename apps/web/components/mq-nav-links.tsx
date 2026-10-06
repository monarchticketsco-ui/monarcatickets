"use client";

import { useEffect, useState } from "react";

// Enlaces del header (diseño Monarca). En desktop van en fila; en pantallas
// angostas se abren con el botón de menú. Los links viven en site-header.tsx.
export function MqNavLinks({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia("(min-width: 851px)");
    const cerrar = () => setOpen(false);
    mq.addEventListener("change", cerrar);
    return () => mq.removeEventListener("change", cerrar);
  }, []);

  return (
    <>
      <button
        type="button"
        className="mq-burger"
        aria-label={open ? "Cerrar menú" : "Abrir menú"}
        aria-expanded={open}
        onClick={() => setOpen((v) => !v)}
      >
        <span />
        <span />
        <span />
      </button>
      <nav className={`mq-navlinks${open ? " mq-open" : ""}`} onClick={() => setOpen(false)}>
        {children}
      </nav>
    </>
  );
}
