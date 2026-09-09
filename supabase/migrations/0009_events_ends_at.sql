-- Monarca Tickets — fecha de terminacion del evento (distinta de starts_at
-- y de ticket_types.sale_ends_at, que es cuando dejan de venderse boletos
-- de un tipo especifico). Opcional: eventos existentes quedan validos sin
-- llenarla.
alter table events
  add column if not exists ends_at timestamptz;
