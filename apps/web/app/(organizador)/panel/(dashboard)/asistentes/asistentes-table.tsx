"use client";

import { useMemo, useState } from "react";

type Fila = {
  id: string;
  nombre: string;
  correo: string;
  telefono: string;
  tarifa: string;
  estado: string;
};

const ESTADO_BADGE: Record<string, string> = {
  active: "badge badge-green",
  used: "badge",
  refunded: "badge badge-danger",
  cancelled: "badge badge-danger",
};

export function AsistentesTable({ filas }: { filas: Fila[] }) {
  const [busqueda, setBusqueda] = useState("");

  const filtradas = useMemo(() => {
    const q = busqueda.trim().toLowerCase();
    if (!q) return filas;
    return filas.filter(
      (f) => f.nombre.toLowerCase().includes(q) || f.correo.toLowerCase().includes(q) || f.telefono.includes(q)
    );
  }, [filas, busqueda]);

  return (
    <>
      <div className="field" style={{ maxWidth: 320, marginBottom: 16 }}>
        <input
          type="text"
          placeholder="Buscar por nombre, correo o telefono…"
          value={busqueda}
          onChange={(e) => setBusqueda(e.target.value)}
        />
      </div>

      {filtradas.length === 0 ? (
        <p className="empty-state">No hay asistentes que coincidan con la busqueda.</p>
      ) : (
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Nombre</th>
                <th>Correo</th>
                <th>Telefono</th>
                <th>Tarifa</th>
                <th>Estado</th>
              </tr>
            </thead>
            <tbody>
              {filtradas.map((f) => (
                <tr key={f.id}>
                  <td>{f.nombre || "—"}</td>
                  <td>{f.correo || "—"}</td>
                  <td>{f.telefono || "—"}</td>
                  <td>{f.tarifa}</td>
                  <td>
                    <span className={ESTADO_BADGE[f.estado] ?? "badge"}>{f.estado}</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          <p className="muted" style={{ marginTop: 10, fontSize: "0.8rem" }}>
            {filtradas.length} de {filas.length} asistentes
          </p>
        </div>
      )}
    </>
  );
}
