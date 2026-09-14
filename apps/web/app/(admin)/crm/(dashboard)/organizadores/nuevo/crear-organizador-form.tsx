"use client";

import { useActionState } from "react";
import { crearOrganizadorAdmin, type CrearOrganizadorState } from "../actions";

const initialState: CrearOrganizadorState = { status: "idle" };

export function CrearOrganizadorForm({
  defaults,
}: {
  defaults: {
    legalName?: string;
    nit?: string;
    correo?: string;
    contactName?: string;
    contactPhone?: string;
    leadId?: string;
  };
}) {
  const [state, formAction, pending] = useActionState(crearOrganizadorAdmin, initialState);

  if (state.status === "ok" && state.password) {
    return (
      <div className="card" style={{ maxWidth: 520 }}>
        <div className="alert-success" role="status">
          <strong>Cuenta creada para {state.legalName}.</strong>
          <p style={{ margin: "8px 0 4px" }}>
            Copia estas credenciales ahora y entregaselas al cliente por un canal privado (WhatsApp, correo) — la
            contrasena no se vuelve a mostrar:
          </p>
          <p style={{ margin: "4px 0" }}>
            Correo: <code className="key-reveal">{state.correo}</code>
          </p>
          <p style={{ margin: "4px 0" }}>
            Contrasena temporal: <code className="key-reveal">{state.password}</code>
          </p>
          <p className="key-reveal-note">
            El cliente puede ingresar en /login con estos datos y luego cambiar su contrasena desde su cuenta.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="card" style={{ maxWidth: 520 }}>
      {state.status === "error" && <p role="alert">{state.mensaje}</p>}
      <form action={formAction} className="form">
        <input type="hidden" name="lead_id" defaultValue={defaults.leadId ?? ""} />
        <div className="field">
          <label htmlFor="legal_name">Razon social</label>
          <input id="legal_name" name="legal_name" type="text" defaultValue={defaults.legalName ?? ""} required />
        </div>
        <div className="field">
          <label htmlFor="nit">NIT</label>
          <input id="nit" name="nit" type="text" defaultValue={defaults.nit ?? ""} required />
        </div>
        <div className="field">
          <label htmlFor="correo">Correo (sera su usuario de acceso)</label>
          <input id="correo" name="correo" type="email" defaultValue={defaults.correo ?? ""} required />
        </div>
        <div className="form-row" style={{ flexWrap: "wrap" }}>
          <div className="field" style={{ flex: "1 1 200px" }}>
            <label htmlFor="contact_name">Nombre de contacto</label>
            <input id="contact_name" name="contact_name" type="text" defaultValue={defaults.contactName ?? ""} />
          </div>
          <div className="field" style={{ flex: "1 1 160px" }}>
            <label htmlFor="contact_phone">Telefono de contacto</label>
            <input id="contact_phone" name="contact_phone" type="tel" defaultValue={defaults.contactPhone ?? ""} />
          </div>
        </div>
        <div className="form-row" style={{ flexWrap: "wrap" }}>
          <div className="field" style={{ flex: "1 1 220px" }}>
            <label htmlFor="commercial_owner">Responsable comercial (Monarca Tickets)</label>
            <input id="commercial_owner" name="commercial_owner" type="text" placeholder="Nombre del asesor" />
          </div>
          <div className="field" style={{ flex: "1 1 140px" }}>
            <label htmlFor="commission_rate">Ticket Service (%)</label>
            <input id="commission_rate" name="commission_rate" type="number" min={0} max={100} step="0.01" defaultValue={10} />
            <p className="muted" style={{ fontSize: "0.78rem", margin: "4px 0 0" }}>
              Se suma al precio de cada boleto y lo paga el comprador al pagar con Bold.
            </p>
          </div>
        </div>
        <button type="submit" className="btn btn-primary" disabled={pending}>
          {pending ? "Creando..." : "Crear cuenta de empresa"}
        </button>
      </form>
    </div>
  );
}
