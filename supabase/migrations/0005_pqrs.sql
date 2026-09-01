-- Monarca Tickets — modulo PQRS (peticion/queja/reclamo/sugerencia) y
-- solicitudes de soporte de compra. Backend real para lo que hoy en el
-- sitio web es solo un formulario mailto (app/pqrs, app/soporte), y para
-- que agentes externos (ej. el bot de WhatsApp) puedan radicar en
-- nombre del comprador via la API publica.

create type pqrs_tipo as enum ('peticion', 'queja', 'reclamo', 'sugerencia', 'soporte_compra');
create type pqrs_canal as enum ('sitio_web', 'whatsapp', 'api', 'correo');
create type pqrs_estado as enum ('abierta', 'en_proceso', 'cerrada');

create table pqrs_solicitudes (
  id uuid primary key default gen_random_uuid(),
  tipo pqrs_tipo not null,
  canal pqrs_canal not null default 'sitio_web',
  api_client_id uuid references api_clients(id),
  nombre text not null,
  documento text,
  correo text not null,
  telefono text,
  referencia_orden text,
  mensaje text not null,
  estado pqrs_estado not null default 'abierta',
  created_at timestamptz not null default now()
);

alter table pqrs_solicitudes enable row level security;

-- Solo admin puede leer/gestionar PQRS desde el cliente (anon/authenticated);
-- las inserciones desde el sitio y desde la API las hace el backend con
-- la service role key, que se salta RLS por diseno (igual que orders).
create policy "pqrs_select_admin" on pqrs_solicitudes for select
  using (is_admin());
