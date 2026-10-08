-- Monarca Tickets — un organizador (Polinizador) puede tener VARIOS eventos
-- de FourVenues asignados. Reemplaza el campo unico organizers.fourvenues_event_id
-- (que se conserva como respaldo legacy, ya no se escribe desde el CRM).

create table if not exists organizer_events (
  organizer_id uuid not null references organizers(id) on delete cascade,
  fourvenues_event_id text not null,
  created_at timestamptz not null default now(),
  primary key (organizer_id, fourvenues_event_id)
);

alter table organizer_events enable row level security;

drop policy if exists "organizador ve sus eventos" on organizer_events;
create policy "organizador ve sus eventos" on organizer_events
  for select using (
    organizer_id in (select id from organizers where owner_user_id = auth.uid())
  );

-- Pasa a la tabla nueva el evento unico que ya tenian asignado.
insert into organizer_events (organizer_id, fourvenues_event_id)
select id, fourvenues_event_id
from organizers
where fourvenues_event_id is not null and fourvenues_event_id <> ''
on conflict do nothing;
