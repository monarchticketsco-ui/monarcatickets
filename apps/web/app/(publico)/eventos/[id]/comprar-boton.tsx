"use client";

import { useState } from "react";

export function ComprarBoton({
  ticketTypeId,
  disponibles,
}: {
  ticketTypeId: string;
  disponibles: number;
}) {
  const [cantidad, setCantidad] = useState(1);
  const [cargando, setCargando] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const maximo = Math.min(10, disponibles);

  async function comprar() {
    setCargando(true);
    setError(null);
    try {
      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ticketTypeId, quantity: cantidad }),
      });
      const data = await res.json();

      if (!res.ok) {
        if (res.status === 401) {
          window.location.href = "/login";
          return;
        }
        setError(
          data.error === "sin_cupo"
            ? "Ya no hay cupo suficiente para esa cantidad."
            : "No se pudo iniciar el pago. Intenta de nuevo."
        );
        return;
      }

      window.location.href = data.checkoutUrl;
    } catch {
      setError("No se pudo iniciar el pago. Intenta de nuevo.");
    } finally {
      setCargando(false);
    }
  }

  if (disponibles <= 0) return null;

  return (
    <div>
      <div className="qty-form">
        <input
          type="number"
          min={1}
          max={maximo}
          value={cantidad}
          onChange={(e) => setCantidad(Math.max(1, Math.min(maximo, Number(e.target.value))))}
          aria-label="Cantidad"
        />
        <button onClick={comprar} disabled={cargando} className="btn btn-primary">
          {cargando ? "Redirigiendo a Bold..." : "Comprar"}
        </button>
      </div>
      {error && <p role="alert" style={{ marginTop: 10 }}>{error}</p>}
    </div>
  );
}
