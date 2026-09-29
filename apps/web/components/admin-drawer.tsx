"use client";

import { useEffect, useState } from "react";

/**
 * Panel lateral "Administrar" — acceso rapido de contexto, no reemplaza
 * las paginas de ficha completa que ya existen (ej. /crm/organizadores/[id]).
 * Referencia: MONARCA_DEVELOPER_HANDOFF/05_MONARCA_MANAGEMENT.
 */
export function AdminDrawer({
  label = "Administrar",
  triggerClassName = "btn btn-secondary btn-sm",
  eyebrow = "DETALLE",
  title,
  children,
}: {
  label?: string;
  triggerClassName?: string;
  eyebrow?: string;
  title: string;
  children: React.ReactNode;
}) {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  return (
    <>
      <button type="button" className={triggerClassName} onClick={() => setOpen(true)}>
        {label}
      </button>
      {open && (
        <div className="admin-drawer-overlay" onClick={() => setOpen(false)}>
          <aside className="admin-drawer" onClick={(e) => e.stopPropagation()} role="dialog" aria-modal="true">
            <button type="button" className="admin-drawer-close" onClick={() => setOpen(false)} aria-label="Cerrar">
              ×
            </button>
            <div className="admin-drawer-eyebrow">{eyebrow}</div>
            <h2 className="admin-drawer-title">{title}</h2>
            <div className="admin-drawer-body">{children}</div>
          </aside>
        </div>
      )}
    </>
  );
}

/** Fila `label — valor` para el cuerpo del drawer. */
export function DrawerDetail({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="detail-row">
      <span>{label}</span>
      <b>{value}</b>
    </div>
  );
}
