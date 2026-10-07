-- =====================================================================
-- Monarca Tickets — limpieza de datos DEMO en Supabase
-- Ejecutar a mano en el editor SQL de Supabase (nadie lo corre por ti).
--
-- Por que existe: desde que FourVenues es el motor unico, las tablas
-- locales de eventos/ordenes ya no alimentan el sitio. Lo que queda son
-- datos de demostracion. Este script borra SOLO lo que cuelga de los
-- organizadores semilla (NIT 900111222-1 a -6). NO toca: api_clients (la
-- llave del bot de WhatsApp), pqrs_solicitudes, empresa_leads, profiles,
-- ni ningun organizador real.
--
-- Orden de uso:
--   PASO 1: corre los SELECT y confirma que todo es demo.
--   PASO 2: corre el bloque de borrado tal cual (termina en ROLLBACK, no
--           borra nada: solo te muestra cuantas filas borraria).
--   PASO 3: si los conteos son los esperados, cambia ROLLBACK por COMMIT
--           y vuelve a correr el bloque completo.
-- =====================================================================

-- ---------------------------------------------------------------------
-- PASO 1 — mirar antes de borrar
-- ---------------------------------------------------------------------
select id, legal_name, nit, owner_user_id, created_at
from organizers
where nit like '900111222-%'
order by nit;

-- Organizadores que NO son semilla (estos se quedan; revisalos tu):
select id, legal_name, nit, fourvenues_event_id
from organizers
where nit not like '900111222-%'
order by created_at;

select e.id, e.name, e.status, e.starts_at, o.legal_name
from events e
join organizers o on o.id = e.organizer_id
where o.nit like '900111222-%'
order by e.starts_at;

select
  (select count(*) from events)       as eventos_total,
  (select count(*) from orders)       as ordenes_total,
  (select count(*) from tickets)      as boletos_locales_total,
  (select count(*) from orders o join events e on e.id = o.event_id
     join organizers g on g.id = e.organizer_id
     where g.nit like '900111222-%')  as ordenes_de_demo;

-- Ordenes que NO cuelgan de un organizador semilla (revisa que no haya
-- ventas reales aqui; si las hay, no uses el PASO 2/3 sin hablar antes):
select o.id, o.status, o.total_cop, o.created_at, e.name as evento
from orders o
join events e on e.id = o.event_id
join organizers g on g.id = e.organizer_id
where g.nit not like '900111222-%'
order by o.created_at desc;

-- ---------------------------------------------------------------------
-- PASO 2/3 — borrado (en transaccion; por defecto hace ROLLBACK)
-- ---------------------------------------------------------------------
begin;

create temp table _demo_orgs on commit drop as
  select id from organizers where nit like '900111222-%';

create temp table _demo_events on commit drop as
  select id from events where organizer_id in (select id from _demo_orgs);

create temp table _demo_orders on commit drop as
  select id from orders where event_id in (select id from _demo_events);

delete from scan_logs
 where ticket_id in (
   select t.id from tickets t
   join order_items oi on oi.id = t.order_item_id
   where oi.order_id in (select id from _demo_orders));

delete from tickets
 where order_item_id in (select id from order_items where order_id in (select id from _demo_orders));

delete from invoices
 where order_id in (select id from _demo_orders)
    or organizer_id in (select id from _demo_orgs);

delete from order_items where order_id in (select id from _demo_orders);
delete from orders       where id       in (select id from _demo_orders);

delete from payout_ledger
 where organizer_id in (select id from _demo_orgs)
    or event_id     in (select id from _demo_events);

-- ticket_types y event_location_images se borran solas (on delete cascade).
delete from events     where id in (select id from _demo_events);
delete from organizers where id in (select id from _demo_orgs);

-- Cuantas filas quedan (para confirmar):
select
  (select count(*) from organizers where nit like '900111222-%') as organizadores_demo_restantes,
  (select count(*) from events)  as eventos_restantes,
  (select count(*) from orders)  as ordenes_restantes;

rollback;   -- <-- cambia a COMMIT cuando los conteos sean los esperados
