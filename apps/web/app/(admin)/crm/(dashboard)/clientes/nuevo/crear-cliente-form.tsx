"use client";

import { useActionState } from "react";
import { crearClienteAdmin, type CrearClienteState } from "../actions";

const initialState: CrearClienteState = { status: "idle" };

export function CrearClienteForm() {
  const [state, formAction, pending] = useActionState(crearClienteAdmin, initialState);

  if (state.status === "ok" && state.password) {
    return (
      <div className="card" style={{ maxWidth: 520 }}>
        <div className="alert-success" role="status">
          <strong>Cuenta creada para {state.fullName}.</strong>
          <p style={{ margin: "8px 0 4px" }}>
            Copia estas credenciales ahora y entregaselas al cliente por un canal privado — la contrasena no se
            vuelve a mostrar:
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
    <div className="card" style={{ maxWidth: 480 }}>
      {state.status === "error" && <p role="alert">{state.mensaje}</p>}
      <form action={formAction} className="form">
        <div className="field">
          <label htmlFor="full_name">Nombre completo</label>
          <input id="full_name" name="full_name" type="text" required />
        </div>
        <div className="field">
          <label htmlFor="correo">Correo (sera su usuario de acceso)</label>
          <input id="correo" name="correo" type="email" required />
        </div>
        <div className="field">
          <label htmlFor="phone">Telefono (opcional)</label>
          <input id="phone" name="phone" type="tel" />
        </div>
        <button type="submit" className="btn btn-primary" disabled={pending}>
          {pending ? "Creando..." : "Crear cliente"}
        </button>
      </form>
    </div>
  );
}
