"use client";

import { useEffect, useState } from "react";

// Envuelve los links de navegacion del header. En desktop se ven en fila
// (CSS los muestra siempre); en mobile colapsan detras de un boton
// hamburguesa. La lista de links vive una sola vez en site-header.tsx
// (server component, con la sesion ya resuelta) y se pasa aqui como
// children -- este componente solo maneja el estado de abierto/cerrado.
export function MobileNavToggle({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = useState(false);

  // Cierra el menu al cambiar de tamano de pantalla a desktop, para que
  // no quede "abierto" invisible detras de la nav en fila.
  useEffect(() => {
    const mq = window.matchMedia("(min-width: 881px)");
    const cerrar = () => setOpen(false);
    mq.addEventListener("change", cerrar);
    return () => mq.removeEventListener("change", cerrar);
  }, []);

  return (
    <>
      <button
        type="button"
        className={`nav-toggle${open ? " nav-toggle-open" : ""}`}
        aria-label={open ? "Cerrar menu" : "Abrir menu"}
        aria-expanded={open}
        onClick={() => setOpen((v) => !v)}
      >
        <span />
        <span />
        <span />
      </button>
      <nav className={`site-nav${open ? " site-nav-open" : ""}`} onClick={() => setOpen(false)}>
        {children}
      </nav>
    </>
  );
}
