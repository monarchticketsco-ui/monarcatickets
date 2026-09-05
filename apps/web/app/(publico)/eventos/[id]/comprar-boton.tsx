"use client";

import { useState } from "react";

type Asistente = { nombre: string; documento: string };

export function ComprarBoton({
  ticketTypeId,
  disponibles,
}: {
  ticketTypeId: string;
  disponibles: number;
}) {
  const [paso, setPaso] = useState<"cantidad" | "asistentes">("cantidad");
  const [cantidad, setCantidad] = useState(1);
  const [asistentes, setAsistentes] = useState<Asistente[]>([]);
  const [cargando, setCargando] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const maximo = Math.min(10, disponibles);

  function continuar() {
    setError(null);
    // Un boleto = una persona: se piden nombre y cedula de cada asistente
    // antes de pagar, para que el boleto quede nominativo desde que nace.
    setAsistentes(Array.from({ length: cantidad }, () => ({ nombre: "", documento: "" })));
    setPaso("asistentes");
  }

  function actualizarAsistente(i: number, campo: keyof Asistente, valor: string) {
    setAsistentes((prev) => prev.map((a, idx) => (idx === i ? { ...a, [campo]: valor } : a)));
  }

  function validarAsistentesLocal(): string | null {
    for (let i = 0; i < asistentes.length; i++) {
      const { nombre, documento } = asistentes[i];
      if (nombre.trim().length < 3) return `Escribe el nombre completo del asistente ${i + 1}.`;
      if (!/^[0-9]{5,15}$/.test(documento.trim())) return `La cedula del asistente ${i + 1} debe ser solo numeros (5 a 15 digitos).`;
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
      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ticketTypeId,
          quantity: cantidad,
          asistentes: asistentes.map((a) => ({ nombre: a.nombre.trim(), documento: a.documento.trim() })),
        }),
      });
      const data = await res.json();

      if (!res.ok) {
        if (res.status === 401) {
          window.location.href = "/login";
          return;
        }
        if (data.error === "sin_cupo") {
          setError("Ya no hay cupo suficiente para esa cantidad.");
        } else if (data.error === "asistentes_invalidos") {
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
          <button onClick={continuar} className="btn btn-primary">
            Continuar
          </button>
        </div>
      </div>
    );
  }

  return (
    <div>
      <p className="muted" style={{ fontSize: "0.85rem", marginTop: 0 }}>
        Cada boleto es nominativo: escribe el nombre y la cedula de quien va a usarlo (puede ser distinto a quien
        paga).
      </p>
      <div style={{ display: "flex", flexDirection: "column", gap: 12, marginBottom: 14 }}>
        {asistentes.map((asistente, i) => (
          <div
            key={i}
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr",
              gap: 8,
              padding: 12,
              background: "var(--surface-2)",
              border: "1px solid var(--border)",
              borderRadius: "var(--radius)",
            }}
          >
            <div className="field" style={{ margin: 0, gridColumn: "1 / -1" }}>
              <label style={{ fontSize: "0.75rem" }}>Boleto {i + 1} — Nombre completo</label>
              <input
                type="text"
                value={asistente.nombre}
                onChange={(e) => actualizarAsistente(i, "nombre", e.target.value)}
                placeholder="Nombre y apellido"
              />
            </div>
            <div className="field" style={{ margin: 0, gridColumn: "1 / -1" }}>
              <label style={{ fontSize: "0.75rem" }}>Cedula</label>
              <input
                type="text"
                inputMode="numeric"
                value={asistente.documento}
                onChange={(e) => actualizarAsistente(i, "documento", e.target.value.replace(/[^0-9]/g, ""))}
                placeholder="Solo numeros"
              />
            </div>
          </div>
        ))}
      </div>
      <div className="qty-form">
        <button onClick={() => setPaso("cantidad")} className="btn btn-secondary" type="button">
          Atras
        </button>
        <button onClick={pagar} disabled={cargando} className="btn btn-primary">
          {cargando ? "Redirigiendo a Bold..." : "Ir a pagar"}
        </button>
      </div>
      {error && <p role="alert" style={{ marginTop: 10 }}>{error}</p>}
    </div>
  );
}
