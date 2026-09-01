"use client";

import { useState, type FormEvent } from "react";

const CORREO = "monarchpasstickets@gmail.com";

const TIPOS = ["Petición", "Queja", "Reclamo", "Sugerencia"];

export function PqrsForm() {
  const [enviado, setEnviado] = useState(false);

  function enviar(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = new FormData(e.currentTarget);
    const tipo = String(form.get("tipo") || "");
    const nombre = String(form.get("nombre") || "");
    const documento = String(form.get("documento") || "");
    const correo = String(form.get("correo") || "");
    const telefono = String(form.get("telefono") || "");
    const descripcion = String(form.get("descripcion") || "");

    const asunto = encodeURIComponent(`PQRS — ${tipo}`);
    const cuerpo = encodeURIComponent(
      `Tipo de solicitud: ${tipo}\nNombre completo: ${nombre}\nDocumento de identidad: ${documento}\nCorreo: ${correo}\nTeléfono: ${telefono}\n\nDescripción:\n${descripcion}`
    );
    window.location.href = `mailto:${CORREO}?subject=${asunto}&body=${cuerpo}`;
    setEnviado(true);
  }

  return (
    <div className="card" style={{ maxWidth: 560 }}>
      <form onSubmit={enviar} className="form">
        <div className="field">
          <label htmlFor="tipo">Tipo de solicitud</label>
          <select id="tipo" name="tipo" defaultValue={TIPOS[0]}>
            {TIPOS.map((t) => (
              <option key={t} value={t}>
                {t}
              </option>
            ))}
          </select>
        </div>
        <div className="field">
          <label htmlFor="nombre">Nombre completo</label>
          <input id="nombre" name="nombre" type="text" required />
        </div>
        <div className="field">
          <label htmlFor="documento">Documento de identidad</label>
          <input id="documento" name="documento" type="text" required />
        </div>
        <div className="field">
          <label htmlFor="correo">Correo electrónico</label>
          <input id="correo" name="correo" type="email" required />
        </div>
        <div className="field">
          <label htmlFor="telefono">Teléfono de contacto</label>
          <input id="telefono" name="telefono" type="tel" />
        </div>
        <div className="field">
          <label htmlFor="descripcion">Descripción</label>
          <textarea id="descripcion" name="descripcion" rows={6} required />
        </div>
        <button type="submit" className="btn btn-primary">
          Enviar PQRS
        </button>
        <p className="muted" style={{ fontSize: "0.85rem" }}>
          Al enviar se abrirá tu cliente de correo con esta información dirigida a {CORREO}. Responderemos dentro de
          los términos que establece la ley para cada tipo de solicitud.
        </p>
        {enviado && <p role="status">Si tu correo no se abrió automáticamente, escríbenos directamente a {CORREO}.</p>}
      </form>
    </div>
  );
}
