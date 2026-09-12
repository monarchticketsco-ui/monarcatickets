"use client";

import { useActionState } from "react";
import { crearLeadEmpresa, type CrearLeadState } from "./actions";

const initialState: CrearLeadState = { status: "idle" };

export function EmpresaLeadForm() {
  const [state, formAction, pending] = useActionState(crearLeadEmpresa, initialState);

  if (state.status === "ok") {
    return (
      <div className="card" style={{ maxWidth: 480 }}>
        <div className="alert-success" role="status">
          <strong>¡Listo! Recibimos tus datos.</strong>
          <p style={{ margin: "8px 0 0" }}>
            Alguien de nuestro equipo comercial te va a contactar pronto. Si prefieres avanzar mas rapido,
            escribenos directo por WhatsApp.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="card" style={{ maxWidth: 480 }}>
      <h3 style={{ marginTop: 0 }}>Cuentanos de tu evento</h3>
      <p className="page-lede" style={{ marginBottom: 16 }}>
        Dejanos tus datos y un asesor de Monarca Tickets te contacta para crear tu cuenta de empresa.
      </p>
      {state.status === "error" && <p role="alert">{state.mensaje}</p>}
      <form action={formAction} className="form">
        <div className="field">
          <label htmlFor="nombre">Nombre completo</label>
          <input id="nombre" name="nombre" type="text" required />
        </div>
        <div className="field">
          <label htmlFor="empresa">Empresa / razon social</label>
          <input id="empresa" name="empresa" type="text" />
        </div>
        <div className="field">
          <label htmlFor="correo">Correo</label>
          <input id="correo" name="correo" type="email" required />
        </div>
        <div className="field">
          <label htmlFor="telefono">Telefono / WhatsApp</label>
          <input id="telefono" name="telefono" type="tel" />
        </div>
        <div className="field">
          <label htmlFor="mensaje">Cuentanos de tu evento (opcional)</label>
          <textarea id="mensaje" name="mensaje" rows={3} placeholder="Tipo de evento, fecha estimada, ciudad..." />
        </div>
        <button type="submit" className="btn btn-primary" disabled={pending}>
          {pending ? "Enviando..." : "Enviar solicitud"}
        </button>
      </form>
    </div>
  );
}
