-- Monarca Tickets — ficha tecnica del evento, cumplimiento legal (PULEP /
-- responsable) y galeria de imagenes de localidades/zonas del venue que
-- sube el organizador. Todo opcional: un evento existente sigue siendo
-- valido sin llenar nada de esto; se muestra en la pagina publica solo lo
-- que el organizador lleno.

alter table events
  add column if not exists doors_open_at timestamptz,
  add column if not exists min_age integer,
  add column if not exists seating_type text check (seating_type in ('libre', 'numerada')),
  add column if not exists capacity integer,
  add column if not exists food_sale boolean,
  add column if not exists alcohol_sale boolean,
  add column if not exists wheelchair_accessible boolean,
  add column if not exists pregnant_allowed boolean,
  add column if not exists venue_address text,
  add column if not exists lineup text,
  add column if not exists pulep_code text,
  add column if not exists responsable_razon_social text,
  add column if not exists responsable_nit text,
  add column if not exists responsable_direccion text,
  add column if not exists responsable_email text,
  add column if not exists terms_extra text;

-- ---------------------------------------------------------------------
-- event_location_images — galeria de imagenes de localidades/zonas/mapas
-- del venue que sube el organizador (recomendado 1080x1080). Se muestran
-- en la pagina publica del evento, debajo del mapa de ubicacion.
-- ---------------------------------------------------------------------
create table event_location_images (
  id uuid primary key default gen_random_uuid(),
  event_id uuid not null references events(id) on delete cascade,
  image_url text not null,
  created_at timestamptz not null default now()
);

alter table event_location_images enable row level security;

-- select: publico ve las de eventos visibles; el organizador ve las suyas
-- en cualquier estado. Insert/delete solo desde Server Actions con la
-- service-role key (ya validan requireOrganizer() + dueno del evento),
-- por eso no hace falta policy de insert/delete para el rol autenticado.
create policy "event_location_images_select_public_or_owner" on event_location_images for select
  using (
    event_id in (select id from events where status in ('publicado','en_venta','finalizado'))
    or event_id in (
      select e.id from events e
      join organizers o on o.id = e.organizer_id
      where o.owner_user_id = auth.uid()
    )
    or is_admin()
  );

-- ---------------------------------------------------------------------
-- Bucket publico de storage para las imagenes de localidades. La subida
-- la hace el Server Action con la service-role key (se salta RLS de
-- storage), asi que el bucket no necesita policies de insert desde el
-- cliente — solo queda publico para lectura (servir las imagenes).
-- ---------------------------------------------------------------------
insert into storage.buckets (id, name, public)
values ('event-media', 'event-media', true)
on conflict (id) do nothing;
