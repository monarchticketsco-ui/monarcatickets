"use client";

import { useState, type FormEvent } from "react";

const CORREO = "monarchpasstickets@gmail.com";

const MOTIVOS = [
  "No recibí mi boleto",
  "Cobro duplicado o error en el pago",
  "Quiero cambiar o cancelar mi compra",
  "Problema para ingresar al evento",
  "Otro",
];

export function SoporteForm() {
  const [enviado, setEnviado] = useState(false);

  function enviar(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = new FormData(e.currentTarget);
    const nombre = String(form.get("nombre") || "");
    const correo = String(form.get("correo") || "");
    const orden = String(form.get("orden") || "");
    const motivo = String(form.get("motivo") || "");
    const mensaje = String(form.get("mensaje") || "");

    const asunto = encodeURIComponent(`Soporte de compra — ${motivo}`);
    const cuerpo = encodeURIComponent(
      `Nombre: ${nombre}\nCorreo: ${correo}\nReferencia de orden / evento: ${orden}\nMotivo: ${motivo}\n\nMensaje:\n${mensaje}`
    );
    window.location.href = `mailto:${CORREO}?subject=${asunto}&body=${cuerpo}`;
    setEnviado(true);
  }

  return (
    <div className="card" style={{ maxWidth: 520 }}>
      <form onSubmit={enviar} className="form">
        <div className="field">
          <label htmlFor="nombre">Nombre completo</label>
          <input id="nombre" name="nombre" type="text" required />
        </div>
        <div className="field">
          <label htmlFor="correo">Correo electrónico</label>
          <input id="correo" name="correo" type="email" required />
        </div>
        <div className="field">
          <label htmlFor="orden">Referencia de orden o nombre del evento</label>
          <input id="orden" name="orden" type="text" placeholder="Ej: nombre del evento o número de orden" />
        </div>
        <div className="field">
          <label htmlFor="motivo">Motivo</label>
          <select id="motivo" name="motivo" defaultValue={MOTIVOS[0]}>
            {MOTIVOS.map((m) => (
              <option key={m} value={m}>
                {m}
              </option>
            ))}
          </select>
        </div>
        <div className="field">
          <label htmlFor="mensaje">Cuéntanos qué pasó</label>
          <textarea id="mensaje" name="mensaje" rows={5} required />
        </div>
        <button type="submit" className="btn btn-primary">
          Enviar solicitud
        </button>
        <p className="muted" style={{ fontSize: "0.85rem" }}>
          Al enviar se abrirá tu cliente de correo con esta información dirigida a {CORREO}.
        </p>
        {enviado && <p role="status">Si tu correo no se abrió automáticamente, escríbenos directamente a {CORREO}.</p>}
      </form>
    </div>
  );
}
