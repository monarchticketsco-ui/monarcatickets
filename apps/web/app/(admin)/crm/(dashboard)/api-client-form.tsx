"use client";

import { useActionState } from "react";
import { crearApiCliente, type CrearApiClienteState } from "./actions";
import { SCOPES_DISPONIBLES } from "@/lib/api-scopes";

const initialState: CrearApiClienteState = { status: "idle" };

export function ApiClientForm() {
  const [state, formAction, pending] = useActionState(crearApiCliente, initialState);

  return (
    <div className="card">
      <h3 style={{ marginTop: 0 }}>Generar nueva credencial</h3>
      <p className="page-lede" style={{ marginBottom: 16 }}>
        Crea una llave de API para un integrador externo (por ejemplo, el bot de WhatsApp). La
        llave solo se muestra una vez aqui — copiala y entregala por un canal privado, nunca por
        el repositorio ni por chats publicos.
      </p>

      {state.status === "ok" && state.apiKey && (
        <div className="alert-success" role="status">
          <strong>Credencial creada para {state.companyName}.</strong>
          <p style={{ margin: "8px 0 4px" }}>Copia esta llave ahora — no se volvera a mostrar:</p>
          <code className="key-reveal">{state.apiKey}</code>
          <p className="key-reveal-note">Scopes asignados: {state.scopes?.join(", ")}</p>
        </div>
      )}

      {state.status === "error" && <div role="alert">{state.mensaje}</div>}

      <form action={formAction} className="form" style={{ maxWidth: 480 }}>
        <div className="field">
          <label htmlFor="company_name">Nombre del integrador</label>
          <input
            type="text"
            id="company_name"
            name="company_name"
            placeholder="Bot WhatsApp Monarca"
            required
          />
        </div>

        <fieldset>
          <legend>Scopes (permisos)</legend>
          {SCOPES_DISPONIBLES.map((scope) => (
            <label key={scope.value}>
              <input type="checkbox" name="scopes" value={scope.value} />
              {scope.label} <code>{scope.value}</code>
            </label>
          ))}
        </fieldset>

        <div className="field">
          <label htmlFor="rate_limit_per_min">Limite de solicitudes por minuto</label>
          <input
            type="number"
            id="rate_limit_per_min"
            name="rate_limit_per_min"
            defaultValue={60}
            min={1}
          />
        </div>

        <button type="submit" className="btn btn-primary" disabled={pending}>
          {pending ? "Generando..." : "Generar credencial"}
        </button>
      </form>
    </div>
  );
}
