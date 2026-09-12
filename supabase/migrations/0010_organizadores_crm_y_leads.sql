-- Monarca Tickets — datos de CRM para organizadores + leads del portal
-- empresas. El portal empresas deja de permitir auto-registro: la cuenta
-- la crea un admin desde el CRM (ver /crm/organizadores/nuevo) despues de
-- contactar al cliente. El formulario publico de /empresas ahora solo
-- capta datos de un cliente potencial (lead), no crea cuentas.

-- ---------------------------------------------------------------------
-- organizers: datos de contacto y responsable comercial para la ficha
-- tipo CRM (ademas de legal_name/nit/dian_status/commission_rate que ya
-- existian).
-- ---------------------------------------------------------------------
alter table organizers
  add column if not exists contact_name text,
  add column if not exists contact_phone text,
  add column if not exists contact_email text,
  add column if not exists commercial_owner text, -- responsable comercial de Monarca Tickets para esta cuenta
  add column if not exists notas text;

-- ---------------------------------------------------------------------
-- empresa_leads: "quiero vender mi evento con ustedes" desde /empresas.
-- Solo el admin los puede ver/gestionar desde el CRM; el insert publico
-- lo hace la server action con la service role key (igual que pqrs).
-- ---------------------------------------------------------------------
create type lead_estado as enum ('nuevo', 'contactado', 'convertido', 'descartado');

create table empresa_leads (
  id uuid primary key default gen_random_uuid(),
  nombre text not null,
  empresa text,
  correo text not null,
  telefono text,
  mensaje text,
  estado lead_estado not null default 'nuevo',
  created_at timestamptz not null default now()
);

alter table empresa_leads enable row level security;

create policy "empresa_leads_select_admin" on empresa_leads for select
  using (is_admin());

create policy "empresa_leads_update_admin" on empresa_leads for update
  using (is_admin());
