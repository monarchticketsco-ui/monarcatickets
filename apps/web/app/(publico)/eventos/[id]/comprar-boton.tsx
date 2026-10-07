"use client";

import { useState } from "react";

type Asistente = { nombre: string; email: string; telefono: string };

export function ComprarBoton({
  ticketRateId,
  priceId,
  disponibles,
  precioCop,
  feeType,
  feeQuantity,
  max,
}: {
  ticketRateId: string;
  priceId: string;
  disponibles: number;
  precioCop: number;
  feeType: "percentage" | "fixed";
  feeQuantity: number;
  max: number;
}) {
  const [paso, setPaso] = useState<"cantidad" | "asistentes">("cantidad");
  const [cantidad, setCantidad] = useState(1);
  const [asistentes, setAsistentes] = useState<Asistente[]>([]);
  const [cargando, setCargando] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const maximo = Math.min(max || 10, disponibles);
  const subtotalCop = precioCop * cantidad;
  const feeCop = feeType === "percentage" ? Math.round(subtotalCop * (feeQuantity / 100)) : feeQuantity * cantidad;
  const totalCop = subtotalCop + feeCop;

  function continuar() {
    setError(null);
    setAsistentes(Array.from({ length: cantidad }, () => ({ nombre: "", email: "", telefono: "" })));
    setPaso("asistentes");
  }

  function actualizarAsistente(i: number, campo: keyof Asistente, valor: string) {
    setAsistentes((prev) => prev.map((a, idx) => (idx === i ? { ...a, [campo]: valor } : a)));
  }

  function validarAsistentesLocal(): string | null {
    for (let i = 0; i < asistentes.length; i++) {
      const { nombre, email, telefono } = asistentes[i];
      if (nombre.trim().length < 3) return `Escribe el nombre completo del asistente ${i + 1}.`;
      if (!/^\S+@\S+\.\S+$/.test(email.trim())) return `El correo del asistente ${i + 1} no es válido.`;
      if (!/^[0-9]{7,15}$/.test(telefono.trim())) return `El teléfono del asistente ${i + 1} debe ser solo números (7 a 15 dígitos).`;
    }
    return null;
  }

  async function pagar() {
    const errorLocal = validarAsistentesLocal();
    if (errorLocal) {
      setError(errorLocal);
      return;
    }

    setCargando(true);
    setError(null);
    try {
      const res = await fetch("/api/checkout-fv", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ticketRateId,
          priceId,
          tickets: asistentes.map((a) => ({ full_name: a.nombre.trim(), email: a.email.trim(), phone: a.telefono.trim() })),
        }),
      });
      const data = await res.json();

      if (!res.ok) {
        if (data.error === "asistentes_invalidos") {
          setError(data.detalle ?? "Revisa los datos de los asistentes.");
        } else {
          setError("No se pudo iniciar el pago. Intenta de nuevo.");
        }
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

  if (paso === "cantidad") {
    return (
      <div className="mq-buyform">
        <div className="mq-qty">
          <input
            type="number"
            min={1}
            max={maximo}
            value={cantidad}
            onChange={(e) => setCantidad(Math.max(1, Math.min(maximo, Number(e.target.value) || 1)))}
            aria-label="Cantidad"
          />
          <button type="button" onClick={continuar} className="mq-btn mq-primary">
            Continuar
          </button>
        </div>
        {feeCop > 0 && <p className="mq-total-note">Total con servicio: ${totalCop.toLocaleString("es-CO")}</p>}
      </div>
    );
  }

  return (
    <div className="mq-buyform">
      {asistentes.map((a, i) => (
        <div key={i} className="mq-attendee">
          <small>Asistente {i + 1}</small>
          <input
            type="text"
            placeholder="Nombre completo"
            autoComplete="name"
            value={a.nombre}
            onChange={(e) => actualizarAsistente(i, "nombre", e.target.value)}
          />
          <input
            type="email"
            placeholder="Correo"
            autoComplete="email"
            value={a.email}
            onChange={(e) => actualizarAsistente(i, "email", e.target.value)}
          />
          <input
            type="tel"
            placeholder="Teléfono"
            autoComplete="tel"
            value={a.telefono}
            onChange={(e) => actualizarAsistente(i, "telefono", e.target.value)}
          />
        </div>
      ))}
      {error && (
        <p className="mq-error" role="alert">
          {error}
        </p>
      )}
      <div className="mq-qty">
        <button type="button" onClick={() => setPaso("cantidad")} className="mq-btn" disabled={cargando} style={{ flex: "0 0 auto" }}>
          Atrás
        </button>
        <button type="button" onClick={pagar} className="mq-btn mq-primary" disabled={cargando}>
          {cargando ? "Redirigiendo..." : `Pagar $${totalCop.toLocaleString("es-CO")}`}
        </button>
      </div>
    </div>
  );
}
