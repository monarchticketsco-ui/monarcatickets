-- Monarca Tickets — vincula cada organizador (Polinizador) con el evento
-- de FourVenues que administra. Desde la migracion a FourVenues como
-- motor unico, los organizadores ya no crean eventos localmente: Monarca
-- (Management) les asigna el evento de FourVenues que les corresponde, y
-- el Panel Polinizador lee ese evento (y sus tickets) directo de la API.

alter table organizers
  add column if not exists fourvenues_event_id text;

comment on column organizers.fourvenues_event_id is
  'ID del evento en FourVenues (channels-service) que este organizador/Polinizador administra. Null = aun no asignado.';
